import { useState } from "react";

const DEMO_POSTS = [
  { id: 1, author: "Julia L.", initials: "JL", color: "#7c3aed", exam: "CFA L1", time: "2 hours ago", body: "Finally got duration to click for me. The key insight: think of it as the weighted average time to receive cash flows, not just sensitivity. Once I reframed it that way everything made sense. Sharing my cheat sheet!", cheatSheet: { title: "DURATION & CONVEXITY", sub: "1-page cheat sheet · Fixed Income" }, votes: 24, comments: [
    { id: 1, author: "Alex R.", initials: "AR", color: "#059669", text: "This is exactly how my professor explained it too. The cash flow timing reframe is key!", time: "1 hour ago" },
    { id: 2, author: "Sarah K.", initials: "SK", color: "#dc2626", text: "Saved your cheat sheet — super clean. Do you have one for convexity as well?", time: "45 min ago" },
  ]},
  { id: 2, author: "Tom M.", initials: "TM", color: "#0891b2", exam: "CFA L2", time: "5 hours ago", body: "Quick tip for anyone struggling with FCFF vs FCFE: just remember FCFF is pre-debt, FCFE is post-debt. FCFF uses WACC, FCFE uses cost of equity. Once that clicks, the formulas follow naturally.", votes: 41, comments: [
    { id: 1, author: "Julia L.", initials: "JL", color: "#7c3aed", text: "Clearest explanation I've seen. Wish my textbook said it this way!", time: "4 hours ago" },
  ]},
  { id: 3, author: "Priya R.", initials: "PR", color: "#b45309", exam: "CFA L1", time: "Yesterday", body: "Is anyone else finding Ethics harder than expected? I keep second-guessing myself on the Standards. Any tips on how to approach the tricky scenarios?", votes: 17, comments: [
    { id: 1, author: "Tom M.", initials: "TM", color: "#0891b2", text: "Always ask 'what would a reasonable CFA charterholder do?' — that framing helps a lot.", time: "Yesterday" },
    { id: 2, author: "Alex R.", initials: "AR", color: "#059669", text: "Practice questions are key. The more scenarios you read, the more patterns you spot.", time: "Yesterday" },
  ]},
];

function Avatar({ initials, color, size = 28 }) {
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, color: "#fff", fontWeight: 500, flexShrink: 0 }}>{initials}</div>;
}

