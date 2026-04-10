import { useState, useRef } from "react";

function PdfThumb({ color = "blue" }) {
  const c = color === "amber"
    ? { bg: "#111", border: "#f0c040", a: "#f0c040", b: "#f0c04040" }
    : color === "green"
    ? { bg: "#f0fdf4", border: "#86efac", a: "#16a34a", b: "#bbf7d0" }
    : { bg: "#eff6ff", border: "#bfdbfe", a: "#1a56db", b: "#bfdbfe" };
  return (
    <div style={{ width: 32, height: 40, background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 4, display: "flex", flexDirection: "column", padding: 4, gap: 2, flexShrink: 0 }}>
      {[1,2,3,4,5].map(i => <div key={i} style={{ height: 2, background: i % 2 === 0 ? c.a : c.b, borderRadius: 1, width: i % 3 === 0 ? "60%" : "100%" }} />)}
    </div>
  );
}

function Tag({ children, color = "gray" }) {
  const colors = {
    blue:  { bg: "#eff6ff", color: "#1a56db", border: "#bfdbfe" },
    amber: { bg: "#111",    color: "#f0c040", border: "#f0c04060", fontFamily: "var(--font-mono)", fontSize: 9 },
    green: { bg: "#f0fdf4", color: "#16a34a", border: "#86efac" },
    gray:  { bg: "var(--background)", color: "var(--muted)", border: "var(--border)" },
  };
  const c = colors[color];
  return <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: c.bg, color: c.color, border: `0.5px solid ${c.border}`, fontFamily: c.fontFamily || "var(--font-sans)" }}>{children}</span>;
}

export default function Library({ items, setItems }) {
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"];
    if (!allowed.includes(file.type)) { alert("Please upload a PDF or Word document."); return; }
    const ext = file.name.split(".").pop().toUpperCase();
    setItems(prev => [{ id: Date.now(), title: file.name.replace(/\.[^.]+$/, ""), type: "personal-note", exam: "CFA Level 1", date: new Date().toLocaleDateString(), fileType: ext, tags: ["Personal Note", ext], public: true }, ...prev]);
    setShowUpload(false);
    e.target.value = "";
  };

  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const sections = [
    { key: "personal-note", label: "📝 Personal Notes",  color: "green", badge: "Public" },
    { key: "cheatsheet",    label: "⚡ Cheat Sheets",     color: "amber" },
    { key: "ai-response",   label: "💬 Saved Responses",  color: "blue" },
    { key: "study-tool",    label: "📚 Study Tools",      color: "blue" },
  ];

  // Demo items if library is empty
  const allItems = items.length > 0 ? items : [
    { id: 1, title: "Duration & Convexity", type: "cheatsheet", exam: "CFA Level 1", date: "Apr 10", tags: ["CFA L1", "Fixed Income"], isCheatSheet: true },
    { id: 2, title: "Fixed Income Summary", type: "study-tool", exam: "CFA Level 1", date: "Apr 9", tags: ["CFA L1", "Fixed Income", "Ch. 1-5"] },
    { id: 3, title: "My Ethics Notes Week 3", type: "personal-note", exam: "CFA Level 1", date: "Apr 8", tags: ["Personal Note", "PDF"], fileType: "PDF", public: true },
  ];

  const itemCard = (item, color) => (
    <div key={item.id} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
      <PdfThumb color={color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--foreground)", marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          {item.tags?.map(t => <Tag key={t} color={t === "Personal Note" ? "green" : t.includes("CFA") || t.includes("EFA") || t.includes("CPA") ? "blue" : t === "AI Response" ? "amber" : "gray"}>{t}</Tag>)}
          {item.public && <Tag color="green">🌐 Public</Tag>}
        </div>
      </div>
      <div style={{ fontSize: 10, color: "var(--muted)", flexShrink: 0 }}>{item.date}</div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <button style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, cursor: "pointer", background: "var(--primary)", color: "#fff", border: "none", fontFamily: "var(--font-sans)" }}>Open</button>
        <button onClick={() => deleteItem(item.id)} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 5, cursor: "pointer", background: "transparent", color: "var(--muted)", border: "0.5px solid var(--border)", fontFamily: "var(--font-sans)" }}>🗑</button>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 860, width: "100%", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 700, color: "var(--foreground)" }}>My Library</div>
        <div style={{ fontSize: 11, color: "var(--muted)", background: "var(--background)", padding: "2px 10px", borderRadius: 10, border: "0.5px solid var(--border)" }}>{allItems.length} items</div>
      </div>

      {sections.map(section => {
        const sectionItems = allItems.filter(i => i.type === section.key);
        return (
          <div key={section.key} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8, borderBottom: "0.5px solid var(--border)", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.4px" }}>{section.label}</span>
                {section.badge && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#f0fdf4", color: "#16a34a", border: "0.5px solid #86efac" }}>{section.badge}</span>}
              </div>
              {section.key === "personal-note" && (
                <button onClick={() => setShowUpload(!showUpload)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 6, background: "var(--primary)", color: "#fff", border: "none", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>+ Upload</button>
              )}
              {section.key !== "personal-note" && <span style={{ fontSize: 10, color: "var(--muted)" }}>{sectionItems.length} items</span>}
            </div>

            {/* Upload drop zone */}
            {section.key === "personal-note" && showUpload && (
              <div onClick={() => fileRef.current?.click()} style={{ border: "1.5px dashed var(--border)", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "var(--surface)", cursor: "pointer", marginBottom: 10, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a56db"; e.currentTarget.style.background = "#eff6ff"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--surface)"; }}>
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleUpload} />
                <div style={{ fontSize: 24 }}>📂</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>Drop your file here or click to browse</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Will appear publicly on your profile</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                  {["PDF", "DOCX"].map(t => <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "var(--background)", color: "var(--muted)", border: "0.5px solid var(--border)" }}>{t}</span>)}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sectionItems.length > 0 ? sectionItems.map(item => itemCard(item, section.color)) : (
                <div style={{ textAlign: "center", padding: "20px", color: "var(--muted)", fontSize: 12, background: "var(--surface)", borderRadius: 10, border: "0.5px dashed var(--border)" }}>
                  {section.key === "personal-note" ? "Upload your first personal note above" : `No ${section.label.split(" ").slice(1).join(" ").toLowerCase()} yet`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
