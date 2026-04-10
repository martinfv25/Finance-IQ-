import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are FinanceIQ — an expert AI tutor for finance, investment, and economics serving CFA candidates, college students, and MBA students.

Always be concise and get straight to the point. Do not use fluff or polite filler but still provide answers with explanations. If a short answer suffices, provide it.

Your expertise: CFA (Levels 1-3), Corporate Finance, Investment Theory, Financial Mathematics, Economics (macro/micro), FSA (IFRS/GAAP), Derivatives, Fixed Income, Portfolio Management.

HOW YOU RESPOND:
1. **Formula first**: Show key equation using $...$ inline or $$...$$ for block. Define variables briefly.
2. **Direct answer**: Solve or explain in the fewest words possible.
3. **One key insight**: Most important takeaway or exam tip.

FORMATTING: Bold key terms. Use 3–5 bullet points max. No walls of text.

If asked something outside finance/economics/investing, redirect back to your domain.`;

// ── Dynamic topic catalogue keyed by exam + topic ───────────────
const STUDY_TOPICS = {
  cfa1: [
    { id: "ethics",    label: "Ethics & Standards",     icon: "⚖️",  pills: [
      { label: "Standard I — Professionalism",   prompt: "Explain CFA Standard I on Professionalism — key rules, violations, and exam traps." },
      { label: "Standard II — Integrity",        prompt: "Walk me through CFA Standard II on Integrity of Capital Markets with examples." },
      { label: "Standard III — Duties to Clients", prompt: "Explain CFA Standard III duties to clients: loyalty, prudence, fair dealing." },
      { label: "GIPS Overview",                  prompt: "Summarize GIPS compliance requirements and why they matter for CFA Level 1." },
    ]},
    { id: "quant",     label: "Quantitative Methods",   icon: "📐",  pills: [
      { label: "Time Value of Money",   prompt: "Teach me TVM — PV, FV, annuities, perpetuities with formulas and a worked example." },
      { label: "Probability & Stats",  prompt: "Explain probability rules, expected value, variance, and covariance for CFA Level 1." },
      { label: "Hypothesis Testing",   prompt: "Walk me through hypothesis testing: null/alternative, t-test, p-value, Type I & II errors." },
      { label: "Regression Basics",    prompt: "Explain simple linear regression for CFA: slope, intercept, R-squared, and interpretation." },
    ]},
    { id: "economics", label: "Economics",              icon: "🌐",  pills: [
      { label: "Supply & Demand",       prompt: "Explain supply and demand, elasticity, and market equilibrium with diagrams described." },
      { label: "GDP & Business Cycles", prompt: "Walk me through GDP measurement, business cycle phases, and leading indicators." },
      { label: "Monetary Policy",       prompt: "Explain monetary policy tools, the Fisher effect, and how central banks affect interest rates." },
      { label: "Currency & FX",         prompt: "Explain exchange rate regimes, purchasing power parity, and interest rate parity." },
    ]},
    { id: "fsa",       label: "Financial Statement Analysis", icon: "📊", pills: [
      { label: "Income Statement",      prompt: "Walk me through the income statement — key line items, ratios, and earnings quality flags." },
      { label: "Balance Sheet",         prompt: "Explain balance sheet analysis: asset/liability classification, working capital, leverage ratios." },
      { label: "Cash Flow Statement",   prompt: "Explain the cash flow statement — direct vs indirect, FCF, and quality of earnings signals." },
      { label: "Financial Ratios",      prompt: "Give me the key FSA ratios: liquidity, solvency, profitability, and efficiency with formulas." },
    ]},
    { id: "corpfin",   label: "Corporate Finance",      icon: "🏦",  pills: [
      { label: "NPV & IRR",    prompt: "Explain NPV and IRR — formulas, decision rules, when they conflict, and CFA exam tips." },
      { label: "WACC",         prompt: "Walk me through WACC — formula, components, cost of equity via CAPM, and capital budgeting use." },
      { label: "Capital Structure", prompt: "Explain optimal capital structure, MM propositions, and trade-off vs pecking order theory." },
      { label: "Dividends",    prompt: "Explain dividend policy — relevance debate, payout ratios, buybacks vs dividends for CFA L1." },
    ]},
    { id: "equity",    label: "Equity Investments",     icon: "📈",  pills: [
      { label: "Equity Valuation",  prompt: "Walk me through equity valuation methods: DDM, P/E, P/B, EV/EBITDA with formulas." },
      { label: "Market Efficiency", prompt: "Explain EMH — weak, semi-strong, strong forms and what each implies for active management." },
      { label: "Industry Analysis", prompt: "Explain Porter's Five Forces and industry life cycle for CFA equity analysis." },
      { label: "Gordon Growth Model", prompt: "Teach me the Gordon Growth Model — formula, assumptions, and a worked numerical example." },
    ]},
    { id: "fi",        label: "Fixed Income",           icon: "📉",  pills: [
      { label: "Bond Pricing",     prompt: "Explain bond pricing — the formula, relationship with yield, and premium vs discount bonds." },
      { label: "Duration",         prompt: "Explain Macaulay, Modified, and Effective duration with formulas and a worked example." },
      { label: "Yield Curve",      prompt: "Explain yield curve shapes, term structure theories, and what each signals for the economy." },
      { label: "Credit Risk",      prompt: "Explain credit risk, credit spreads, and how ratings agencies assess default probability." },
    ]},
    { id: "derivatives", label: "Derivatives",          icon: "⚡",  pills: [
      { label: "Options Basics",    prompt: "Explain call and put options — payoff diagrams, intrinsic vs time value, moneyness." },
      { label: "Futures & Forwards", prompt: "Compare futures and forwards — pricing, settlement, margin, and basis risk." },
      { label: "Option Strategies", prompt: "Walk me through covered call, protective put, straddle, and collar strategies." },
      { label: "Swaps",             prompt: "Explain interest rate and currency swaps — structure, cash flows, and use cases." },
    ]},
    { id: "pm",        label: "Portfolio Management",   icon: "🎯",  pills: [
      { label: "CAPM",          prompt: "Teach me CAPM — formula, beta, SML, CML, and how it's tested on CFA Level 1." },
      { label: "Modern Portfolio Theory", prompt: "Explain MPT — efficient frontier, diversification, systematic vs unsystematic risk." },
      { label: "Risk Measures", prompt: "Walk me through standard deviation, Sharpe ratio, beta, VaR as risk measures for CFA." },
      { label: "Asset Allocation", prompt: "Explain strategic vs tactical asset allocation and the IPS for CFA Level 1." },
    ]},
  ],
  cfa2: [
    { id: "valuation", label: "Equity Valuation",   icon: "📈", pills: [
      { label: "FCFF & FCFE",        prompt: "Walk me through FCFF and FCFE models — formulas, differences, and a full valuation example." },
      { label: "Residual Income",    prompt: "Explain residual income valuation — RI formula, clean surplus relation, and CFA vignette tips." },
      { label: "Private Company Val",prompt: "Explain private company valuation methods for CFA Level 2: DLOC, DLOM, and control premiums." },
      { label: "DDM Advanced",       prompt: "Walk me through multi-stage DDM and H-model with formulas and a numerical example." },
    ]},
    { id: "fsa2",      label: "FSA Advanced",        icon: "📊", pills: [
      { label: "Intercorporate Investments", prompt: "Explain equity method, consolidation, and VIEs for CFA Level 2 FSA." },
      { label: "Pension Accounting", prompt: "Walk me through defined benefit pension accounting under IFRS vs GAAP for CFA L2." },
      { label: "Multinational FSA",  prompt: "Explain functional vs presentation currency, translation methods (temporal vs current rate)." },
      { label: "Earnings Quality",   prompt: "Explain earnings quality flags, accruals ratio, and Beneish M-score for CFA Level 2." },
    ]},
    { id: "fi2",       label: "Fixed Income",        icon: "📉", pills: [
      { label: "Term Structure Models", prompt: "Explain the Ho-Lee, Vasicek, and CIR models for CFA Level 2 fixed income." },
      { label: "Credit Analysis",    prompt: "Walk me through structural vs reduced-form credit models and CDS pricing for CFA L2." },
      { label: "MBS & ABS",          prompt: "Explain mortgage-backed securities, prepayment risk, PAC tranches for CFA Level 2." },
      { label: "Binomial Tree",      prompt: "Walk me through binomial interest rate tree construction and bond valuation for CFA L2." },
    ]},
    { id: "deriv2",    label: "Derivatives",         icon: "⚡", pills: [
      { label: "Black-Scholes",      prompt: "Explain the Black-Scholes model — formula, inputs, Greeks (delta/gamma/vega/theta/rho)." },
      { label: "Swap Valuation",     prompt: "Walk me through how to value an interest rate swap mid-life for CFA Level 2." },
      { label: "Options Strategies", prompt: "Explain advanced option strategies: bull/bear spreads, butterfly, calendar spread for CFA L2." },
      { label: "Futures Pricing",    prompt: "Explain cost-of-carry model and futures pricing for financial vs commodity futures CFA L2." },
    ]},
    { id: "pm2",       label: "Portfolio Management",icon: "🎯", pills: [
      { label: "Multi-Factor Models", prompt: "Explain APT, Fama-French 3-factor, and Carhart 4-factor models for CFA Level 2." },
      { label: "Active Management",  prompt: "Explain the Fundamental Law of Active Management — IC, breadth, IR for CFA L2." },
      { label: "GIPS",               prompt: "Walk me through GIPS requirements — composites, verification, and presentation standards." },
      { label: "Currency Management",prompt: "Explain currency overlay, hedging strategies, and currency return decomposition for CFA L2." },
    ]},
  ],
  cfa3: [
    { id: "ips",       label: "IPS & Planning",      icon: "📋", pills: [
      { label: "IPS Construction",   prompt: "Walk me through writing an Investment Policy Statement — objectives, constraints, RRTTLLU." },
      { label: "Individual Investors",prompt: "Explain individual investor lifecycle, risk tolerance assessment, and human capital for CFA L3." },
      { label: "Institutional Investors", prompt: "Compare DB pension, endowment, foundation, insurance IPS requirements for CFA L3." },
      { label: "Tax-Efficient Investing", prompt: "Explain after-tax return, asset location, and tax-loss harvesting for CFA Level 3." },
    ]},
    { id: "assetalloc",label: "Asset Allocation",    icon: "🎯", pills: [
      { label: "MVO & Black-Litterman", prompt: "Explain Mean-Variance Optimization and Black-Litterman model for CFA Level 3." },
      { label: "Risk Parity",        prompt: "Explain risk parity and factor-based asset allocation for CFA Level 3." },
      { label: "Goals-Based Alloc",  prompt: "Walk me through goals-based investing and mental accounting for CFA Level 3." },
      { label: "Rebalancing",        prompt: "Explain rebalancing strategies — calendar, threshold, and optimization-based for CFA L3." },
    ]},
    { id: "behavioral", label: "Behavioral Finance", icon: "🧠", pills: [
      { label: "Cognitive Biases",   prompt: "Explain key cognitive biases: anchoring, framing, availability, representativeness for CFA L3." },
      { label: "Emotional Biases",   prompt: "Explain emotional biases: loss aversion, overconfidence, regret aversion for CFA Level 3." },
      { label: "Behavioral Portfolios", prompt: "Explain behavioral portfolio theory and how to adapt advice to biased investors." },
      { label: "Market Anomalies",   prompt: "Explain market anomalies (momentum, value, size) and behavioral explanations for CFA L3." },
    ]},
    { id: "perf",      label: "Performance Attribution", icon: "📊", pills: [
      { label: "Brinson Attribution", prompt: "Walk me through Brinson-Hood-Beebower attribution — allocation, selection, interaction effects." },
      { label: "Risk-Adjusted Returns", prompt: "Explain Sharpe, Treynor, Jensen's alpha, M² and information ratio for CFA Level 3." },
      { label: "Manager Selection",  prompt: "Explain manager due diligence, style analysis, and performance appraisal for CFA L3." },
      { label: "GIPS Advanced",      prompt: "Walk me through advanced GIPS requirements for composites and alternative investments." },
    ]},
  ],
  cpa1: [
    { id: "gaap",      label: "US GAAP Fundamentals", icon: "📋", pills: [
      { label: "Revenue Recognition", prompt: "Walk me through ASC 606 five-step revenue recognition model with journal entries." },
      { label: "Leases ASC 842",      prompt: "Explain ASC 842 lease accounting — operating vs finance lease, ROU asset, journal entries." },
      { label: "Business Combinations",prompt: "Explain ASC 805 acquisition method — goodwill, fair value, consolidation entries." },
      { label: "Pensions",            prompt: "Walk me through defined benefit pension accounting — PBO, service cost, corridor approach." },
    ]},
    { id: "govtacc",   label: "Governmental Accounting",icon: "🏛️", pills: [
      { label: "Fund Accounting",     prompt: "Explain governmental fund types — general, special revenue, capital projects, debt service." },
      { label: "GASB vs FASB",        prompt: "Compare GASB and FASB standards — key differences for CPA FAR exam." },
      { label: "Government-Wide Statements", prompt: "Walk me through government-wide financial statements vs fund statements for CPA FAR." },
      { label: "NFP Accounting",      prompt: "Explain not-for-profit accounting — net asset classes, contributions, restrictions for CPA FAR." },
    ]},
  ],
  cpa2: [
    { id: "audit",     label: "Audit Process",        icon: "🔍", pills: [
      { label: "Risk Assessment",     prompt: "Explain audit risk model — inherent, control, detection risk with formulas for CPA AUD." },
      { label: "Internal Controls",   prompt: "Walk me through internal control evaluation — COSO framework and SOX 404 requirements." },
      { label: "Audit Evidence",      prompt: "Explain types of audit evidence, assertions, and sampling methods for CPA AUD." },
      { label: "Audit Reports",       prompt: "Walk me through audit report types — unmodified, qualified, adverse, disclaimer for CPA AUD." },
    ]},
    { id: "ethics2",   label: "Professional Ethics",  icon: "⚖️", pills: [
      { label: "AICPA Code",          prompt: "Explain AICPA Code of Professional Conduct — independence, objectivity, confidentiality." },
      { label: "SOX Requirements",    prompt: "Walk me through Sarbanes-Oxley key provisions for auditors and public companies." },
      { label: "PCAOB Standards",     prompt: "Explain PCAOB auditing standards vs GAAS — key differences for CPA AUD exam." },
      { label: "Independence Rules",  prompt: "Explain auditor independence rules — financial interests, family relationships, non-audit services." },
    ]},
  ],
  efa: [
    { id: "efaval",    label: "Valuation",             icon: "📈", pills: [
      { label: "DCF Valuation",       prompt: "Walk me through DCF valuation — FCFF, WACC, terminal value with a worked example." },
      { label: "Multiples Valuation", prompt: "Explain relative valuation — P/E, EV/EBITDA, P/B, and peer group analysis for EFA." },
      { label: "LBO Analysis",        prompt: "Walk me through a basic LBO model — entry, debt structure, returns, exit for EFA." },
      { label: "Sum of Parts",        prompt: "Explain sum-of-the-parts valuation and conglomerate discount for EFA exam." },
    ]},
    { id: "euregs",    label: "European Regulations", icon: "🌍", pills: [
      { label: "MiFID II",            prompt: "Explain MiFID II key requirements — best execution, transparency, research unbundling." },
      { label: "EMIR",                prompt: "Explain EMIR — central clearing, trade reporting, margin requirements for OTC derivatives." },
      { label: "AIFMD",               prompt: "Walk me through AIFMD requirements for alternative fund managers in Europe." },
      { label: "SFDR / ESG",          prompt: "Explain EU SFDR sustainability disclosure requirements and ESG integration for EFA." },
    ]},
  ],
};

// ── Study Topic Picker Screen ────────────────────────────────────
function StudyTopicScreen({ profile, lastTopic, onSelect }) {
  const examTopics = STUDY_TOPICS[profile.exam?.id] || [];
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--background)", fontFamily: "var(--font-sans)", padding: "24px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(108,92,231,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "fixed", width: 500, height: 500, top: -150, left: -100, borderRadius: "50%", background: "var(--primary)", filter: "blur(140px)", opacity: 0.07, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "720px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "11px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontFamily: "var(--font-serif)", color: "#fff" }}>Σ</div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "var(--foreground)" }}>FinanceIQ</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--foreground)", marginBottom: "8px", lineHeight: 1.2 }}>
            What are you studying today, {profile.name.split(" ")[0]}?
          </h2>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: "var(--primary-light)", border: "1px solid #bfdbfe" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--primary)" }}>{profile.exam?.label}</span>
          </div>
        </div>

        {/* Topic grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {examTopics.map(topic => {
            const isLast = lastTopic?.id === topic.id;
            const isHov = hovered === topic.id;
            return (
              <div key={topic.id}
                onClick={() => onSelect(topic)}
                onMouseEnter={() => setHovered(topic.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: "18px 20px", borderRadius: "14px", cursor: "pointer",
                  background: isHov ? "var(--primary-light)" : "var(--card)",
                  border: `2px solid ${isHov ? "var(--primary)" : isLast ? "#bfdbfe" : "var(--border)"}`,
                  transition: "all 0.18s",
                  boxShadow: isHov ? "0 4px 20px var(--primary-light)" : "0 1px 4px rgba(0,0,0,0.04)",
                  position: "relative",
                }}>
                {isLast && (
                  <div style={{ position: "absolute", top: "10px", right: "10px", fontSize: "9px", fontWeight: "700", letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--primary)", background: "var(--primary-light)", padding: "2px 6px", borderRadius: "4px" }}>Last</div>
                )}
                <div style={{ fontSize: "22px", marginBottom: "10px" }}>{topic.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--foreground)", lineHeight: 1.3 }}>{topic.label}</div>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--muted-foreground)", opacity: 0.7 }}>
          You can switch topics anytime during your session.
        </p>
      </div>
    </div>
  );
}



function parseContent(text) {
  // Convert markdown-like syntax to styled spans
  // We'll render this as HTML via dangerouslySetInnerHTML after sanitizing
  let html = text
    // Block equations $$...$$
    .replace(/\$\$([\s\S]+?)\$\$/g, '<div class="eq-block">$1</div>')
    // Inline equations $...$
    .replace(/\$([^$\n]+?)\$/g, '<span class="eq-inline">$1</span>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="num">$1</li>')
    // Bullet lists
    .replace(/^[•\-\*] (.*$)/gm, '<li class="bul">$1</li>')
    // Tables (simple)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
    })
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');

  // Wrap li items
  html = html.replace(/(<li[^>]*>.*?<\/li>)/gs, '$1');
  
  return `<p>${html}</p>`;
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    onLogin(name || email.split("@")[0], email);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--background)", fontFamily: "var(--font-sans)", padding: "20px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(108,92,231,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.05) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />
      <div style={{ position: "fixed", width: 500, height: 500, top: -150, left: -150, borderRadius: "50%", background: "var(--primary)", filter: "blur(120px)", opacity: 0.08, pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 400, height: 400, bottom: -100, right: -100, borderRadius: "50%", background: "var(--primary-dark)", filter: "blur(120px)", opacity: 0.08, pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        display: "flex", width: "100%", maxWidth: "860px",
        borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 20px 60px #bfdbfe, 0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid var(--border)",
        position: "relative", zIndex: 1,
        minHeight: "520px",
      }}>
        {/* Left panel */}
        <div style={{
          width: "45%", background: "var(--primary)",
          padding: "48px 40px", display: "flex", flexDirection: "column",
          alignItems: "flex-start", justifyContent: "space-between", color: "#fff",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "48px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontFamily: "var(--font-serif)", fontWeight: "400",
              }}>Σ</div>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "22px", letterSpacing: "-0.3px" }}>Finance<span style={{ opacity: 0.75 }}>IQ</span></span>
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: "700", lineHeight: 1.2, marginBottom: "16px" }}>
              Master Finance.<br />Ace Your Exams.
            </h2>
            <p style={{ fontSize: "14px", opacity: 0.8, lineHeight: 1.7, maxWidth: "260px" }}>
              Your AI-powered tutor for CFA prep, corporate finance, derivatives, economics, and more.
            </p>
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            {["CFA Levels 1, 2 & 3", "Step-by-step equation solving", "Theory + exam strategy"].map(f => (
              <div key={f} style={{
                display: "flex", alignItems: "center", gap: "10px",
                fontSize: "13px", opacity: 0.9,
              }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div style={{
          flex: 1, background: "var(--card)", padding: "48px 44px",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", color: "var(--foreground)", marginBottom: "6px" }}>
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--muted-foreground)", marginBottom: "32px" }}>
            {isSignUp ? "Start your finance mastery journey." : "Sign in to continue your studies."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {isSignUp && (
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--foreground)", display: "block", marginBottom: "6px", letterSpacing: "0.4px", textTransform: "uppercase" }}>Full Name</label>
                <input
                  type="text" placeholder="Jane Smith" value={name}
                  onChange={e => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "var(--primary)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--foreground)", display: "block", marginBottom: "6px", letterSpacing: "0.4px", textTransform: "uppercase" }}>Email</label>
              <input
                type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--foreground)", letterSpacing: "0.4px", textTransform: "uppercase" }}>Password</label>
                {!isSignUp && <a href="#" style={{ fontSize: "12px", color: "var(--primary)", textDecoration: "none" }}>Forgot password?</a>}
              </div>
              <input
                type="password" placeholder="••••••••" value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "var(--primary)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
              />
            </div>
          </div>

          {error && (
            <div style={{ marginTop: "12px", fontSize: "12px", color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "8px 12px" }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} style={{
            marginTop: "24px", width: "100%", padding: "13px",
            background: "var(--primary)",
            border: "none", borderRadius: "12px", color: "#fff",
            fontSize: "14px", fontWeight: "600", cursor: "pointer",
            fontFamily: "var(--font-sans)", letterSpacing: "0.3px",
            transition: "opacity 0.2s",
          }}
            onMouseEnter={e => e.target.style.opacity = "0.88"}
            onMouseLeave={e => e.target.style.opacity = "1"}
          >
            {isSignUp ? "Create Account →" : "Sign In →"}
          </button>

          <p style={{ marginTop: "20px", fontSize: "13px", color: "var(--muted-foreground)", textAlign: "center" }}>
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "600" }}>
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </p>

          <p style={{ marginTop: "16px", fontSize: "11px", color: "var(--muted-foreground)", textAlign: "center", opacity: 0.6 }}>
            CFA Institute does not endorse this product.
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "11px 14px",
  background: "var(--background)", border: "1px solid var(--border)",
  borderRadius: "10px", fontSize: "14px", color: "var(--foreground)",
  fontFamily: "var(--font-sans)", outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

// ── Exam catalogue ──────────────────────────────────────────────
const EXAM_CATALOGUE = [
  {
    group: "CFA Program",
    color: "var(--primary)",
    icon: "📊",
    exams: [
      { id: "cfa1", label: "CFA Level 1", desc: "Ethics, Quant, Economics, FSA, Fixed Income, Equity, Derivatives, PM" },
      { id: "cfa2", label: "CFA Level 2", desc: "Application of tools & valuation models, deeper asset class analysis" },
      { id: "cfa3", label: "CFA Level 3", desc: "Portfolio management, wealth planning, risk management" },
    ]
  },
  {
    group: "CPA Program",
    color: "#0ea5e9",
    icon: "📋",
    exams: [
      { id: "cpa1", label: "CPA — FAR", desc: "Financial Accounting & Reporting: GAAP, govt accounting, NFP" },
      { id: "cpa2", label: "CPA — AUD", desc: "Auditing & Attestation: audit procedures, ethics, professional standards" },
    ]
  },
  {
    group: "EFA",
    color: "#10b981",
    icon: "🌍",
    exams: [
      { id: "efa", label: "EFA (Euromoney)", desc: "Financial analysis, valuation, European markets & regulations" },
    ]
  },
];

const EXAM_SYSTEM_ADDENDUM = {
  cfa1: "The user is preparing for CFA Level 1. Focus on foundational concepts: Ethics (Standards of Professional Conduct), Quantitative Methods (TVM, statistics, hypothesis testing), Economics (micro/macro), Financial Statement Analysis, Corporate Finance, Equity Investments, Fixed Income, Derivatives, Alternative Investments, and Portfolio Management basics. Emphasize LOS (Learning Outcome Statements), multiple-choice exam strategy, and conceptual clarity.",
  cfa2: "The user is preparing for CFA Level 2. Focus on application and analysis: deeper valuation models (DDM, FCFF/FCFE, residual income), multi-factor models, fixed income valuation, derivatives pricing, GIPS, and complex FSA. Emphasize item-set (vignette) format strategy, connecting concepts across topics.",
  cfa3: "The user is preparing for CFA Level 3. Focus on portfolio management and wealth planning: IPS construction, asset allocation (MVO, BL, risk parity), behavioral finance, performance attribution (Brinson), GIPS compliance, derivatives overlays, and essay (constructed response) exam strategy.",
  cpa1: "The user is preparing for CPA FAR (Financial Accounting & Reporting). Focus on US GAAP financial statements, governmental accounting (GASB), not-for-profit accounting, leases (ASC 842), revenue recognition (ASC 606), business combinations, and pension accounting. Emphasize journal entries and reconciliation problems.",
  cpa2: "The user is preparing for CPA AUD (Auditing & Attestation). Focus on audit planning, risk assessment (ISA/PCAOB), internal controls, audit evidence, audit reports, attestation engagements, professional ethics (AICPA Code), and Sarbanes-Oxley requirements.",
  efa: "The user is preparing for the EFA (Euromoney Financial Analyst) qualification. Focus on financial statement analysis, valuation (DCF, multiples), European regulatory frameworks (MiFID II, EMIR), fixed income, equity analysis, and risk management from a European market perspective.",
};

// ── Onboarding Screen ────────────────────────────────────────────
function OnboardingScreen({ userName, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--background)", fontFamily: "var(--font-sans)", padding: "24px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(108,92,231,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div style={{ position: "fixed", width: 500, height: 500, top: -150, right: -100, borderRadius: "50%", background: "var(--primary)", filter: "blur(140px)", opacity: 0.07, pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "680px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontFamily: "var(--font-serif)", color: "#fff" }}>Σ</div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--foreground)" }}>FinanceIQ</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", color: "var(--foreground)", marginBottom: "10px", lineHeight: 1.2 }}>
            Welcome, {userName}! 👋
          </h2>
          <p style={{ fontSize: "15px", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
            Which exam are you preparing for? We'll personalize your experience.
          </p>
        </div>

        {/* Exam groups */}
        {EXAM_CATALOGUE.map(group => (
          <div key={group.group} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "16px" }}>{group.icon}</span>
              <span style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", color: group.color }}>{group.group}</span>
              <div style={{ flex: 1, height: "1px", background: "var(--border)", marginLeft: "4px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {group.exams.map(exam => {
                const isSelected = selected?.id === exam.id;
                const isHov = hovered === exam.id;
                return (
                  <div key={exam.id}
                    onClick={() => setSelected(exam)}
                    onMouseEnter={() => setHovered(exam.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: "flex", alignItems: "center", gap: "16px",
                      padding: "16px 20px", borderRadius: "14px", cursor: "pointer",
                      background: isSelected ? `${group.color}10` : isHov ? "rgba(0,0,0,0.02)" : "var(--card)",
                      border: `2px solid ${isSelected ? group.color : isHov ? `${group.color}40` : "var(--border)"}`,
                      transition: "all 0.18s",
                      boxShadow: isSelected ? `0 4px 20px ${group.color}20` : "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                    {/* Radio */}
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${isSelected ? group.color : "#d4d4d4"}`,
                      background: isSelected ? group.color : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.18s",
                    }}>
                      {isSelected && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: isSelected ? group.color : "var(--foreground)", marginBottom: "3px" }}>{exam.label}</div>
                      <div style={{ fontSize: "12px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{exam.desc}</div>
                    </div>
                    {isSelected && <div style={{ fontSize: "18px" }}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* CTA */}
        <button
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
          style={{
            width: "100%", padding: "15px",
            background: selected ? "var(--primary)" : "var(--border)",
            border: "none", borderRadius: "14px", color: selected ? "#fff" : "var(--muted-foreground)",
            fontSize: "15px", fontWeight: "600", cursor: selected ? "pointer" : "not-allowed",
            fontFamily: "var(--font-sans)", transition: "all 0.2s",
            marginTop: "8px",
          }}
        >
          {selected ? `Start studying ${selected.label} →` : "Select an exam to continue"}
        </button>

        <p style={{ textAlign: "center", fontSize: "12px", color: "var(--muted-foreground)", marginTop: "16px", opacity: 0.7 }}>
          You can change your exam focus anytime from your profile.
        </p>
      </div>
    </div>
  );
}