function Post({ post, profile, library, onViewProfile }) {
  const [votes, setVotes]           = useState(post.votes);
  const [userVote, setUserVote]     = useState(0);
  const [showComments, setShowComments] = useState(post.id === 1);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments]     = useState(post.comments);

  const vote = (dir) => { setVotes(v => v - userVote + dir); setUserVote(dir); };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), author: profile.name, initials: profile.name.charAt(0), color: "#1a56db", text: newComment, time: "Just now" }]);
    setNewComment("");
  };

  return (
    <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ cursor: "pointer" }} onClick={() => onViewProfile({ name: post.author, initials: post.initials, color: post.color, exam: post.exam })}>
            <Avatar initials={post.initials} color={post.color} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span onClick={() => onViewProfile({ name: post.author, initials: post.initials, color: post.color, exam: post.exam })} style={{ fontSize: 13, fontWeight: 500, color: "var(--foreground)", cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--foreground)"}>{post.author}</span>
              <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 3, background: "#eff6ff", color: "#1a56db", border: "0.5px solid #bfdbfe" }}>{post.exam}</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>{post.time}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.65, marginBottom: 10 }}>{post.body}</div>

        {/* Cheat sheet attachment */}
        {post.cheatSheet && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#111", border: "1px solid #f0c040", borderRadius: 8, padding: "8px 12px", marginBottom: 10, cursor: "pointer" }}>
            <div style={{ width: 28, height: 36, background: "#1a1a0a", border: "0.5px solid #f0c04060", borderRadius: 4, display: "flex", flexDirection: "column", padding: 4, gap: 2, flexShrink: 0 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ height: 2, background: i % 2 === 0 ? "#f0c040" : "#f0c04040", borderRadius: 1 }} />)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#f0c040", fontFamily: "var(--font-mono)" }}>{post.cheatSheet.title}</div>
              <div style={{ fontSize: 9, color: "#f0c04080" }}>{post.cheatSheet.sub}</div>
            </div>
            <button style={{ fontSize: 10, color: "#f0c040", border: "0.5px solid #f0c04060", background: "transparent", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Open PDF</button>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={() => vote(userVote === 1 ? 0 : 1)} style={{ padding: "3px 8px", borderRadius: 20, border: "0.5px solid var(--border)", background: userVote === 1 ? "var(--primary-light)" : "transparent", color: userVote === 1 ? "var(--primary)" : "var(--muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)" }}>▲</button>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", minWidth: 20, textAlign: "center" }}>{votes}</span>
          <button onClick={() => vote(userVote === -1 ? 0 : -1)} style={{ padding: "3px 8px", borderRadius: 20, border: "0.5px solid var(--border)", background: userVote === -1 ? "#fef2f2" : "transparent", color: userVote === -1 ? "#dc2626" : "var(--muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)" }}>▼</button>
          <button onClick={() => setShowComments(!showComments)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, border: "0.5px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            💬 {comments.length} comment{comments.length !== 1 ? "s" : ""}
          </button>
          <button style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)" }}>Share</button>
        </div>
      </div>

      {/* Comments */}
      {showComments && (
        <div style={{ background: "var(--background)", borderTop: "0.5px solid var(--border)", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Avatar initials={c.initials} color={c.color} size={22} />
              <div style={{ flex: 1, background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ fontSize: 11, fontWeight: 500, color: "var(--foreground)", marginBottom: 2 }}>{c.author}</div>
                <div style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.5 }}>{c.text}</div>
                <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 4 }}>{c.time}</div>
              </div>
            </div>
          ))}
          {/* Comment input */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Avatar initials={profile.name.charAt(0)} color="#1a56db" size={22} />
            <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()}
              placeholder="Write a comment..." style={{ flex: 1, border: "0.5px solid var(--border)", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontFamily: "var(--font-sans)", color: "var(--foreground)", background: "var(--surface)", outline: "none" }}
              onFocus={e => e.target.style.borderColor = "#1a56db"}
              onBlur={e => e.target.style.borderColor = "var(--border)"} />
            <button onClick={addComment} style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Community({ profile, library, onViewProfile }) {
  const [posts, setPosts]     = useState(DEMO_POSTS);
  const [newPost, setNewPost] = useState("");
  const [showSheet, setShowSheet] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);

  const cheatSheets = library.filter(i => i.type === "cheatsheet" || i.type === "personal-note");

  const submitPost = () => {
    if (!newPost.trim()) return;
    setPosts(prev => [{ id: Date.now(), author: profile.name, initials: profile.name.charAt(0), color: "#1a56db", exam: profile.exam?.label || "CFA L1", time: "Just now", body: newPost, cheatSheet: selectedSheet ? { title: selectedSheet.title.toUpperCase(), sub: "Shared cheat sheet" } : null, votes: 0, comments: [] }, ...prev]);
    setNewPost(""); setSelectedSheet(null); setShowSheet(false);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px", maxWidth: 760, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>

      {/* New post */}
      <div style={{ background: "var(--surface)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
          <Avatar initials={profile.name.charAt(0)} color="#1a56db" />
          <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share a question, insight, or study tip with the community..." rows={2}
            style={{ flex: 1, border: "0.5px solid var(--border)", borderRadius: 10, padding: "8px 12px", fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--foreground)", background: "var(--background)", outline: "none", resize: "none" }}
            onFocus={e => e.target.style.borderColor = "#1a56db"}
            onBlur={e => e.target.style.borderColor = "var(--border)"} />
        </div>

        {/* Selected sheet preview */}
        {selectedSheet && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#111", border: "1px solid #f0c040", borderRadius: 8, padding: "6px 10px", marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: "#f0c040", fontFamily: "var(--font-mono)", flex: 1 }}>{selectedSheet.title}</span>
            <button onClick={() => setSelectedSheet(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#f0c04080", fontSize: 14 }}>×</button>
          </div>
        )}

        {/* Sheet picker */}
        {showSheet && cheatSheets.length > 0 && (
          <div style={{ background: "var(--background)", border: "0.5px solid var(--border)", borderRadius: 10, padding: 8, marginBottom: 10 }}>
            {cheatSheets.map(s => (
              <div key={s.id} onClick={() => { setSelectedSheet(s); setShowSheet(false); }} style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, cursor: "pointer", color: "var(--foreground)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>{s.title}</div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setShowSheet(!showSheet)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-sans)" }}>
            📄 Share cheat sheet
          </button>
          <button onClick={submitPost} style={{ padding: "6px 18px", background: newPost.trim() ? "var(--primary)" : "var(--border)", color: newPost.trim() ? "#fff" : "var(--muted)", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: newPost.trim() ? "pointer" : "not-allowed", fontFamily: "var(--font-sans)", transition: "all .15s" }}>Post</button>
        </div>
      </div>

      {/* Posts */}
      {posts.map(post => (
        <Post key={post.id} post={post} profile={profile} library={library} onViewProfile={onViewProfile} />
      ))}
    </div>
  );
}
