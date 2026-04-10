import { useState } from "react";
import Chat from "./Chat";
import StudyTools from "./StudyTools";
import Library from "./Library";
import Community from "./Community";
import UserProfile from "./UserProfile";
import WaitlistModal from "./WaitlistModal";

export default function App() {
  const [tab, setTab] = useState("chat");
  const [showWaitlist, setShowWaitlist] = useState(true);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [profileUser, setProfileUser] = useState(null); // null = no profile open
  const [library, setLibrary] = useState([]); // shared library state

  const profile = {
    name: "Martin",
    email: "martinfurias@gmail.com",
    exam: { id: "cfa1", label: "CFA Level 1" },
  };

  const tabs = ["chat", "study", "library", "community"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
        :root {
          --primary: #1a56db; --primary-dark: #1e3a8a; --primary-light: #dbeafe;
          --background: #f0f4f9; --surface: #ffffff; --border: #cbd5e1;
          --border-light: #e2e8f0; --foreground: #0f172a; --muted: #64748b;
          --muted-light: #94a3b8; --font-sans: 'Inter', sans-serif;
          --font-serif: 'Libre Baskerville', serif; --font-mono: 'JetBrains Mono', monospace;
          --shadow-sm: 0 1px 3px rgba(15,23,42,0.08);
          --shadow-md: 0 4px 12px rgba(15,23,42,0.08);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--background); font-family: var(--font-sans); color: var(--foreground); }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.35} 30%{transform:translateY(-5px);opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
      `}</style>

      {/* Blurred background when waitlist showing */}
      <div style={{ filter: showWaitlist ? "blur(2px)" : "none", pointerEvents: showWaitlist ? "none" : "auto", transition: "filter 0.3s", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--surface)", borderBottom: "1px solid var(--border-light)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-serif)", fontSize: "17px", color: "#fff", fontWeight: "700" }}>Σ</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: "700", color: "var(--foreground)" }}>Finance<span style={{ color: "var(--primary)" }}>IQ</span></div>
            <div style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", color: "var(--primary)", background: "var(--primary-light)", border: "1px solid #bfdbfe", padding: "3px 8px", borderRadius: "4px" }}>Beta</div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "2px" }}>
            {tabs.map(t => (
              <button key={t} onClick={() => { setTab(t); setProfileUser(null); }} style={{
                padding: "6px 14px", fontSize: "13px", borderRadius: "6px", border: "none",
                background: tab === t && !profileUser ? "var(--primary)" : "transparent",
                color: tab === t && !profileUser ? "#fff" : "var(--muted)",
                cursor: "pointer", fontFamily: "var(--font-sans)", fontWeight: "500",
                textTransform: "capitalize", transition: "all 0.15s",
              }}>{t === "study" ? "Study Tools" : t.charAt(0).toUpperCase() + t.slice(1)}</button>
            ))}
          </div>

          {/* Profile badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "5px 10px 5px 5px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: "700" }}>{profile.name.charAt(0)}</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--foreground)", lineHeight: 1.2 }}>{profile.name}</div>
              <div style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "600" }}>{profile.exam.label}</div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {profileUser ? (
            <UserProfile user={profileUser} onBack={() => setProfileUser(null)} onSaveToLibrary={(item) => setLibrary(prev => [item, ...prev])} />
          ) : tab === "chat" ? (
            <Chat profile={profile} library={library} onSaveToLibrary={(item) => setLibrary(prev => [item, ...prev])} />
          ) : tab === "study" ? (
            <StudyTools onSaveToLibrary={(item) => setLibrary(prev => [item, ...prev])} />
          ) : tab === "library" ? (
            <Library items={library} setItems={setLibrary} />
          ) : (
            <Community profile={profile} library={library} onViewProfile={(user) => setProfileUser(user)} />
          )}
        </main>
      </div>

      {/* Waitlist modal */}
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