// ── Profile Badge (shown in header) ─────────────────────────────
function ProfileBadge({ profile, onSignOut, onChangeExam, onChangeTopic }) {
  const [open, setOpen] = useState(false);
  const examColor = EXAM_CATALOGUE.flatMap(g => g.exams).find(e => e.id === profile.exam?.id)
    ? EXAM_CATALOGUE.find(g => g.exams.some(e => e.id === profile.exam?.id))?.color
    : "var(--primary)";

  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: "8px", cursor: "pointer",
        padding: "5px 10px 5px 5px", borderRadius: "10px",
        border: "1px solid var(--border)", background: "var(--card)",
        transition: "all 0.15s",
      }}>
        <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: `linear-gradient(135deg, ${examColor}, var(--primary-dark))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: "700" }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--foreground)", lineHeight: 1.2 }}>{profile.name}</div>
          <div style={{ fontSize: "10px", color: examColor, fontWeight: "600" }}>{profile.exam?.label || "No exam set"}</div>
        </div>
        <span style={{ fontSize: "10px", color: "var(--muted-foreground)", marginLeft: "2px" }}>▾</span>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, width: "220px",
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "14px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          padding: "8px", zIndex: 100,
        }}>
          {/* Profile info */}
          <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid var(--border)", marginBottom: "6px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--foreground)" }}>{profile.name}</div>
            <div style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: "2px" }}>{profile.email}</div>
            <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 8px", borderRadius: "6px", background: `${examColor}12`, border: `1px solid ${examColor}30` }}>
              <span style={{ fontSize: "10px", fontWeight: "700", color: examColor }}>{profile.exam?.label}</span>
            </div>
          </div>
          {/* Actions */}
          {[
            { label: "📚  Change Topic", action: onChangeTopic },
            { label: "🎯  Change Exam", action: onChangeExam },
            { label: "🚪  Sign Out", action: onSignOut },
          ].map(item => (
            <button key={item.label} onClick={() => { item.action(); setOpen(false); }} style={{
              width: "100%", padding: "9px 12px", textAlign: "left",
              background: "none", border: "none", borderRadius: "8px",
              fontSize: "13px", color: "var(--foreground)", cursor: "pointer",
              fontFamily: "var(--font-sans)",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.target.style.background = "rgba(0,0,0,0.04)"}
              onMouseLeave={e => e.target.style.background = "none"}
            >{item.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FinanceAI() {
  const [screen, setScreen] = useState("chat");
  const [profile, setProfile] = useState({ name: "Guest", email: "", exam: { id: "cfa1", label: "CFA Level 1", desc: "Ethics, Quant, Economics, FSA, Fixed Income, Equity, Derivatives, PM" }, joinedAt: new Date().toLocaleDateString() });
  const [currentTopic, setCurrentTopic] = useState(null);
  const [lastTopic, setLastTopic] = useState(null);

  // ── Beta Waitlist ──────────────────────────────────────────────
  const [showWaitlist, setShowWaitlist] = useState(true);
  const [waitlistDone, setWaitlistDone] = useState(false);

  // ── Beta Question Limit ────────────────────────────────────────
  const QUESTION_LIMIT = 5;
  const [questionCount, setQuestionCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  // ── Cheat Sheet Mode ───────────────────────────────────────────
  const [cheatMode, setCheatMode] = useState(false);

  const [messages, setMessages] = useState([]);
  const [streamingMsg, setStreamingMsg] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // ── Budget Safety: session token tracking ──────────────────────
  // Rough estimate: 1 token ≈ 4 chars. Cap at 50,000 tokens/session.
  const SESSION_TOKEN_LIMIT = 50000;
  const sessionTokensUsed = useRef(0);
  const [budgetExceeded, setBudgetExceeded] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    setUploadLoading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej();
        r.readAsDataURL(file);
      });
      setUploadedDoc({ name: file.name, base64 });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `📄 **${file.name}** uploaded. I can now reference this curriculum directly — ask me about any concept, example, or problem from it.`
      }]);
    } catch {
      alert("Failed to read PDF. Please try again.");
    } finally {
      setUploadLoading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMsg, loading]);

  const buildSystemPrompt = (exam) => {
    const base = SYSTEM_PROMPT;
    const addon = exam ? `\n\nUSER EXAM PROFILE:\n${EXAM_SYSTEM_ADDENDUM[exam.id] || ""}` : "";
    const docAddon = uploadedDoc ? `\n\nThe student has uploaded their official curriculum PDF: "${uploadedDoc.name}". Reference it directly when answering.` : "";
    const cheatAddon = cheatMode ? `\n\nCHEAT SHEET MODE: The student wants a cheat sheet. Structure your response as a clean 1-page reference: title, key formulas with variable definitions, bullet-point concepts, and one exam tip. Keep it tight and scannable.` : "";
    return base + addon + docAddon + cheatAddon;
  };

  // ── Screen routing ──
  if (screen === "login") {
    return <LoginScreen onLogin={(name, email) => {
      setProfile({ name, email });
      setScreen("onboarding");
    }} />;
  }
  if (screen === "onboarding") {
    return <OnboardingScreen userName={profile?.name || "there"} onComplete={(exam) => {
      const fullProfile = { ...profile, exam, joinedAt: new Date().toLocaleDateString() };
      setProfile(fullProfile);
      setScreen("chat");
    }} />;
  }

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;

    // ── Beta question limit check ────────────────────────────────
    if (questionCount >= QUESTION_LIMIT) {
      setLimitReached(true);
      return;
    }

    // ── Budget Safety Check ──────────────────────────────────────
    // Add ~¼ token per char estimate for the new message
    const estimatedInputTokens = Math.ceil(userText.length / 4);
    if (budgetExceeded || sessionTokensUsed.current + estimatedInputTokens > SESSION_TOKEN_LIMIT) {
      setBudgetExceeded(true);
      return;
    }

    setInput("");
    const userMsg = { role: "user", content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    setStreamingMsg("");

    try {
      // ── Sliding Window: only send last 5 messages ────────────────
      const windowMessages = newMessages.slice(-5);

      const apiMessages = windowMessages
        .filter(m => m.role !== "system")
        .map((m, idx) => {
          // Attach PDF only to the latest user message
          if (uploadedDoc && m.role === "user" && idx === windowMessages.length - 1) {
            return {
              role: "user",
              content: [
                { type: "document", source: { type: "base64", media_type: "application/pdf", data: uploadedDoc.base64 }, cache_control: { type: "ephemeral" } },
                { type: "text", text: m.content }
              ]
            };
          }
          return { role: m.role, content: m.content };
        });

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-haiku-latest",  // fastest + cheapest
          max_tokens: 500,                    // enough for concise answers
          stream: true,                       // character-by-character streaming
          system: buildSystemPrompt(profile?.exam),
          messages: apiMessages,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            if (json.type === "content_block_delta" && json.delta?.text) {
              accumulated += json.delta.text;
              setStreamingMsg(accumulated);
            }
          } catch {}
        }
      }

      const finalReply = accumulated || "Sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: "assistant", content: finalReply }]);
      setStreamingMsg("");
      setCheatMode(false); // reset cheat mode after response

      // ── Increment question count ─────────────────────────────────
      const newCount = questionCount + 1;
      setQuestionCount(newCount);
      if (newCount >= QUESTION_LIMIT) setLimitReached(true);

      // ── Track tokens used this session (rough estimate) ──────────
      sessionTokensUsed.current += Math.ceil((userText.length + finalReply.length) / 4);
      if (sessionTokensUsed.current > SESSION_TOKEN_LIMIT) setBudgetExceeded(true);

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
      setStreamingMsg("");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (msg, i) => {
    const isUser = msg.role === "user";
    return (
      <div key={i} style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: "20px",
        gap: "10px",
        alignItems: "flex-start",
      }}>
        {!isUser && (
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#1a56db",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "13px", fontWeight: "700", color: "#fff",
            fontFamily: "'Libre Baskerville', serif",
          }}>Σ</div>
        )}
        <div style={{
          maxWidth: "82%",
          background: isUser ? "#1a56db" : "#ffffff",
          border: isUser ? "none" : "1px solid #e2e8f0",
          borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
          padding: "12px 16px",
          color: isUser ? "#ffffff" : "#0f172a",
          fontSize: "14px",
          lineHeight: "1.75",
          fontFamily: "'Inter', sans-serif",
          boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
        }}>
          <MessageContent content={msg.content} />
        </div>
        {isUser && (
          <div style={{
            width: "32px", height: "32px", borderRadius: "8px",
            background: "#dbeafe",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, fontSize: "13px", color: "#1a56db",
          }}>👤</div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --primary:       #1a56db;
          --primary-dark:  #1e3a8a;
          --primary-light: #dbeafe;
          --background:    #f0f4f9;
          --surface:       #ffffff;
          --border:        #cbd5e1;
          --border-light:  #e2e8f0;
          --foreground:    #0f172a;
          --muted:         #64748b;
          --muted-light:   #94a3b8;
          --font-sans:     'Inter', sans-serif;
          --font-serif:    'Libre Baskerville', serif;
          --font-mono:     'JetBrains Mono', monospace;
          --radius:        8px;
          --shadow-sm:     0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04);
          --shadow-md:     0 4px 12px rgba(15,23,42,0.08), 0 2px 6px rgba(15,23,42,0.04);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--background); }

        .finance-root {
          min-height: 100vh; background: var(--background);
          color: var(--foreground); font-family: var(--font-sans);
          display: flex; flex-direction: column;
        }

        .grid-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
          background-size: 28px 28px; opacity: 0.45;
        }

        .glow-orb {
          position: fixed; pointer-events: none; z-index: 0; border-radius: 50%;
          filter: blur(140px); opacity: 0.05;
        }

        .header {
          position: sticky; top: 0; z-index: 50;
          background: var(--surface);
          border-bottom: 1px solid var(--border-light);
          padding: 0 32px;
          display: flex; align-items: center; justify-content: space-between;
          height: 60px; box-shadow: var(--shadow-sm);
        }

        .logo { display: flex; align-items: center; gap: 12px; }

        .logo-mark {
          width: 34px; height: 34px; border-radius: 8px;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-serif);
          font-size: 17px; color: #fff; font-weight: 700;
        }

        .logo-text {
          font-family: var(--font-serif);
          font-size: 20px; color: var(--foreground);
          font-weight: 700; letter-spacing: -0.4px;
        }
        .logo-text span { color: var(--primary); }

        .badge {
          font-size: 10px; font-weight: 600; letter-spacing: 0.8px;
          text-transform: uppercase; color: var(--primary);
          background: var(--primary-light); border: 1px solid #bfdbfe;
          padding: 3px 8px; border-radius: 4px; font-family: var(--font-sans);
        }

        .header-right { display: flex; align-items: center; gap: 12px; }

        .main {
          flex: 1;
          display: flex;
          position: relative;
          z-index: 1;
          max-width: 860px;
          width: 100%;
          margin: 0 auto;
          flex-direction: column;
          padding: 0 20px;
          height: calc(100vh - 60px);
          overflow: hidden;
        }

        .topics-bar {
          padding: 12px 0 8px;
          display: flex; gap: 6px; flex-wrap: wrap;
          border-bottom: 1px solid var(--border-light);
          margin-bottom: 4px;
        }

        .topic-pill {
          font-size: 11.5px; font-weight: 500;
          padding: 5px 12px; border-radius: 4px;
          background: var(--surface); border: 1px solid var(--border);
          color: var(--muted); cursor: pointer; transition: all 0.15s;
          font-family: var(--font-sans);
        }
        .topic-pill:hover {
          background: var(--primary-light); border-color: #93c5fd; color: var(--primary);
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 0 12px;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .typing-indicator { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 20px; }

        .typing-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--primary);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          font-family: var(--font-serif); flex-shrink: 0;
        }

        .typing-bubble {
          background: var(--surface); border: 1px solid var(--border-light);
          border-radius: 4px 14px 14px 14px; padding: 12px 16px;
          display: flex; gap: 5px; align-items: center; box-shadow: var(--shadow-sm);
        }

        .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); animation: bounce 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.35; }
          30% { transform: translateY(-5px); opacity: 1; }
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .input-area { padding: 10px 0 20px; border-top: 1px solid var(--border-light); }
        .input-row { display: flex; gap: 8px; align-items: flex-end; }
        .input-wrapper { flex: 1; }

        textarea {
          width: 100%; background: var(--surface); border: 1px solid var(--border);
          border-radius: 10px; padding: 12px 16px;
          color: var(--foreground); font-size: 14px; font-family: var(--font-sans);
          resize: none; outline: none; line-height: 1.6;
          transition: border-color 0.15s, box-shadow 0.15s;
          min-height: 48px; max-height: 140px; box-shadow: var(--shadow-sm);
        }
        textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(26,86,219,0.1); }
        textarea::placeholder { color: var(--muted-light); }

        .send-btn {
          width: 44px; height: 44px; border-radius: 10px;
          background: var(--primary); border: none; cursor: pointer; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; transition: background 0.15s, transform 0.1s;
          flex-shrink: 0; box-shadow: var(--shadow-sm);
        }
        .send-btn:hover { background: var(--primary-dark); }
        .send-btn:active { transform: scale(0.95); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .hint {
          text-align: center; font-size: 10.5px; color: var(--muted-light);
          margin-top: 8px; font-family: var(--font-mono);
        }

        .msg-content h1, .msg-content h2, .msg-content h3 {
          font-family: var(--font-serif); color: var(--foreground);
          margin: 12px 0 6px; font-weight: 700;
        }
        .msg-content h2 { font-size: 15px; }
        .msg-content h3 { font-size: 13.5px; color: var(--primary); }
        .msg-content strong { color: var(--foreground); font-weight: 600; }

        .msg-content .eq-block {
          background: #eff6ff; border: 1px solid #bfdbfe;
          border-left: 3px solid var(--primary);
          border-radius: 6px; padding: 12px 16px; margin: 10px 0;
          font-family: var(--font-mono); font-size: 13px; color: var(--primary-dark);
          overflow-x: auto;
        }
        .msg-content .eq-inline {
          font-family: var(--font-mono); font-size: 13px; color: var(--primary-dark);
          background: #eff6ff; padding: 1px 5px; border-radius: 4px; border: 1px solid #bfdbfe;
        }

        .msg-content li { margin: 4px 0; padding-left: 4px; color: var(--foreground); }
        .msg-content li.bul::before { content: "• "; color: var(--primary); font-weight: 700; }
        .msg-content li.num { list-style-type: decimal; margin-left: 18px; }

        .msg-content table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .msg-content td { padding: 8px 12px; font-size: 13px; border: 1px solid var(--border-light); color: var(--foreground); }
        .msg-content tr:first-child td { background: var(--primary-light); font-weight: 600; color: var(--primary-dark); }
        .msg-content tr:nth-child(even) td { background: #f8fafc; }
        .msg-content p { margin: 5px 0; color: var(--foreground); line-height: 1.7; }

        .katex-block { overflow-x: auto; }
        .katex-inline .katex { font-size: 1em; }
        .katex-block .katex-display { margin: 4px 0; }

        /* Scrollbar */
        .messages::-webkit-scrollbar { width: 4px; }
        .messages::-webkit-scrollbar-track { background: transparent; }
        .messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
      `}</style>

      <div className="finance-root" style={{ filter: showWaitlist ? "blur(2px)" : "none", pointerEvents: showWaitlist ? "none" : "auto", transition: "filter 0.3s" }}>
        <div className="grid-bg" />
        <div className="glow-orb" style={{ width: 500, height: 500, top: -200, left: -150, background: "#1a56db" }} />
        <div className="glow-orb" style={{ width: 400, height: 400, bottom: -100, right: -100, background: "#3b82f6" }} />

        <header className="header">
          <div className="logo">
            <div className="logo-mark">Σ</div>
            <div className="logo-text">Finance<span>IQ</span></div>
            <div className="badge">AI Tutor</div>
          </div>
          <div className="header-right">
            {/* Session token usage indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: budgetExceeded ? "#b91c1c" : "var(--muted)", fontFamily: "var(--font-mono)", background: budgetExceeded ? "#fef2f2" : "var(--background)", border: `1px solid ${budgetExceeded ? "#fecaca" : "var(--border-light)"}`, padding: "3px 8px", borderRadius: "6px" }}>
              <span>{budgetExceeded ? "⚠️" : "🔵"}</span>
              <span>{Math.min(Math.round(sessionTokensUsed.current / 500), 100)}% of session</span>
            </div>
            {profile && (
              <ProfileBadge
                profile={profile}
                onSignOut={() => { setScreen("login"); setProfile(null); setMessages([]); }}
                onChangeExam={() => setScreen("onboarding")}
                onChangeTopic={() => setScreen("study")}
              />
            )}
          </div>
        </header>

        <div className="main">

          {/* Claude-style greeting shown when no messages */}
          {messages.length === 0 && !loading && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", textAlign: "center", overflowY: "auto" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontFamily: "var(--font-serif)", color: "#fff", fontWeight: "700", marginBottom: "20px" }}>Σ</div>
              <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", fontWeight: "700", color: "var(--foreground)", marginBottom: "8px" }}>
                How can I help you today?
              </h1>
              <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "420px", lineHeight: 1.6, marginBottom: "32px" }}>
                Ask me anything — financial equations, CFA problems, economic theory, or concept explanations.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", maxWidth: "560px" }}>
                {[
                  "Explain WACC with a worked example",
                  "What is the Black-Scholes formula?",
                  "Walk me through bond duration",
                  "Teach me CAPM step by step",
                  "NPV vs IRR — when do they conflict?",
                  "Explain the yield curve and its theories",
                ].map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    padding: "8px 16px", borderRadius: "20px", fontSize: "13px",
                    background: "var(--surface)", border: "1px solid var(--border)",
                    color: "var(--muted)", cursor: "pointer", fontFamily: "var(--font-sans)",
                    transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "var(--primary)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {(messages.length > 0 || loading) && (
          <div className="messages">
            {messages.map((m, i) => renderMessage(m, i))}
            {streamingMsg && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "20px", gap: "10px", alignItems: "flex-start" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "13px", fontWeight: "700", color: "#fff", fontFamily: "var(--font-serif)" }}>Σ</div>
                <div style={{ maxWidth: "82%", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", color: "#0f172a", fontSize: "14px", lineHeight: "1.75", fontFamily: "var(--font-sans)", boxShadow: "0 1px 3px rgba(15,23,42,0.08)" }}>
                  <MessageContent content={streamingMsg} />
                  <span style={{ display: "inline-block", width: "2px", height: "14px", background: "var(--primary)", marginLeft: "2px", animation: "blink 1s infinite", verticalAlign: "middle" }} />
                </div>
              </div>
            )}
            {loading && !streamingMsg && (
              <div className="typing-indicator">
                <div className="typing-avatar">Σ</div>
                <div className="typing-bubble">
                  <div className="dot" /><div className="dot" /><div className="dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          )}

          <AnimatedInputArea
            input={input}
            setInput={setInput}
            onSend={sendMessage}
            onKey={handleKey}
            loading={loading}
            uploadedDoc={uploadedDoc}
            setUploadedDoc={setUploadedDoc}
            fileInputRef={fileInputRef}
            uploadLoading={uploadLoading}
            handleFileUpload={handleFileUpload}
            budgetExceeded={budgetExceeded}
            limitReached={limitReached}
            questionCount={questionCount}
            questionLimit={QUESTION_LIMIT}
            cheatMode={cheatMode}
            setCheatMode={setCheatMode}
          />
        </div>
      </div>

      {/* ── Beta Waitlist Modal ──────────────────────────────────── */}
      {showWaitlist && (
        <WaitlistModal
          done={waitlistDone}
          onSubmit={() => setWaitlistDone(true)}
          onClose={() => setShowWaitlist(false)}
        />
      )}
    </>
  );
}

