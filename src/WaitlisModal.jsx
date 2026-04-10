import { useState } from "react";

const AIRTABLE_BASE  = import.meta.env.VITE_AIRTABLE_BASE;
const AIRTABLE_TABLE = import.meta.env.VITE_AIRTABLE_TABLE;
const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;

export default function WaitlistModal({ done, onSubmit, onClose }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [exam, setExam]       = useState("");
  const [error, setError]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  const exams = [
    { id: "cfa1", label: "CFA Level 1" }, { id: "cfa2", label: "CFA Level 2" },
    { id: "cfa3", label: "CFA Level 3" }, { id: "cpa",  label: "CPA" },
    { id: "efa",  label: "EFA" },         { id: "other",label: "Other" },
  ];

  const inp = { width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", color: "#0f172a", fontFamily: "var(--font-sans)", outline: "none", boxSizing: "border-box", transition: "border-color .15s" };

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email."); return; }
    if (!exam) { setError("Please select your exam."); return; }
    setError(""); setSubmitting(true);
    try {
      const examLabel = exams.find(e => e.id === exam)?.label || exam;
      const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ records: [{ fields: { Name: name, Email: email, Exam: examLabel } }] }),
      });
      if (!res.ok) throw new Error("Airtable error");
      onSubmit();
    } catch { setError("Something went wrong. Please try again."); }
    finally { setSubmitting(false); }
  };

  const overlay = { position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(15,23,42,0.55)", backdropFilter: "blur(6px)", padding: "20px", fontFamily: "var(--font-sans)" };
  const card = { width: "100%", maxWidth: "480px", background: "#fff", borderRadius: "20px", boxShadow: "0 24px 80px rgba(15,23,42,0.18)", overflow: "hidden", animation: "slideUp .4s cubic-bezier(.16,1,.3,1)" };

  return (
    <div style={overlay}>
      <div style={card}>
        {!done ? (
          <>
            <div style={{ background: "linear-gradient(135deg,#1a56db,#1e3a8a)", padding: "32px 32px 28px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
              <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.2)", borderRadius: "20px", padding: "4px 12px", marginBottom: "16px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.9)", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Beta Launching Soon</span>
              </div>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 22, fontFamily: "var(--font-serif)", color: "#fff", fontWeight: 700 }}>Σ</div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#fff", fontWeight: 700, marginBottom: 8 }}>Join the FinanceIQ Beta</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.75)", lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>The AI tutor built for CFA, CPA & EFA candidates. Be first to access when we launch.</p>
            </div>
            <div style={{ padding: "28px 32px 32px" }}>
              {[{ label: "Full Name", type: "text", val: name, set: setName, ph: "Jane Smith" }, { label: "Email Address", type: "email", val: email, set: setEmail, ph: "you@example.com" }].map(f => (
                <div key={f.label} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={f.val}
                    onChange={e => { f.set(e.target.value); setError(""); }}
                    style={inp}
                    onFocus={e => e.target.style.borderColor = "#1a56db"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>I'm preparing for</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {exams.map(e => (
                    <button key={e.id} onClick={() => { setExam(e.id); setError(""); }} style={{ padding: "8px 6px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1.5px solid ${exam === e.id ? "#1a56db" : "#e2e8f0"}`, background: exam === e.id ? "#dbeafe" : "#fff", color: exam === e.id ? "#1a56db" : "#475569", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all .15s" }}>{e.label}</button>
                  ))}
                </div>
              </div>
              {error && <div style={{ marginBottom: 14, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#b91c1c" }}>{error}</div>}
              <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", padding: 13, background: submitting ? "#93c5fd" : "#1a56db", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)", boxShadow: "0 4px 14px rgba(26,86,219,.3)", transition: "all .15s" }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#1e3a8a"; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#1a56db"; }}>
                {submitting ? "Saving..." : "Join the Waitlist →"}
              </button>
              <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 12 }}>No spam. We'll only email you when we launch.</p>
            </div>
          </>
        ) : (
          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✓</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "#0f172a", fontWeight: 700, marginBottom: 10 }}>You're on the list!</h2>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, maxWidth: 340, margin: "0 auto 8px" }}>We're launching the FinanceIQ beta soon. You'll receive an email with early access details.</p>
            <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28 }}>Keep an eye on your inbox 📬</p>
            <div style={{ padding: "12px 16px", background: "#f0f4f9", borderRadius: 10, fontSize: 12, color: "#475569", lineHeight: 1.6, marginBottom: 20 }}>
              In the meantime, feel free to <strong>explore a preview</strong> of the chat — full features available at launch.
            </div>
            <button onClick={onClose} style={{ padding: "10px 28px", background: "#1a56db", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e3a8a"}
              onMouseLeave={e => e.currentTarget.style.background = "#1a56db"}>
              Got it, thanks!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
