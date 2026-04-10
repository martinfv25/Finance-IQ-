import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are FinanceIQ — an expert AI tutor for finance, investment, and economics serving CFA candidates, college students, and MBA students.

Always be concise and get straight to the point. Do not use fluff or polite filler but still provide answers with explanations. If a short answer suffices, provide it.

Your expertise: CFA (Levels 1-3), Corporate Finance, Investment Theory, Financial Mathematics, Economics (macro/micro), FSA (IFRS/GAAP), Derivatives, Fixed Income, Portfolio Management.

HOW YOU RESPOND:
1. **Formula first**: Show key equation using $...$ inline or $$...$$ for block. Define variables briefly.
2. **Direct answer**: Solve or explain in the fewest words possible.
3. **One key insight**: Most important takeaway or exam tip.

FORMATTING: Bold key terms. Use 3-5 bullet points max. No walls of text.
If asked something outside finance/economics/investing, redirect back to your domain.`;

const EXAM_ADDENDUM = {
  cfa1: "User is preparing for CFA Level 1. Focus on foundational concepts, LOS, multiple-choice strategy.",
  cfa2: "User is preparing for CFA Level 2. Focus on valuation models, vignette format strategy.",
  cfa3: "User is preparing for CFA Level 3. Focus on portfolio management, IPS, essay strategy.",
  cpa1: "User is preparing for CPA FAR. Focus on US GAAP, governmental accounting, journal entries.",
  cpa2: "User is preparing for CPA AUD. Focus on audit risk, internal controls, PCAOB standards.",
  efa:  "User is preparing for EFA. Focus on valuation, European regulations, MiFID II.",
};

const QUICK_PROMPTS = [
  { icon: "📐", label: "TVM & DCF",      prompt: "Teach me TVM and DCF — show the key formulas and a worked example." },
  { icon: "📈", label: "CAPM",           prompt: "Teach me CAPM — formula, beta, SML, and CFA exam tips." },
  { icon: "📉", label: "Bond Duration",  prompt: "Explain Macaulay duration, Modified duration, and convexity with formulas." },
  { icon: "🏦", label: "WACC",           prompt: "Walk me through WACC — formula, components, and capital budgeting use." },
  { icon: "⚡", label: "Black-Scholes",  prompt: "Explain the Black-Scholes model — formula, inputs, and the Greeks." },
  { icon: "🎯", label: "NPV vs IRR",     prompt: "Compare NPV and IRR — when do they conflict and which to use?" },
];

const SESSION_TOKEN_LIMIT = 50000;
const QUESTION_LIMIT = 5;

function KaTeXContent({ text }) {
  const [katex, setKatex] = useState(null);
  useEffect(() => {
    if (window.katex) { setKatex(window.katex); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";
    script.onload = () => setKatex(window.katex);
    document.head.appendChild(script);
  }, []);

  const renderMath = (latex, block = false) => {
    if (!katex) return <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#1e3a8a", background: "#eff6ff", padding: "1px 5px", borderRadius: 4 }}>{latex}</span>;
    try {
      const html = katex.renderToString(latex, { displayMode: block, throwOnError: false });
      return block
        ? <div style={{ background: "#eff6ff", borderLeft: "3px solid #1a56db", borderRadius: "0 6px 6px 0", padding: "10px 14px", margin: "8px 0", overflowX: "auto" }} dangerouslySetInnerHTML={{ __html: html }} />
        : <span style={{ background: "#eff6ff", padding: "1px 4px", borderRadius: 3 }} dangerouslySetInnerHTML={{ __html: html }} />;
    } catch { return <span>{latex}</span>; }
  };

  const renderSegments = (text) => {
    const parts = []; let rem = text; let k = 0;
    while (rem.length > 0) {
      const bEq = rem.match(/^\$\$(.+?)\$\$/);
      if (bEq) { parts.push(<span key={k++}>{renderMath(bEq[1], true)}</span>); rem = rem.slice(bEq[0].length); continue; }
      const iEq = rem.match(/^\$([^$\n]+?)\$/);
      if (iEq) { parts.push(<span key={k++}>{renderMath(iEq[1])}</span>); rem = rem.slice(iEq[0].length); continue; }
      const bold = rem.match(/^\*\*(.+?)\*\*/);
      if (bold) { parts.push(<strong key={k++}>{bold[1]}</strong>); rem = rem.slice(bold[0].length); continue; }
      const italic = rem.match(/^\*(.+?)\*/);
      if (italic) { parts.push(<em key={k++}>{italic[1]}</em>); rem = rem.slice(italic[0].length); continue; }
      const code = rem.match(/^`(.+?)`/);
      if (code) { parts.push(<code key={k++} style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "#eff6ff", padding: "1px 5px", borderRadius: 3, color: "#1a56db" }}>{code[1]}</code>); rem = rem.slice(code[0].length); continue; }
      const next = rem.search(/\$|\*|`/);
      if (next === -1) { parts.push(rem); break; }
      parts.push(rem.slice(0, next)); rem = rem.slice(next);
    }
    return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
  };

  const renderLine = (line, i) => {
    const bm = line.match(/^\$\$(.+?)\$\$$/);
    if (bm) return <div key={i}>{renderMath(bm[1], true)}</div>;
    if (line.startsWith("### ")) return <h3 key={i} style={{ fontFamily: "var(--font-serif)", fontSize: 14, color: "#1a56db", margin: "10px 0 4px" }}>{renderSegments(line.slice(4))}</h3>;
    if (line.startsWith("## "))  return <h2 key={i} style={{ fontFamily: "var(--font-serif)", fontSize: 15, margin: "10px 0 4px" }}>{renderSegments(line.slice(3))}</h2>;
    if (line.startsWith("# "))   return <h2 key={i} style={{ fontFamily: "var(--font-serif)", fontSize: 16, margin: "10px 0 4px" }}>{renderSegments(line.slice(2))}</h2>;
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) return <li key={i} style={{ margin: "3px 0", paddingLeft: 4 }}><span style={{ color: "#1a56db" }}>• </span>{renderSegments(line.slice(2))}</li>;
    const nm = line.match(/^(\d+)\. (.+)/);
    if (nm) return <li key={i} style={{ listStyleType: "decimal", marginLeft: 18, margin: "3px 0" }}>{renderSegments(nm[2])}</li>;
    if (line === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "10px 0" }} />;
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
    return <p key={i} style={{ margin: "4px 0", lineHeight: 1.7 }}>{renderSegments(line)}</p>;
  };

  return <div style={{ fontSize: 14, color: "var(--foreground)", fontFamily: "var(--font-sans)" }}>{text.split("\n").map((l, i) => renderLine(l, i))}</div>;
}