// ── Beta Waitlist Modal ──────────────────────────────────────────
function WaitlistModal({ done, onSubmit, onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [exam, setExam] = useState("");
  const [error, setError] = useState("");
  const [hoveredExam, setHoveredExam] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Airtable config (uses Vercel environment variables) ─────────
  const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN;
  const AIRTABLE_BASE  = import.meta.env.VITE_AIRTABLE_BASE;
  const AIRTABLE_TABLE = import.meta.env.VITE_AIRTABLE_TABLE;

  const exams = [
    { id: "cfa1", label: "CFA Level 1" },
    { id: "cfa2", label: "CFA Level 2" },
    { id: "cfa3", label: "CFA Level 3" },
    { id: "cpa",  label: "CPA" },
    { id: "efa",  label: "EFA" },
    { id: "other",label: "Other / General" },
  ];

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email."); return; }
    if (!exam) { setError("Please select your exam."); return; }
    setError("");
    setSubmitting(true);

    try {
      const examLabel = exams.find(e => e.id === exam)?.label || exam;
      const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [{
            fields: {
              Name: name,
              Email: email,
              Exam: examLabel,
            }
          }]
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message || "Airtable error");
      }

      onSubmit();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(15, 23, 42, 0.55)",
      backdropFilter: "blur(6px)",
      padding: "20px",
      fontFamily: "var(--font-sans)",
    }}>
      <div style={{
        width: "100%", maxWidth: "480px",
        background: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 24px 80px rgba(15,23,42,0.18), 0 8px 24px rgba(15,23,42,0.10)",
        overflow: "hidden",
        animation: "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {!done ? (
          <>
            {/* Header band */}
            <div style={{
              background: "linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)",
              padding: "32px 32px 28px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative circles */}
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", bottom: -40, left: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px", padding: "4px 12px", marginBottom: "16px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80" }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.9)", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase" }}>Beta Launching Soon</span>
              </div>

              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: "22px", fontFamily: "var(--font-serif)", color: "#fff", fontWeight: "700" }}>Σ</div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "#fff", fontWeight: "700", marginBottom: "8px", lineHeight: 1.2 }}>
                Join the FinanceIQ Beta
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: "340px", margin: "0 auto" }}>
                The AI tutor built for CFA, CPA & EFA candidates. Be first to access when we launch.
              </p>
            </div>

            {/* Form */}
            <div style={{ padding: "28px 32px 32px" }}>

              {/* Name */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Full Name</label>
                <input
                  type="text" placeholder="Jane Smith" value={name}
                  onChange={e => { setName(e.target.value); setError(""); }}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", color: "#0f172a", fontFamily: "var(--font-sans)", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#1a56db"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Email Address</label>
                <input
                  type="email" placeholder="you@example.com" value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "14px", color: "#0f172a", fontFamily: "var(--font-sans)", outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#1a56db"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>

              {/* Exam picker */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>I'm preparing for</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {exams.map(e => (
                    <button key={e.id}
                      onClick={() => { setExam(e.id); setError(""); }}
                      onMouseEnter={() => setHoveredExam(e.id)}
                      onMouseLeave={() => setHoveredExam(null)}
                      style={{
                        padding: "8px 6px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                        border: `1.5px solid ${exam === e.id ? "#1a56db" : hoveredExam === e.id ? "#93c5fd" : "#e2e8f0"}`,
                        background: exam === e.id ? "#dbeafe" : hoveredExam === e.id ? "#f0f4f9" : "#fff",
                        color: exam === e.id ? "#1a56db" : "#475569",
                        cursor: "pointer", transition: "all 0.15s",
                        fontFamily: "var(--font-sans)",
                      }}
                    >{e.label}</button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginBottom: "14px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "12px", color: "#b91c1c" }}>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button onClick={handleSubmit} disabled={submitting} style={{
                width: "100%", padding: "13px", background: submitting ? "#93c5fd" : "#1a56db",
                border: "none", borderRadius: "12px", color: "#fff",
                fontSize: "14px", fontWeight: "700", cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "var(--font-sans)", letterSpacing: "0.2px",
                boxShadow: "0 4px 14px rgba(26,86,219,0.3)",
                transition: "all 0.15s",
              }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#1e3a8a"; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#1a56db"; }}
              >
                {submitting ? "Saving..." : "Join the Waitlist →"}
              </button>

              <p style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", marginTop: "12px" }}>
                No spam. We'll only email you when we launch.
              </p>
            </div>
          </>
        ) : (
          /* ── Success State ── */
          <div style={{ padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: "28px" }}>✓</div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", color: "#0f172a", fontWeight: "700", marginBottom: "10px" }}>You're on the list!</h2>
            <p style={{ fontSize: "14px", color: "#64748b", lineHeight: 1.7, maxWidth: "340px", margin: "0 auto 8px" }}>
              We're launching the FinanceIQ beta soon. You'll receive an email with early access details and everything you need to get started.
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8", marginBottom: "28px" }}>
              Keep an eye on your inbox 📬
            </p>
            <div style={{ padding: "12px 16px", background: "#f0f4f9", borderRadius: "10px", fontSize: "12px", color: "#475569", lineHeight: 1.6 }}>
              In the meantime, feel free to <strong>explore a preview</strong> of the chat below — just note that full features will be available at launch.
            </div>
            <button onClick={onClose}
              style={{
                marginTop: "20px", padding: "10px 28px",
                background: "#1a56db", border: "none", borderRadius: "10px",
                color: "#fff", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", fontFamily: "var(--font-sans)",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e3a8a"}
              onMouseLeave={e => e.currentTarget.style.background = "#1a56db"}
            >Got it, thanks!</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}


function AnimatedInputArea({ input, setInput, onSend, onKey, loading, uploadedDoc, setUploadedDoc, fileInputRef, uploadLoading, handleFileUpload, budgetExceeded, limitReached, questionCount, questionLimit, cheatMode, setCheatMode }) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "52px";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  const quickPrompts = [
    { icon: "📐", label: "TVM & DCF" },
    { icon: "📈", label: "CAPM" },
    { icon: "📉", label: "Bond Duration" },
    { icon: "🏦", label: "WACC" },
    { icon: "⚡", label: "Black-Scholes" },
    { icon: "🎯", label: "NPV vs IRR" },
  ];

  return (
    <div style={{ padding: "12px 0 20px", borderTop: "1px solid var(--border-light)", position: "relative" }}>

      {/* Question limit reached banner */}
      {limitReached && (
        <div style={{
          marginBottom: "12px", padding: "14px 18px",
          background: "linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)",
          borderRadius: "12px", textAlign: "center",
        }}>
          <div style={{ fontSize: "18px", marginBottom: "6px" }}>🎓</div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>
            You've reached the beta preview limit!
          </div>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
            You used all {questionLimit} preview questions. Full unlimited access is coming at launch — we'll email you when it's ready!
          </div>
        </div>
      )}

      {/* Question counter */}
      {!limitReached && questionCount > 0 && (
        <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ flex: 1, height: "3px", background: "var(--border-light)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(questionCount / questionLimit) * 100}%`, background: "var(--primary)", borderRadius: "2px", transition: "width 0.3s" }} />
          </div>
          <span style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-mono)", whiteSpace: "nowrap" }}>
            {questionCount}/{questionLimit} preview questions used
          </span>
        </div>
      )}

      {/* Budget warning */}
      {budgetExceeded && (
        <div style={{ marginBottom: "10px", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>⚠️</span>
          <span style={{ fontSize: "12px", color: "#b91c1c", fontWeight: "500" }}>Session limit reached. Please refresh to start a new session.</span>
        </div>
      )}

      {/* Uploaded doc badge */}
      {uploadedDoc && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", padding: "6px 12px", background: "var(--primary-light)", border: "1px solid #bfdbfe", borderRadius: "20px", width: "fit-content", fontSize: "12px" }}>
          <span>📄</span>
          <span style={{ fontWeight: "600", color: "var(--primary)", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploadedDoc.name}</span>
          <button onClick={() => setUploadedDoc(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "14px", lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Cheat mode amber indicator */}
      {cheatMode && (
        <div style={{ marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#111", border: "1px solid #f0c040",
            borderRadius: "5px", padding: "6px 14px",
            fontFamily: "var(--font-mono)", fontSize: "12px",
            color: "#f0c040", letterSpacing: "0.5px",
            textShadow: "0 0 6px #f0c04080",
          }}>
            <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#f0c040", animation: "blink 1s step-end infinite" }} />
            GENERATE PDF CHEAT SHEET
          </div>
          <button onClick={() => setCheatMode(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "13px", color: "var(--muted)" }}>×</button>
        </div>
      )}

      {/* Main animated input card */}
      <div style={{
        background: "var(--surface)",
        borderRadius: "16px",
        border: `1.5px solid ${isFocused ? "var(--primary)" : "var(--border)"}`,
        boxShadow: isFocused
          ? "0 0 0 3px rgba(26,86,219,0.08), 0 4px 16px rgba(15,23,42,0.08)"
          : "0 2px 8px rgba(15,23,42,0.06)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        overflow: "hidden",
      }}>

        {/* Textarea */}
        <div style={{ padding: "14px 16px 8px" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); adjustHeight(); }}
            onKeyDown={onKey}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={budgetExceeded || limitReached}
            placeholder={limitReached ? "Beta preview limit reached — full access coming at launch!" : budgetExceeded ? "Session limit reached — please refresh." : uploadedDoc ? `Ask about "${uploadedDoc.name}"...` : "Ask anything about finance, economics, or your exam..."}
            style={{
              width: "100%", border: "none", outline: "none", resize: "none",
              fontSize: "14px", fontFamily: "var(--font-sans)", lineHeight: "1.6",
              color: "var(--foreground)", background: "transparent",
              minHeight: "52px", maxHeight: "160px",
            }}
          />
        </div>

        {/* Bottom toolbar */}
        <div style={{ padding: "8px 12px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-light)" }}>

          {/* Left actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* PDF Upload */}
            <input ref={fileInputRef} type="file" accept="application/pdf" style={{ display: "none" }} onChange={handleFileUpload} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading || budgetExceeded}
              title="Upload curriculum PDF"
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "6px 10px", borderRadius: "8px", border: "none",
                background: uploadedDoc ? "var(--primary-light)" : "transparent",
                color: uploadedDoc ? "var(--primary)" : "var(--muted)",
                fontSize: "12px", fontFamily: "var(--font-sans)", fontWeight: "500",
                cursor: budgetExceeded ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { if (!budgetExceeded && !uploadedDoc) { e.currentTarget.style.background = "var(--background)"; e.currentTarget.style.color = "var(--foreground)"; }}}
              onMouseLeave={e => { if (!uploadedDoc) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}
            >
              <span style={{ fontSize: "15px" }}>{uploadLoading ? "⏳" : "📎"}</span>
              <span>{uploadedDoc ? "PDF attached" : "Attach PDF"}</span>
            </button>

            {/* Cheat Sheet Generator button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setCheatMode(!cheatMode)}
                disabled={budgetExceeded || limitReached}
                title="Generate a PDF cheat sheet from your next prompt"
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "6px 10px", borderRadius: "8px", fontWeight: "500",
                  fontSize: "12px", fontFamily: "var(--font-sans)", cursor: "pointer",
                  transition: "all 0.15s",
                  border: cheatMode ? "1px solid #f0c040" : "none",
                  background: cheatMode ? "#111" : "transparent",
                  color: cheatMode ? "#f0c040" : "var(--muted)",
                }}
                onMouseEnter={e => { if (!cheatMode) { e.currentTarget.style.background = "var(--background)"; e.currentTarget.style.color = "var(--foreground)"; }}}
                onMouseLeave={e => { if (!cheatMode) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--muted)"; }}}
              >
                <span style={{ fontSize: "13px" }}>📄</span>
                <span>Cheat sheet generator</span>
              </button>
            </div>
          </div>

          {/* Right: send button */}
          <button
            onClick={() => onSend()}
            disabled={loading || !input.trim() || budgetExceeded || limitReached}
            onMouseEnter={() => setIsHoveringBtn(true)}
            onMouseLeave={() => setIsHoveringBtn(false)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "10px", border: "none",
              background: input.trim() && !budgetExceeded && !limitReached ? "var(--primary)" : "var(--border-light)",
              color: input.trim() && !budgetExceeded && !limitReached ? "#fff" : "var(--muted-light)",
              fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-sans)",
              cursor: loading || !input.trim() || budgetExceeded || limitReached ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              transform: isHoveringBtn && input.trim() && !budgetExceeded && !limitReached ? "translateY(-1px)" : "translateY(0)",
              boxShadow: isHoveringBtn && input.trim() && !budgetExceeded ? "0 4px 12px rgba(26,86,219,0.25)" : "none",
            }}
          >
            {loading ? (
              <>
                <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.7)",
                      display: "inline-block",
                      animation: `bounce 1.2s infinite ${i * 0.2}s`,
                    }} />
                  ))}
                </span>
                <span>Thinking</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: "15px" }}>↑</span>
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick prompt chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
        {quickPrompts.map(p => (
          <button
            key={p.label}
            onClick={() => onSend(`Teach me ${p.label} — show the formula and a worked example.`)}
            disabled={loading || budgetExceeded}
            style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "5px 12px", borderRadius: "20px",
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--muted)", fontSize: "12px", fontFamily: "var(--font-sans)",
              cursor: loading || budgetExceeded ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "#93c5fd"; e.currentTarget.style.color = "var(--primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", fontSize: "10.5px", color: "var(--muted-light)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>
        Shift+Enter for new line · Enter to send · 📎 Attach your curriculum PDF
      </div>
    </div>
  );
}

