import { useState } from "react";

const TOPICS = [
  { id: "ethics",   icon: "⚖️",  label: "Ethics & Standards",          sub: "Standards I–VII, GIPS, Professional Conduct",
    chapters: [
      { title: "Standards of Professional Conduct", ch: "Ch. 1" },
      { title: "Guidance for Standards I–III",       ch: "Ch. 2" },
      { title: "Guidance for Standards IV–VII",      ch: "Ch. 3" },
      { title: "GIPS Overview",                      ch: "Ch. 4" },
    ]
  },
  { id: "quant",    icon: "📐",  label: "Quantitative Methods",        sub: "TVM, Statistics, Probability, Regression",
    chapters: [
      { title: "Time Value of Money",    ch: "Ch. 1" },
      { title: "Probability Concepts",   ch: "Ch. 2" },
      { title: "Common Distributions",   ch: "Ch. 3" },
      { title: "Hypothesis Testing",     ch: "Ch. 4" },
      { title: "Linear Regression",      ch: "Ch. 5" },
    ]
  },
  { id: "economics", icon: "🌐", label: "Economics",                   sub: "Macro, Micro, Monetary Policy, FX",
    chapters: [
      { title: "Demand & Supply",        ch: "Ch. 1" },
      { title: "GDP & Business Cycles",  ch: "Ch. 2" },
      { title: "Monetary & Fiscal Policy", ch: "Ch. 3" },
      { title: "Currency & FX",          ch: "Ch. 4" },
    ]
  },
  { id: "fsa",      icon: "📊",  label: "Financial Statement Analysis", sub: "Income, Balance Sheet, Cash Flow, Ratios",
    chapters: [
      { title: "Income Statement",       ch: "Ch. 1" },
      { title: "Balance Sheet",          ch: "Ch. 2" },
      { title: "Cash Flow Statement",    ch: "Ch. 3" },
      { title: "Financial Ratios",       ch: "Ch. 4" },
      { title: "IFRS vs GAAP",           ch: "Ch. 5" },
    ]
  },
  { id: "corpfin",  icon: "🏦",  label: "Corporate Finance",           sub: "WACC, NPV, Capital Structure, Dividends",
    chapters: [
      { title: "Capital Budgeting",      ch: "Ch. 1" },
      { title: "WACC & Cost of Capital", ch: "Ch. 2" },
      { title: "Capital Structure",      ch: "Ch. 3" },
      { title: "Dividend Policy",        ch: "Ch. 4" },
    ]
  },
  { id: "equity",   icon: "📈",  label: "Equity Investments",          sub: "Valuation, EMH, DDM, Multiples",
    chapters: [
      { title: "Market Organization",    ch: "Ch. 1" },
      { title: "Market Efficiency",      ch: "Ch. 2" },
      { title: "Equity Valuation",       ch: "Ch. 3" },
      { title: "DDM & Gordon Model",     ch: "Ch. 4" },
    ]
  },
  { id: "fi",       icon: "📉",  label: "Fixed Income",                sub: "Duration, Convexity, Yield Curves, Credit",
    chapters: [
      { title: "Bond Pricing & Valuation", ch: "Ch. 1" },
      { title: "Duration & Convexity",     ch: "Ch. 2" },
      { title: "Yield Curve Theories",     ch: "Ch. 3" },
      { title: "Credit Risk & Spreads",    ch: "Ch. 4" },
      { title: "MBS & Structured Products", ch: "Ch. 5" },
    ]
  },
  { id: "deriv",    icon: "⚡",  label: "Derivatives",                 sub: "Options, Futures, Swaps, Greeks",
    chapters: [
      { title: "Forwards & Futures",       ch: "Ch. 1" },
      { title: "Options Basics",           ch: "Ch. 2" },
      { title: "Option Strategies",        ch: "Ch. 3" },
      { title: "Swaps",                    ch: "Ch. 4" },
      { title: "Option Pricing (BSM)",     ch: "Ch. 5" },
    ]
  },
  { id: "pm",       icon: "🎯",  label: "Portfolio Management",        sub: "CAPM, MPT, Risk, Asset Allocation",
    chapters: [
      { title: "Portfolio Math & Risk",    ch: "Ch. 1" },
      { title: "CAPM & SML",              ch: "Ch. 2" },
      { title: "Modern Portfolio Theory",  ch: "Ch. 3" },
      { title: "Asset Allocation & IPS",   ch: "Ch. 4" },
    ]
  },
];

function PdfThumb({ color = "blue" }) {
  const colors = {
    blue:  { bg: "#eff6ff", border: "#bfdbfe", line: "#1a56db", line2: "#bfdbfe" },
    amber: { bg: "#111",    border: "#f0c040", line: "#f0c040", line2: "#f0c04040" },
  };
  const c = colors[color];
  return (
    <div style={{ width: 36, height: 46, background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 4, display: "flex", flexDirection: "column", padding: 5, gap: 3, flexShrink: 0 }}>
      {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 2, background: i % 2 === 0 ? c.line : c.line2, borderRadius: 1, width: i % 3 === 0 ? "60%" : "100%" }} />)}
    </div>
  );
}

export default function StudyTools({ onSaveToLibrary }) {
  const [selected, setSelected] = useState(null);

  const topicRowStyle = { background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "border-color .15s" };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 860, width: "100%", margin: "0 auto" }}>
      {!selected ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--muted)", letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 12 }}>CFA Level 1 — Select a topic</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TOPICS.map(t => (
                <div key={t.id} style={topicRowStyle}
                  onClick={() => setSelected(t)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#1a56db"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, background: "var(--primary-light)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{t.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)" }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{t.sub}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--muted)" }}>›</div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--primary)", background: "none", border: "none", cursor: "pointer", marginBottom: 14, fontFamily: "var(--font-sans)", padding: 0 }}>‹ Back to topics</button>
          <div style={{ fontSize: 18, fontWeight: 500, color: "var(--foreground)", marginBottom: 16, fontFamily: "var(--font-serif)" }}>{selected.icon} {selected.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {selected.chapters.map((ch, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <PdfThumb color="blue" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", marginBottom: 3 }}>{ch.title}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{ch.ch} · 1 page · PDF summary</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onSaveToLibrary({ id: Date.now(), title: ch.title, type: "study-tool", topic: selected.label, chapter: ch.ch, exam: "CFA Level 1", date: new Date().toLocaleDateString(), tags: ["CFA L1", selected.label, ch.ch] })}
                    style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--muted)", border: "0.5px solid var(--border)", fontFamily: "var(--font-sans)" }}>🔖 Save</button>
                  <button style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, cursor: "pointer", background: "var(--primary)", color: "#fff", border: "none", fontFamily: "var(--font-sans)" }}>Open PDF</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
