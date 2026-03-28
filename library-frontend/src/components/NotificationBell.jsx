import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8080/api/notifications";

const TYPE_ICON = {
  BORROW_APPROVED:   "✅",
  BORROW_REJECTED:   "❌",
  DUE_REMINDER:      "⏰",
  OVERDUE:           "🚨",
  FINE_CLEARED:      "💚",
  RENEWAL_CONFIRMED: "🔄",
  GENERAL:           "📢",
};

const TYPE_COLOR = {
  BORROW_APPROVED:   "rgba(5,150,105,0.12)",
  BORROW_REJECTED:   "rgba(225,29,72,0.12)",
  DUE_REMINDER:      "rgba(245,158,11,0.12)",
  OVERDUE:           "rgba(225,29,72,0.15)",
  FINE_CLEARED:      "rgba(5,150,105,0.12)",
  RENEWAL_CONFIRMED: "rgba(13,148,136,0.12)",
  GENERAL:           "rgba(79,70,229,0.12)",
};

export default function NotificationBell({ userId }) {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const panelRef = useRef(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCount = async () => {
    try {
      const r = await fetch(`${API}/${userId}/count`, { headers: getHeaders() });
      if (r.ok) {
        const d = await r.json();
        setUnreadCount(d.unread || 0);
      }
    } catch {}
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/${userId}`, { headers: getHeaders() });
      if (r.ok) setNotifications(await r.json());
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!userId) return;
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) await fetchAll();
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API}/${userId}/read-all`, { method: "PUT", headers: getHeaders() });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const clearAll = async () => {
    try {
      await fetch(`${API}/${userId}/clear`, { method: "DELETE", headers: getHeaders() });
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60)    return "just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!userId) return null;

  return (
    <div ref={panelRef} style={{ position: "relative" }}>

      {/* ── Bell Button ── */}
      <button
        onClick={handleToggle}
        style={{
          position:       "relative",
          width:          40,
          height:         40,
          borderRadius:   12,
          background:     open ? "rgba(232,160,32,0.12)" : "rgba(255,255,255,0.06)",
          border:         open ? "1.5px solid rgba(232,160,32,0.40)" : "1.5px solid rgba(255,255,255,0.10)",
          color:          open ? "#E8A020" : "rgba(160,168,184,1)",
          fontSize:       18,
          cursor:         "pointer",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          transition:     "all 0.18s",
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position:   "absolute",
            top:        -4,
            right:      -4,
            background: "#E11D48",
            color:      "#fff",
            borderRadius: 10,
            padding:    "1px 5px",
            fontSize:   9,
            fontWeight: 800,
            minWidth:   16,
            textAlign:  "center",
            lineHeight: "14px",
            fontFamily: "'Outfit', sans-serif",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {open && (
        <div style={{
          position:     "absolute",
          top:          "calc(100% + 10px)",
          right:        0,
          width:        380,
          maxHeight:    520,
          background:   "var(--bg2)",
          border:       "1.5px solid rgba(232,160,32,0.28)",
          borderRadius: 18,
          boxShadow:    "0 24px 64px rgba(0,0,0,0.45)",
          zIndex:       99999,
          overflow:     "hidden",
          display:      "flex",
          flexDirection:"column",
          animation:    "fadeUp 0.18s ease forwards",
        }}>

          {/* Panel Header */}
          <div style={{
            padding:        "14px 18px 12px",
            borderBottom:   "1px solid rgba(255,255,255,0.07)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexShrink:     0,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:16 }}>🔔</span>
              <span style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  background: "#E11D48", color:"#fff",
                  borderRadius:10, padding:"1px 8px",
                  fontSize:10, fontWeight:800,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  fontSize:11, color:"#14B8A6", background:"none",
                  border:"none", cursor:"pointer", fontWeight:600,
                  fontFamily:"'Outfit',sans-serif",
                }}>✓ Read all</button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} style={{
                  fontSize:11, color:"#F87171", background:"none",
                  border:"none", cursor:"pointer", fontWeight:600,
                  fontFamily:"'Outfit',sans-serif",
                }}>Clear all</button>
              )}
              <button onClick={() => setOpen(false)} style={{
                fontSize:16, color:"var(--text3)", background:"none",
                border:"none", cursor:"pointer", lineHeight:1,
                fontFamily:"'Outfit',sans-serif",
              }}>✕</button>
            </div>
          </div>

          {/* Notification List */}
          <div style={{ overflowY:"auto", flex:1 }}>
            {loading ? (
              <div style={{ padding:40, textAlign:"center", color:"var(--text3)" }}>
                <div style={{
                  width:28, height:28,
                  border:"3px solid rgba(255,255,255,0.1)",
                  borderTopColor:"#E8A020", borderRadius:"50%",
                  animation:"spin 0.7s linear infinite",
                  margin:"0 auto 12px",
                }}/>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding:48, textAlign:"center", color:"var(--text3)" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🔔</div>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text2)", marginBottom:4 }}>
                  No notifications yet
                </div>
                <div style={{ fontSize:12 }}>
                  Notifications appear here when your borrow requests are updated
                </div>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} style={{
                  padding:      "12px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background:   n.isRead ? "transparent" : "rgba(232,160,32,0.03)",
                }}>
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{
                      width:34, height:34, borderRadius:10, flexShrink:0,
                      background: TYPE_COLOR[n.type] || "rgba(79,70,229,0.12)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:16, marginTop:1,
                    }}>
                      {TYPE_ICON[n.type] || "📢"}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{
                        fontWeight: n.isRead ? 500 : 700,
                        fontSize:13, color:"var(--text)",
                        marginBottom:3,
                        display:"flex", alignItems:"center", gap:6,
                      }}>
                        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span style={{
                            width:7, height:7, borderRadius:"50%",
                            background:"#E8A020", flexShrink:0, display:"inline-block",
                          }}/>
                        )}
                      </div>
                      <div style={{ fontSize:12, color:"var(--text2)", lineHeight:1.5, wordBreak:"break-word" }}>
                        {n.message}
                      </div>
                      <div style={{ fontSize:10, color:"var(--text3)", marginTop:4, fontWeight:500 }}>
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding:"9px 18px", borderTop:"1px solid rgba(255,255,255,0.06)",
              textAlign:"center", fontSize:11, color:"var(--text3)", flexShrink:0,
            }}>
              {notifications.length} notification{notifications.length !== 1 ? "s" : ""} total
            </div>
          )}
        </div>
      )}
    </div>
  );
}