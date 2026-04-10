import { useState } from "react";

function Avatar({ initials, color, size = 52 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#fff", fontWeight: 500, flexShrink: 0 }}>{initials}</div>;
}

function PdfThumb({ color = "amber" }) {
  const c = color === "amber"
    ? { bg: "#111", border: "#f0c040", a: "#f0c040", b: "#f0c04040" }
    : { bg: "#eff6ff", border: "#bfdbfe", a: "#1a56db", b: "#bfdbfe" };
  return (
    <div style={{ width: 38, height: 48, background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 5, display: "flex", flexDirection: "column", padding: 5, gap: 3, flexShrink: 0 }}>
      {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 2, background: i % 2 === 0 ? c.a : c.b, borderRadius: 1, width: i % 3 === 0 ? "60%" : "100%" }} />)}
    </div>
  );
}

const DEMO_SHARED = [
  { id: 1, title: "Duration & Convexity", type: "cheatsheet", sub: "Fixed Income · 1 page", saves: 47 },
  { id: 2, title: "Yield Curve Theories", type: "cheatsheet", sub: "Fixed Income · 1 page", saves: 31 },
  { id: 3, title: "Fixed Income Full Summary", type: "study-tool", sub: "CFA L1 · Ch. 1–8", saves: 65 },
  { id: 4, title: "My Ethics Study Notes",  type: "personal-note", sub: "PDF · 4 pages", saves: 12 },
];

const DEMO_POSTS = [
  { id: 1, text: "Finally got duration to click for me. Think of it as weighted average time to receive cash flows — once I reframed it everything made sense!", votes: 24, comments: 8, time: "2 hours ago" },
  { id: 2, text: "Study tip for Ethics: always ask 'what would a reasonable CFA charterholder do?' — not what's legal, but what upholds the highest standard.", votes: 52, comments: 14, time: "3 days ago" },
  { id: 3, text: "Anyone have a good mnemonic for the order of the Standards? I keep mixing up I and II on exams.", votes: 11, comments: 6, time: "1 week ago" },
];

export default function UserProfile({ user, onBack, onSaveToLibrary }) {
  const [activeTab, setActiveTab] = useState("pdfs");
  const [following, setFollowing] = useState(false);

  const tabs = [{ key: "pdfs", label: "Shared PDFs" }, { key: "posts", label: "Posts" }];

  return (
    <div style={{ flex: 1, overflowY: "auto", maxWidth: 720, width: "100%", margin: "0 auto" }}>

      {/* Back bar */}
      <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: 8, borderBottom: "0.5px solid var(--border)", background: "var(--surface)" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", padding: 0 }}>‹ Community</button>
        <span style={{ color: "var(--border)", fontSize: 14 }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{user.name}</span>
      </div>

      {/* Profile header */}
      <div style={{ background: "var(--surface)", borderBottom: "0.5px solid var(--border)", padding: "24px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <Avatar initials={user.initials} color={user.color} size={60} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", fontFamily: "var(--font-serif)", marginBottom: 4 }}>{user.name}</div>
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#1a56db", border: "0.5px solid #bfdbfe" }}>📊 {user.exam}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.55 }}>Finance student · Passionate about fixed income · Sharing resources to help the community pass together 📚</div>
          </div>
          <button onClick={() => setFollowing(!following)} style={{ padding: "7px 18px", background: following ? "var(--background)" : "var(--primary)", color: following ? "var(--foreground)" : "#fff", border: following ? "1px solid var(--border)" : "none", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all .15s", flexShrink: 0 }}>
            {following ? "Following" : "Follow"}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 24 }}>
          {[{ n: 12, l: "Shared PDFs" }, { n: 8, l: "Posts" }, { n: 143, l: "Saves by others" }, { n: 89, l: "Followers" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: "var(--foreground)" }}>{s.n}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", background: "var(--surface)", borderBottom: "0.5px solid var(--border)", padding: "0 24px" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: "10px 16px", fontSize: 13, color: activeTab === t.key ? "var(--primary)" : "var(--muted)", background: "none", border: "none", borderBottom: `2px solid ${activeTab === t.key ? "var(--primary)" : "transparent"}`, cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: activeTab === t.key ? 500 : 400, transition: "all .15s" }}>{t.label}</button>
        ))}
      </div>

      {/* PDFs tab */}
      {activeTab === "pdfs" && (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Cheat sheets section */}
          <div style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 4 }}>Cheat sheets</div>
          {DEMO_SHARED.filter(s => s.type === "cheatsheet").map(item => (
            <div key={item.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
              <PdfThumb color="amber" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", marginBottom: 3 }}>{item.title}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#111", color: "#f0c040", border: "0.5px solid #f0c04060", fontFamily: "var(--font-mono)" }}>CHEAT SHEET</span>
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#eff6ff", color: "#1a56db", border: "0.5px solid #bfdbfe" }}>CFA L1</span>
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>↓ {item.saves} saves</div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => onSaveToLibrary({ id: Date.now(), title: item.title, type: "cheatsheet", exam: user.exam, date: new Date().toLocaleDateString(), tags: ["CFA L1", "Cheat Sheet"] })}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--muted)", border: "0.5px solid var(--border)", fontFamily: "var(--font-sans)" }}>🔖 Save</button>
                <button style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "var(--primary)", color: "#fff", border: "none", fontFamily: "var(--font-sans)" }}>Open PDF</button>
              </div>
            </div>
          ))}

          {/* Study tools & personal notes */}
          <div style={{ fontSize: 10, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.6px", textTransform: "uppercase", margin: "8px 0 4px" }}>Summaries & Personal Notes</div>
          {DEMO_SHARED.filter(s => s.type !== "cheatsheet").map(item => (
            <div key={item.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center" }}>
              <PdfThumb color="blue" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", marginBottom: 3 }}>{item.title}</div>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#eff6ff", color: "#1a56db", border: "0.5px solid #bfdbfe" }}>CFA L1</span>
                  {item.type === "personal-note" && <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 3, background: "#f0fdf4", color: "#16a34a", border: "0.5px solid #86efac" }}>📝 Personal Note</span>}
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3 }}>{item.sub}</div>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>↓ {item.saves} saves</div>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button onClick={() => onSaveToLibrary({ id: Date.now(), title: item.title, type: item.type, exam: user.exam, date: new Date().toLocaleDateString(), tags: ["CFA L1"] })}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--muted)", border: "0.5px solid var(--border)", fontFamily: "var(--font-sans)" }}>🔖 Save</button>
                <button style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "var(--primary)", color: "#fff", border: "none", fontFamily: "var(--font-sans)" }}>Open PDF</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts tab */}
      {activeTab === "posts" && (
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {DEMO_POSTS.map(p => (
            <div key={p.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.65, marginBottom: 10 }}>{p.text}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, border: "0.5px solid var(--border)", color: "var(--muted)" }}>▲ {p.votes}</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>💬 {p.comments}</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>{p.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