function MessageContent({ content }) {
  return (
    <div className="msg-content">
      <KaTeXContent text={content} />
    </div>
  );
}

function KaTeXContent({ text }) {
  const [katex, setKatex] = useState(null);

  useEffect(() => {
    // Load KaTeX dynamically
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
    if (!katex) return <span className={block ? "eq-block" : "eq-inline"}>{latex}</span>;
    try {
      const html = katex.renderToString(latex, { displayMode: block, throwOnError: false });
      return block
        ? <div className="eq-block katex-block" dangerouslySetInnerHTML={{ __html: html }} />
        : <span className="eq-inline katex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <span className={block ? "eq-block" : "eq-inline"}>{latex}</span>;
    }
  };

  // Parse text into segments: block math, inline math, and markdown lines
  const renderLine = (line, i) => {
    // Block equation on its own line
    const blockMatch = line.match(/^\$\$(.+?)\$\$$/);
    if (blockMatch) return <div key={i}>{renderMath(blockMatch[1], true)}</div>;

    // Headers
    if (line.startsWith("### ")) return <h3 key={i}>{renderSegments(line.slice(4))}</h3>;
    if (line.startsWith("## "))  return <h2 key={i}>{renderSegments(line.slice(3))}</h2>;
    if (line.startsWith("# "))   return <h2 key={i}>{renderSegments(line.slice(2))}</h2>;

    // Bullets
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* "))
      return <li key={i} className="bul">{renderSegments(line.slice(2))}</li>;

    // Numbered
    const numMatch = line.match(/^(\d+)\. (.+)/);
    if (numMatch) return <li key={i} className="num">{renderSegments(numMatch[2])}</li>;

    // HR
    if (line === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "10px 0" }} />;

    // Empty
    if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;

    return <p key={i}>{renderSegments(line)}</p>;
  };

  // Split a line into inline math, bold, italic, code, plain text
  const renderSegments = (text) => {
    const parts = [];
    let remaining = text;
    let k = 0;

    while (remaining.length > 0) {
      // Block eq inline $$...$$
      const bEq = remaining.match(/^\$\$(.+?)\$\$/);
      if (bEq) { parts.push(<span key={k++}>{renderMath(bEq[1], true)}</span>); remaining = remaining.slice(bEq[0].length); continue; }
      // Inline eq $...$
      const iEq = remaining.match(/^\$([^$\n]+?)\$/);
      if (iEq) { parts.push(<span key={k++}>{renderMath(iEq[1], false)}</span>); remaining = remaining.slice(iEq[0].length); continue; }
      // Bold
      const bold = remaining.match(/^\*\*(.+?)\*\*/);
      if (bold) { parts.push(<strong key={k++}>{bold[1]}</strong>); remaining = remaining.slice(bold[0].length); continue; }
      // Italic
      const italic = remaining.match(/^\*(.+?)\*/);
      if (italic) { parts.push(<em key={k++}>{italic[1]}</em>); remaining = remaining.slice(italic[0].length); continue; }
      // Code
      const code = remaining.match(/^`(.+?)`/);
      if (code) { parts.push(<code key={k++} style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--primary-light)", padding: "1px 5px", borderRadius: 3, color: "var(--primary)" }}>{code[1]}</code>); remaining = remaining.slice(code[0].length); continue; }
      // Advance to next special char
      const next = remaining.search(/\$|\*|`/);
      if (next === -1) { parts.push(remaining); break; }
      parts.push(remaining.slice(0, next));
      remaining = remaining.slice(next);
    }
    return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : parts;
  };

  return <>{text.split("\n").map((line, i) => renderLine(line, i))}</>;
}