export default function Chat({ profile, library, onSaveToLibrary }) {
  const [messages, setMessages]   = useState([]);
  const [streamingMsg, setStreamingMsg] = useState("");
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [cheatMode, setCheatMode] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [limitReached, setLimitReached]   = useState(false);
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const sessionTokens = useRef(0);
  const bottomRef  = useRef(null);
  const fileRef    = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamingMsg, loading]);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "52px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const buildPrompt = () => {
    let p = SYSTEM_PROMPT;
    if (profile?.exam?.id) p += `\n\nUSER EXAM PROFILE:\n${EXAM_ADDENDUM[profile.exam.id] || ""}`;
    if (uploadedDoc) p += `\n\nStudent uploaded curriculum PDF: "${uploadedDoc.name}". Reference it directly.`;
    if (cheatMode) p += `\n\nCHEAT SHEET MODE: Structure response as a clean 1-page reference: title, key formulas with variable definitions, bullet concepts, one exam tip.`;
    return p;
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    setUploadLoading(true);
    const base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
    setUploadedDoc({ name: file.name, base64 });
    setMessages(prev => [...prev, { role: "assistant", content: `📄 **${file.name}** uploaded. Ask me anything from it.` }]);
    setUploadLoading(false);
    e.target.value = "";
  };

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    if (budgetExceeded || questionCount >= QUESTION_LIMIT) { setLimitReached(true); return; }
    setInput("");
    const userMsg = { role: "user", content: userText };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true); setStreamingMsg("");

    try {
      const window5 = newMsgs.slice(-5).map((m, idx) => {
        if (uploadedDoc && m.role === "user" && idx === Math.min(newMsgs.length, 5) - 1) {
          return { role: "user", content: [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: uploadedDoc.base64 } }, { type: "text", text: m.content }] };
        }
        return { role: m.role, content: m.content };
      });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-3-5-haiku-latest", max_tokens: 500, stream: true, system: buildPrompt(), messages: window5 }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          try { const j = JSON.parse(line.slice(6)); if (j.type === "content_block_delta" && j.delta?.text) { accumulated += j.delta.text; setStreamingMsg(accumulated); } } catch {}
        }
      }
      const finalReply = accumulated || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: finalReply, isCheatSheet: cheatMode }]);
      setStreamingMsg("");
      setCheatMode(false);
      const newCount = questionCount + 1;
      setQuestionCount(newCount);
      if (newCount >= QUESTION_LIMIT) setLimitReached(true);
      sessionTokens.current += Math.ceil((userText.length + finalReply.length) / 4);
      if (sessionTokens.current > SESSION_TOKEN_LIMIT) setBudgetExceeded(true);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
      setStreamingMsg("");
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const saveToLibrary = (msg, i) => {
    onSaveToLibrary({ id: Date.now(), title: msg.content.slice(0, 60) + "...", content: msg.content, type: msg.isCheatSheet ? "cheatsheet" : "ai-response", exam: profile?.exam?.label, date: new Date().toLocaleDateString(), tags: [profile?.exam?.label, msg.isCheatSheet ? "Cheat Sheet" : "AI Response"] });
    setOpenMenuId(null);
  };

  const s = { background: "var(--surface)", fontFamily: "var(--font-sans)" };

  return (
    <div style={{ ...s, flex: 1, display: "flex", flexDirection: "column", maxWidth: 860, width: "100%", margin: "0 auto", padding: "0 20px", height: "calc(100vh - 60px)", overflow: "hidden" }}>

      {/* Greeting */}
      {messages.length === 0 && !loading && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontFamily: "var(--font-serif)", color: "#fff", fontWeight: 700, marginBottom: 20 }}>Σ</div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>How can I help you today?</h1>
          <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 420, lineHeight: 1.6, marginBottom: 32 }}>Ask me anything — financial equations, CFA problems, economic theory, or concept explanations.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 560 }}>
            {QUICK_PROMPTS.map(p => (
              <button key={p.label} onClick={() => sendMessage(p.prompt)} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 13, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "var(--primary)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
                {p.icon} {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {(messages.length > 0 || loading) && (
        <div onClick={() => setOpenMenuId(null)} style={{ flex: 1, overflowY: "auto", padding: "20px 0 12px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-start" }}>
                {!isUser && <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "var(--font-serif)" }}>Σ</div>}
                <div style={{ maxWidth: "82%", background: isUser ? "var(--primary)" : "#fff", border: isUser ? "none" : "1px solid #e2e8f0", borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px", padding: "12px 16px", color: isUser ? "#fff" : "var(--foreground)", boxShadow: "0 1px 3px rgba(15,23,42,.08)" }}>
                  {isUser ? <p style={{ fontSize: 14, lineHeight: 1.6 }}>{msg.content}</p> : <KaTeXContent text={msg.content} />}
                </div>
                {!isUser && (
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === i ? null : i); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 4, color: "var(--muted)", fontSize: 14, lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--border-light)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>···</button>
                    {openMenuId === i && (
                      <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 28, right: 0, background: "#fff", border: "0.5px solid var(--border)", borderRadius: 10, padding: 4, zIndex: 50, minWidth: 160, boxShadow: "0 8px 24px rgba(15,23,42,.1)" }}>
                        {[{ icon: "🔖", label: "Save to library", action: () => saveToLibrary(msg, i) }, { icon: "⚑", label: "Report issue", action: () => setOpenMenuId(null), danger: true }].map(item => (
                          <div key={item.label} onClick={item.action} style={{ padding: "8px 12px", fontSize: 12, borderRadius: 6, cursor: "pointer", color: item.danger ? "#dc2626" : "var(--foreground)", display: "flex", alignItems: "center", gap: 6 }}
                            onMouseEnter={e => e.currentTarget.style.background = "var(--border-light)"}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            {item.icon} {item.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {isUser && <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, color: "var(--primary)" }}>👤</div>}
              </div>
            );
          })}
          {streamingMsg && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "var(--font-serif)" }}>Σ</div>
              <div style={{ maxWidth: "82%", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", boxShadow: "0 1px 3px rgba(15,23,42,.08)" }}>
                <KaTeXContent text={streamingMsg} />
                <span style={{ display: "inline-block", width: 2, height: 14, background: "var(--primary)", marginLeft: 2, animation: "blink 1s infinite", verticalAlign: "middle" }} />
              </div>
            </div>
          )}
          {loading && !streamingMsg && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: "#fff", fontFamily: "var(--font-serif)" }}>Σ</div>
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "4px 18px 18px 18px", padding: "14px 18px", display: "flex", gap: 5 }}>
                {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", display: "inline-block", animation: `bounce 1.2s infinite ${i*.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input area */}
      <div style={{ padding: "10px 0 20px", borderTop: "1px solid var(--border-light)" }}>
        {/* Progress bar */}
        {!limitReached && questionCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ flex: 1, height: 3, background: "var(--border-light)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(questionCount / QUESTION_LIMIT) * 100}%`, background: "var(--primary)", borderRadius: 2, transition: "width .3s" }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>{questionCount}/{QUESTION_LIMIT} preview questions</span>
          </div>
        )}

        {/* Limit reached */}
        {limitReached && (
          <div style={{ marginBottom: 10, padding: "14px 18px", background: "linear-gradient(135deg,#1a56db,#1e3a8a)", borderRadius: 12, textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>🎓</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>You've reached the beta preview limit!</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>Full unlimited access coming at launch — we'll email you!</div>
          </div>
        )}

        {/* Cheat mode amber indicator */}
        {cheatMode && (
          <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #f0c040", borderRadius: 5, padding: "6px 14px", fontFamily: "var(--font-mono)", fontSize: 12, color: "#f0c040", letterSpacing: "0.5px", textShadow: "0 0 6px #f0c04080" }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#f0c040", animation: "blink 1s step-end infinite" }} />
              GENERATE PDF CHEAT SHEET
            </div>
            <button onClick={() => setCheatMode(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--muted)" }}>×</button>
          </div>
        )}

        {/* Uploaded doc badge */}
        {uploadedDoc && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "6px 12px", background: "var(--primary-light)", border: "1px solid #bfdbfe", borderRadius: 20, width: "fit-content", fontSize: 12 }}>
            <span>📄</span>
            <span style={{ fontWeight: 600, color: "var(--primary)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadedDoc.name}</span>
            <button onClick={() => setUploadedDoc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 14, lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Input card */}
        <div style={{ background: "var(--surface)", borderRadius: 16, border: `1.5px solid ${isFocused ? "var(--primary)" : "var(--border)"}`, boxShadow: isFocused ? "0 0 0 3px rgba(26,86,219,.08), 0 4px 16px rgba(15,23,42,.08)" : "0 2px 8px rgba(15,23,42,.06)", transition: "border-color .2s, box-shadow .2s", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 8px" }}>
            <textarea ref={textareaRef} value={input}
              onChange={e => { setInput(e.target.value); adjustHeight(); }}
              onKeyDown={handleKey}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={budgetExceeded || limitReached}
              placeholder={limitReached ? "Beta preview limit reached — full access coming at launch!" : cheatMode ? "Describe what cheat sheet to generate (e.g. 'Fixed Income formulas')..." : uploadedDoc ? `Ask about "${uploadedDoc.name}"...` : "Ask anything about finance, economics, or your exam..."}
              style={{ width: "100%", border: "none", outline: "none", resize: "none", fontSize: 14, fontFamily: "var(--font-sans)", lineHeight: "1.6", color: cheatMode ? "#f0c040" : "var(--foreground)", background: cheatMode ? "#111" : "transparent", minHeight: 52, maxHeight: 160 }}
            />
          </div>
          <div style={{ padding: "8px 12px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {/* Attach PDF */}
              <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()} disabled={uploadLoading || budgetExceeded}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "none", background: uploadedDoc ? "var(--primary-light)" : "transparent", color: uploadedDoc ? "var(--primary)" : "var(--muted)", fontSize: 12, fontFamily: "var(--font-sans)", fontWeight: 500, cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { if (!uploadedDoc) { e.currentTarget.style.background = "var(--background)"; e.currentTarget.style.color = "var(--foreground)"; }}}
                onMouseLeave={e => { if (!uploadedDoc) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}>
                <span style={{ fontSize: 15 }}>{uploadLoading ? "⏳" : "📎"}</span>
                <span>{uploadedDoc ? "PDF attached" : "Attach PDF"}</span>
              </button>

              {/* Cheat sheet generator */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setCheatMode(!cheatMode)} disabled={budgetExceeded || limitReached}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, fontWeight: 500, fontSize: 12, fontFamily: "var(--font-sans)", cursor: "pointer", transition: "all .15s", border: cheatMode ? "1px solid #f0c040" : "none", background: cheatMode ? "#111" : "transparent", color: cheatMode ? "#f0c040" : "var(--muted)" }}
                  onMouseEnter={e => {
                    if (!cheatMode) { e.currentTarget.style.background = "var(--background)"; e.currentTarget.style.color = "var(--foreground)"; }
                    e.currentTarget.parentNode.querySelector(".tt").style.display = "block";
                  }}
                  onMouseLeave={e => {
                    if (!cheatMode) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }
                    e.currentTarget.parentNode.querySelector(".tt").style.display = "none";
                  }}>
                  <span style={{ fontSize: 13 }}>📄</span>
                  <span>Cheat sheet generator</span>
                </button>
                <div className="tt" style={{ display: "none", position: "absolute", bottom: 36, left: 0, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", width: 220, boxShadow: "0 4px 16px rgba(15,23,42,.12)", zIndex: 100 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", marginBottom: 4 }}>📄 Cheat Sheet Generator</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6 }}>Activate then type your topic. Generates a clean, printable 1-page PDF with formulas & key concepts.</div>
                  <div style={{ marginTop: 6, fontSize: 10, color: "var(--primary)", fontWeight: 500 }}>Click to activate →</div>
                </div>
              </div>
            </div>

            {/* Send button */}
            <button onClick={() => sendMessage()} disabled={loading || !input.trim() || budgetExceeded || limitReached}
              onMouseEnter={() => setIsHoveringBtn(true)}
              onMouseLeave={() => setIsHoveringBtn(false)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "none", background: input.trim() && !budgetExceeded && !limitReached ? "var(--primary)" : "var(--border-light)", color: input.trim() && !budgetExceeded && !limitReached ? "#fff" : "var(--muted-light)", fontSize: 13, fontWeight: 600, fontFamily: "var(--font-sans)", cursor: loading || !input.trim() || budgetExceeded || limitReached ? "not-allowed" : "pointer", transition: "all .15s", transform: isHoveringBtn && input.trim() ? "translateY(-1px)" : "none", boxShadow: isHoveringBtn && input.trim() ? "0 4px 12px rgba(26,86,219,.25)" : "none" }}>
              {loading ? (
                <>{[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,.7)", display: "inline-block", animation: `bounce 1.2s infinite ${i*.2}s` }} />)}<span>Thinking</span></>
              ) : (<><span style={{ fontSize: 15 }}>↑</span><span>Send</span></>)}
            </button>
          </div>
        </div>

        {/* Quick prompts */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p.label} onClick={() => sendMessage(p.prompt)} disabled={loading || limitReached}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted)", fontSize: 12, fontFamily: "var(--font-sans)", cursor: loading || limitReached ? "not-allowed" : "pointer", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "var(--primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <div style={{ textAlign: "center", fontSize: 10.5, color: "var(--muted-light)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
          Shift+Enter for new line · Enter to send · 📎 Attach your curriculum PDF
        </div>
      </div>
    </div>
  );
}
