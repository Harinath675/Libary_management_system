import { useState, useEffect, createContext, useContext } from "react";
import BookManagement from "./components/BookManagement";

const API = "http://localhost:8080/api";
const ThemeContext = createContext({ dark: true, toggle: () => {} });
function useTheme() { return useContext(ThemeContext); }

const GlobalStyle = ({ dark }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --amber: #E8A020; --amber2: #F5C842; --teal: #0D9488; --teal2: #14B8A6;
      --indigo: #4F46E5; --violet: #7C3AED; --rose: #E11D48;
      ${dark ? `
      --bg: #080B14; --bg2: #0E1220; --bg3: #141928;
      --surface: rgba(255,255,255,0.04); --surface2: rgba(255,255,255,0.07);
      --border: rgba(255,255,255,0.09); --border2: rgba(232,160,32,0.28);
      --text: #F0EDE8; --text2: #A0A8B8; --text3: #606880;
      --glow: rgba(232,160,32,0.16); --glow2: rgba(13,148,136,0.12);
      --sidebar: #0C0F1C;
      ` : `
      --bg: #F0F2F8; --bg2: #E6E9F2; --bg3: #DDE2EE;
      --surface: rgba(255,255,255,0.75); --surface2: rgba(255,255,255,0.95);
      --border: rgba(79,70,229,0.12); --border2: rgba(232,160,32,0.32);
      --text: #12152A; --text2: #4A5075; --text3: #8892A8;
      --glow: rgba(232,160,32,0.10); --glow2: rgba(13,148,136,0.08);
      --sidebar: #FFFFFF;
      `}
    }

    html, body, #root { height: 100%; font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); transition: background 0.3s, color 0.3s; }
    .serif { font-family: 'Cormorant Garamond', serif; }

    input, select, textarea {
      font-family: 'Outfit', sans-serif; background: var(--surface2); border: 1.5px solid var(--border);
      color: var(--text); padding: 13px 16px; border-radius: 10px; width: 100%; font-size: 14px; outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input:focus, select:focus { border-color: var(--amber); box-shadow: 0 0 0 4px var(--glow); }
    input::placeholder { color: var(--text3); }
    select option { background: var(--bg2); color: var(--text); }

    button { font-family: 'Outfit', sans-serif; cursor: pointer; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.22s; }
    button:disabled { opacity: 0.45; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg,var(--amber),var(--amber2)); color:#0D0E14; padding:13px 28px; box-shadow:0 4px 18px rgba(232,160,32,0.35); }
    .btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(232,160,32,0.50); }
    .btn-teal { background:linear-gradient(135deg,var(--teal),var(--teal2)); color:#fff; padding:13px 28px; box-shadow:0 4px 18px rgba(13,148,136,0.35); }
    .btn-teal:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(13,148,136,0.50); }
    .btn-ghost { background:var(--surface); border:1.5px solid var(--border); color:var(--text2); padding:12px 24px; }
    .btn-ghost:hover:not(:disabled) { border-color:var(--amber); color:var(--amber); background:var(--glow); }
    .btn-danger { background:rgba(225,29,72,0.10); border:1.5px solid rgba(225,29,72,0.30); color:#F87171; padding:8px 16px; }
    .btn-danger:hover { background:rgba(225,29,72,0.18); }
    .btn-success { background:rgba(5,150,105,0.10); border:1.5px solid rgba(5,150,105,0.30); color:#34D399; padding:8px 16px; }
    .btn-success:hover { background:rgba(5,150,105,0.18); }

    .card { background:var(--surface2); border:1.5px solid var(--border); border-radius:18px; padding:28px; ${dark?"box-shadow:0 4px 24px rgba(0,0,0,0.30);":"box-shadow:0 2px 16px rgba(79,70,229,0.07);"} }
    .card-glow { border-color:var(--border2); ${dark?"box-shadow:0 0 40px var(--glow),0 4px 24px rgba(0,0,0,0.3);":"box-shadow:0 0 30px var(--glow),0 2px 16px rgba(79,70,229,0.07);"} }
    .msg-error { background:rgba(225,29,72,0.10); border:1.5px solid rgba(225,29,72,0.28); color:#FB7185; padding:12px 16px; border-radius:10px; font-size:13px; }
    .msg-success { background:rgba(5,150,105,0.10); border:1.5px solid rgba(5,150,105,0.28); color:#34D399; padding:12px 16px; border-radius:10px; font-size:13px; }

    .page-center { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px;
      background:radial-gradient(ellipse 60% 50% at 10% 20%,rgba(232,160,32,0.09) 0%,transparent 70%),
                 radial-gradient(ellipse 50% 40% at 90% 80%,rgba(13,148,136,0.09) 0%,transparent 70%),
                 radial-gradient(ellipse 40% 60% at 50% 50%,rgba(79,70,229,0.05) 0%,transparent 70%),var(--bg); }

    .form-group { display:flex; flex-direction:column; gap:8px; }
    .form-group label { font-size:11px; font-weight:700; color:var(--text2); text-transform:uppercase; letter-spacing:1px; }

    .tag { display:inline-block; padding:3px 11px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; }
    .tag-admin     { background:rgba(232,160,32,0.15); color:var(--amber);  border:1px solid rgba(232,160,32,0.30); }
    .tag-librarian { background:rgba(13,148,136,0.15); color:var(--teal2);  border:1px solid rgba(13,148,136,0.30); }
    .tag-member    { background:rgba(79,70,229,0.12);  color:#818CF8;       border:1px solid rgba(79,70,229,0.25); }
    .tag-verified  { background:rgba(5,150,105,0.12);  color:#34D399;       border:1px solid rgba(5,150,105,0.25); }
    .tag-pending   { background:rgba(245,158,11,0.12); color:#FCD34D;       border:1px solid rgba(245,158,11,0.25); }

    .app-layout { display:flex; min-height:100vh; }
    .sidebar {
      width:268px; background:var(--sidebar);
      ${dark?"border-right:1.5px solid rgba(255,255,255,0.07); box-shadow:4px 0 32px rgba(0,0,0,0.35);"
            :"border-right:1.5px solid rgba(79,70,229,0.10); box-shadow:4px 0 24px rgba(79,70,229,0.07);"}
      display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto;
    }
    .sidebar-logo { padding:28px 22px 20px; border-bottom:1.5px solid var(--border); }
    .logo-mark { display:flex; align-items:center; gap:12px; }
    .logo-icon { width:42px; height:42px; border-radius:13px; background:linear-gradient(135deg,var(--amber),var(--teal2)); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 16px rgba(232,160,32,0.4); flex-shrink:0; }
    .logo-text { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:var(--text); }
    .logo-sub { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1.2px; margin-top:1px; }
    .sidebar-nav { flex:1; padding:16px 12px; display:flex; flex-direction:column; gap:3px; }
    .nav-item { display:flex; align-items:center; gap:12px; padding:11px 14px; border-radius:12px; font-size:14px; font-weight:500; color:var(--text2); cursor:pointer; transition:all 0.18s; border:1.5px solid transparent; position:relative; overflow:hidden; }
    .nav-item::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(180deg,var(--amber),var(--teal2)); border-radius:0 4px 4px 0; transform:scaleY(0); transition:transform 0.18s; }
    .nav-item:hover { background:var(--surface2); color:var(--text); border-color:var(--border); }
    .nav-item.active { background:linear-gradient(135deg,rgba(232,160,32,0.12),rgba(13,148,136,0.08)); border-color:rgba(232,160,32,0.25); color:var(--amber); }
    .nav-item.active::before { transform:scaleY(1); }
    .nav-icon { font-size:17px; width:22px; text-align:center; flex-shrink:0; }
    .nav-badge { margin-left:auto; background:var(--rose); color:#fff; font-size:10px; font-weight:700; border-radius:10px; padding:2px 7px; }
    .sidebar-footer { padding:14px 12px; border-top:1.5px solid var(--border); }
    .user-chip { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px; background:var(--surface); border:1.5px solid var(--border); margin-bottom:10px; }
    .avatar { width:38px; height:38px; border-radius:12px; flex-shrink:0; background:linear-gradient(135deg,var(--indigo),var(--violet)); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px; color:#fff; box-shadow:0 2px 10px rgba(124,58,237,0.4); }
    .user-chip-name { font-size:13px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .user-chip-role { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.7px; margin-top:1px; }
    .theme-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:9px 14px; border-radius:10px; background:var(--surface); border:1.5px solid var(--border); color:var(--text2); font-size:12px; font-weight:700; margin-bottom:8px; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; }
    .theme-btn:hover { border-color:var(--amber); color:var(--amber); background:var(--glow); }

    .main-content { flex:1; overflow-y:auto; background:var(--bg);
      background-image:radial-gradient(ellipse 50% 40% at 80% 10%,rgba(13,148,136,0.06) 0%,transparent 60%),
                       radial-gradient(ellipse 40% 30% at 20% 80%,rgba(232,160,32,0.06) 0%,transparent 60%); }
    .main-padded { padding:36px 44px; }
    .page-header { margin-bottom:32px; }
    .page-header h1 { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:700; color:var(--text); line-height:1.1; }
    .page-header p { color:var(--text2); margin-top:7px; font-size:14px; }

    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:16px; margin-bottom:28px; }
    .stat-card { background:var(--surface2); border:1.5px solid var(--border); border-radius:16px; padding:22px 20px; ${dark?"box-shadow:0 2px 16px rgba(0,0,0,0.25);":"box-shadow:0 2px 12px rgba(79,70,229,0.06);"} transition:transform 0.2s,box-shadow 0.2s; position:relative; overflow:hidden; }
    .stat-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--amber),var(--teal2)); }
    .stat-card:hover { transform:translateY(-3px); ${dark?"box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 20px var(--glow);":"box-shadow:0 8px 24px rgba(79,70,229,0.12);"} }
    .stat-icon { font-size:26px; margin-bottom:12px; }
    .stat-num { font-family:'Cormorant Garamond',serif; font-size:40px; font-weight:700; line-height:1; }
    .stat-label { font-size:11px; font-weight:600; color:var(--text2); margin-top:5px; text-transform:uppercase; letter-spacing:0.8px; }

    .table-wrap { overflow-x:auto; border-radius:12px; }
    table { width:100%; border-collapse:collapse; }
    thead th { text-align:left; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:var(--text3); padding:13px 18px; border-bottom:1.5px solid var(--border); }
    tbody tr { border-bottom:1px solid ${dark?"rgba(255,255,255,0.04)":"rgba(79,70,229,0.05)"}; transition:background 0.15s; }
    tbody tr:hover { background:var(--surface); }
    tbody td { padding:14px 18px; font-size:13px; color:var(--text); }

    .otp-inputs { display:flex; gap:10px; justify-content:center; margin:24px 0; }
    .otp-box { width:54px; height:62px; text-align:center; font-size:26px; font-weight:700; border-radius:12px; background:var(--surface2); border:2px solid var(--border); color:var(--text); caret-color:var(--amber); transition:border-color 0.2s,box-shadow 0.2s; }
    .otp-box:focus { border-color:var(--amber); box-shadow:0 0 0 4px var(--glow); }

    .divider { height:1px; margin:24px 0; background:linear-gradient(90deg,transparent,var(--border2),transparent); }

    @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    @keyframes shimmer { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes float  { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
    @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px var(--glow)} 50%{box-shadow:0 0 50px var(--glow),0 0 90px rgba(232,160,32,0.10)} }
    .fade-up { animation:fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) forwards; }

    .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; }
    .badge-pending  { background:rgba(245,158,11,0.15); color:#FCD34D; border:1px solid rgba(245,158,11,0.3); }
    .badge-approved { background:rgba(5,150,105,0.15);  color:#34D399; border:1px solid rgba(5,150,105,0.3); }
    .badge-rejected { background:rgba(225,29,72,0.15);  color:#FB7185; border:1px solid rgba(225,29,72,0.3); }

    .filter-tabs { display:flex; gap:8px; margin-bottom:22px; flex-wrap:wrap; }
    .filter-tab { padding:7px 18px; border-radius:22px; font-size:12px; font-weight:700; border:1.5px solid var(--border); background:transparent; color:var(--text2); cursor:pointer; transition:all 0.18s; letter-spacing:0.3px; }
    .filter-tab.active { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:#0D0E14; border-color:transparent; box-shadow:0 3px 14px rgba(232,160,32,0.4); }
    .filter-tab:hover:not(.active) { border-color:var(--amber); color:var(--amber); }

    .action-card { background:var(--surface2); border:1.5px solid var(--border); border-radius:14px; padding:18px 20px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:14px; }
    .action-card:hover { border-color:var(--amber); transform:translateY(-2px); ${dark?"box-shadow:0 8px 28px rgba(0,0,0,0.3),0 0 20px var(--glow);":"box-shadow:0 6px 20px rgba(232,160,32,0.15);"} }
    .action-card-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }

    /* ── LANDING ── */
    .landing { min-height:100vh; display:flex; flex-direction:column; background:var(--bg); position:relative; overflow:hidden;
      background-image:radial-gradient(ellipse 70% 60% at 15% 30%,rgba(232,160,32,0.08) 0%,transparent 65%),
                       radial-gradient(ellipse 60% 50% at 85% 70%,rgba(13,148,136,0.08) 0%,transparent 65%),
                       radial-gradient(ellipse 40% 40% at 60% 15%,rgba(79,70,229,0.06) 0%,transparent 60%); }
    .orb { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
    .orb-1 { width:500px; height:500px; background:rgba(232,160,32,0.11); top:-140px; left:-120px; animation:float 9s ease-in-out infinite; }
    .orb-2 { width:420px; height:420px; background:rgba(13,148,136,0.10); bottom:-100px; right:-100px; animation:float 11s ease-in-out infinite 3s; }
    .orb-3 { width:320px; height:320px; background:rgba(79,70,229,0.07); top:38%; left:52%; animation:float 8s ease-in-out infinite 1.5s; }
    .landing-nav { display:flex; align-items:center; justify-content:space-between; padding:22px 64px; position:relative; z-index:10; border-bottom:1px solid var(--border); backdrop-filter:blur(10px); background:${dark?"rgba(8,11,20,0.55)":"rgba(240,242,248,0.65)"}; }
    .landing-nav-actions { display:flex; gap:12px; align-items:center; }
    .hero { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:80px 32px 60px; position:relative; z-index:5; }
    .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; padding:6px 18px 6px 8px; background:${dark?"rgba(232,160,32,0.08)":"rgba(232,160,32,0.10)"}; border:1.5px solid rgba(232,160,32,0.28); border-radius:100px; font-size:12px; font-weight:600; color:var(--amber); margin-bottom:32px; letter-spacing:0.4px; animation:fadeUp 0.6s 0.1s both; }
    .eyebrow-dot { width:8px; height:8px; background:var(--amber); border-radius:50%; animation:shimmer 2s infinite; }
    .hero-title { font-family:'Cormorant Garamond',serif; font-size:clamp(52px,8vw,96px); font-weight:700; line-height:1.0; letter-spacing:-2px; margin-bottom:26px; }
    .hero-title .l1 { display:block; color:var(--text); animation:fadeUp 0.6s 0.2s both; }
    .hero-title .l2 { display:block; background:linear-gradient(135deg,var(--amber) 0%,var(--amber2) 40%,var(--teal2) 100%); background-size:200% 200%; animation:gradMove 4s ease infinite,fadeUp 0.6s 0.3s both; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .hero-title .l3 { display:block; color:var(--text); opacity:0.75; font-style:italic; animation:fadeUp 0.6s 0.4s both; }
    .hero-sub { font-size:18px; color:var(--text2); line-height:1.7; max-width:540px; margin:0 auto 44px; animation:fadeUp 0.6s 0.5s both; }
    .hero-cta { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; animation:fadeUp 0.6s 0.6s both; }
    .hero-stats { display:flex; gap:48px; justify-content:center; margin-top:56px; padding-top:40px; border-top:1px solid var(--border); animation:fadeUp 0.6s 0.8s both; }
    .hero-stat-num { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:700; color:var(--amber); }
    .hero-stat-label { font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; margin-top:2px; }
    .features { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border-top:1px solid var(--border); position:relative; z-index:5; }
    .feat { background:var(--bg); padding:36px 32px; transition:background 0.22s; }
    .feat:hover { background:var(--bg2); }
    .feat:hover .feat-num { color:var(--amber); }
    .feat-num { font-family:'Cormorant Garamond',serif; font-size:54px; font-weight:700; color:var(--border); line-height:1; margin-bottom:12px; transition:color 0.3s; }
    .feat-title { font-weight:700; font-size:15px; color:var(--text); margin-bottom:7px; }
    .feat-desc { font-size:13px; color:var(--text2); line-height:1.6; }

    /* ── AUTH ── */
    .auth-card { background:var(--surface2); border:1.5px solid var(--border); border-radius:22px; padding:44px; ${dark?"box-shadow:0 24px 80px rgba(0,0,0,0.5),0 0 60px var(--glow);":"box-shadow:0 16px 60px rgba(79,70,229,0.12),0 0 40px var(--glow);"} backdrop-filter:blur(20px); width:100%; max-width:460px; animation:fadeUp 0.5s 0.1s both; }
    .auth-icon { width:64px; height:64px; border-radius:18px; margin:0 auto 16px; background:linear-gradient(135deg,var(--amber),var(--teal2)); display:flex; align-items:center; justify-content:center; font-size:28px; box-shadow:0 6px 24px rgba(232,160,32,0.45); animation:glowPulse 3s ease-in-out infinite; }
    .auth-title { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:700; color:var(--text); text-align:center; }
    .auth-sub { font-size:14px; color:var(--text2); margin-top:6px; text-align:center; }
  `}</style>
);

function Spinner({ size=16 }) {
  return <span style={{ display:"inline-block", width:size, height:size, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"var(--amber)", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />;
}
function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return <button className="theme-btn" onClick={toggle}>{dark ? "☀️ Light Mode" : "🌙 Dark Mode"}</button>;
}
function Sidebar({ subtitle, navItems, activeTab, setActiveTab, user, roleLabel, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">📚</div>
          <div><div className="logo-text">LibraryMS</div><div className="logo-sub">{subtitle}</div></div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(n => (
          <div key={n.id} className={`nav-item ${activeTab===n.id?"active":""}`} onClick={()=>setActiveTab(n.id)}>
            <span className="nav-icon">{n.icon}</span><span>{n.label}</span>
            {n.badge>0 && <span className="nav-badge">{n.badge}</span>}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}><div className="user-chip-name">{user.name}</div><div className="user-chip-role">{roleLabel}</div></div>
        </div>
        <ThemeToggle />
        <button className="btn-ghost" onClick={onLogout} style={{ width:"100%" }}>Sign Out</button>
      </div>
    </aside>
  );
}

function useBookStats() {
  const [stats, setStats] = useState({ total:0, available:0, unavailable:0 });
  useEffect(() => {
    const t = localStorage.getItem("token");
    fetch(`${API}/books`, { headers: t?{Authorization:`Bearer ${t}`}:{} })
      .then(r=>r.ok?r.json():[]).then(books=>{ if(!Array.isArray(books)) return;
        setStats({ total:books.length, available:books.filter(b=>(b.availableCopies??0)>0).length, unavailable:books.filter(b=>(b.availableCopies??0)===0).length }); }).catch(()=>{});
  }, []);
  return stats;
}

function LandingPage({ navigate }) {
  const { dark, toggle } = useTheme();
  return (
    <div className="landing">
      <div className="orb orb-1"/><div className="orb orb-2"/><div className="orb orb-3"/>
      <nav className="landing-nav">
        <div className="logo-mark"><div className="logo-icon" style={{ width:38,height:38,fontSize:18 }}>📚</div><div className="logo-text" style={{ fontSize:20 }}>LibraryMS</div></div>
        <div className="landing-nav-actions">
          <button className="theme-btn" onClick={toggle} style={{ marginBottom:0,width:"auto",padding:"8px 14px",fontSize:12 }}>{dark?"☀️":"🌙"}</button>
          <button className="btn-ghost" style={{ padding:"10px 22px" }} onClick={()=>navigate("login")}>Sign In</button>
          <button className="btn-primary" style={{ padding:"10px 22px" }} onClick={()=>navigate("register")}>Get Started →</button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-eyebrow"><div className="eyebrow-dot"/><span>Library Management System</span></div>
        <h1 className="hero-title">
          <span className="l1">Knowledge Begins</span>
          <span className="l2">In Organisation</span>
          <span className="l3">At Your Fingertips</span>
        </h1>
        <p className="hero-sub">A complete platform for admins, librarians, and members. Manage books, memberships, reservations, and library operations — beautifully.</p>
        <div className="hero-cta">
          <button className="btn-primary" style={{ padding:"15px 38px",fontSize:15,borderRadius:12 }} onClick={()=>navigate("register")}>Create Free Account</button>
          <button className="btn-ghost" style={{ padding:"14px 32px",fontSize:15,borderRadius:12 }} onClick={()=>navigate("login")}>Sign In →</button>
        </div>
        <div className="hero-stats">
          {[{num:"50+",label:"Books Seeded"},{num:"3",label:"Role Types"},{num:"∞",label:"Possibilities"}].map((s,i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <div className="hero-stat-num">{s.num}</div><div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="features">
        {[
          { n:"01", t:"Role-Based Access", d:"Admin, Librarian & Member dashboards, each precisely tailored to their workflow." },
          { n:"02", t:"OTP Verification", d:"Secure email OTP ensures only verified users access your library system." },
          { n:"03", t:"Smart Reservations", d:"Members request unavailable books; librarians approve with one click." },
          { n:"04", t:"Live Statistics", d:"Real-time dashboards show book counts, availability, and user activity instantly." },
        ].map((f,i)=>(
          <div className="feat" key={i}><div className="feat-num">{f.n}</div><div className="feat-title">{f.t}</div><div className="feat-desc">{f.d}</div></div>
        ))}
      </div>
    </div>
  );
}

function RegisterPage({ navigate }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"MEMBER" });
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const handleRegister = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text()||"Registration failed");
      sessionStorage.setItem("otpEmail",form.email); sessionStorage.setItem("otpRole",form.role); navigate("otp");
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-icon">📚</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join the Library Management System</p>
        {error && <div className="msg-error" style={{ margin:"20px 0 0" }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display:"flex",flexDirection:"column",gap:16,marginTop:24 }}>
          <div className="form-group"><label>Full Name</label><input placeholder="Enter your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
          <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Create a strong password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
          <div className="form-group"><label>Register As</label>
            <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
              <option value="MEMBER">Member</option><option value="LIBRARIAN">Librarian</option>
            </select>
          </div>
          {form.role==="MEMBER"    && <p style={{ fontSize:12,color:"var(--text3)",lineHeight:1.6 }}>📧 An OTP will be sent to verify your email.</p>}
          {form.role==="LIBRARIAN" && <p style={{ fontSize:12,color:"var(--text3)",lineHeight:1.6 }}>⏳ Account requires Admin approval before login.</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:6,width:"100%",fontSize:15 }}>{loading?<Spinner/>:"Create Account →"}</button>
        </form>
        <div className="divider"/>
        <p style={{ textAlign:"center",fontSize:13,color:"var(--text2)" }}>Already have an account?{" "}<span style={{ color:"var(--amber)",cursor:"pointer",fontWeight:700 }} onClick={()=>navigate("login")}>Sign In</span></p>
        <p style={{ textAlign:"center",fontSize:12,color:"var(--text3)",marginTop:10,cursor:"pointer" }} onClick={()=>navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

function OtpPage({ navigate }) {
  const [otp, setOtp] = useState(["","","","","",""]); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const email = sessionStorage.getItem("otpEmail")||"";
  const handleChange = (idx,val) => { if(!/^\d*$/.test(val)) return; const n=[...otp]; n[idx]=val.slice(-1); setOtp(n); if(val&&idx<5) document.getElementById(`otp-${idx+1}`)?.focus(); };
  const handleKeyDown = (idx,e) => { if(e.key==="Backspace"&&!otp[idx]&&idx>0) document.getElementById(`otp-${idx-1}`)?.focus(); };
  const handleVerify = async () => {
    const s=otp.join(""); if(s.length<6){setError("Please enter all 6 digits");return;} setError(""); setLoading(true);
    try { const r=await fetch(`${API}/auth/verify?email=${encodeURIComponent(email)}&otp=${s}`,{method:"POST"}); const t=await r.text();
      if(t.includes("successfully")||t.toLowerCase().includes("verified")){setSuccess("✅ Email verified!");sessionStorage.removeItem("otpEmail");}else setError(t||"Verification failed");
    } catch{setError("Network error.");} finally{setLoading(false);}
  };
  return (
    <div className="page-center">
      <div className="auth-card" style={{ textAlign:"center" }}>
        <div className="auth-icon">✉️</div>
        <h2 className="auth-title">Verify Email</h2>
        <p className="auth-sub">6-digit code sent to <strong style={{ color:"var(--amber)" }}>{email}</strong></p>
        {error&&<div className="msg-error" style={{ marginTop:14 }}>{error}</div>}
        {success&&<div className="msg-success" style={{ marginTop:14 }}>{success}</div>}
        {!success&&<><div className="otp-inputs">{otp.map((d,i)=><input key={i} id={`otp-${i}`} className="otp-box" maxLength={1} value={d} onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)}/>)}</div>
          <button className="btn-primary" onClick={handleVerify} disabled={loading} style={{ width:"100%",padding:14 }}>{loading?<Spinner/>:"Verify Code →"}</button></>}
        {success&&<button className="btn-teal" onClick={()=>navigate("login")} style={{ width:"100%",padding:14,marginTop:16 }}>Go to Sign In →</button>}
        <p style={{ marginTop:16,fontSize:12,color:"var(--text3)" }}>Code valid for 5 minutes</p>
      </div>
    </div>
  );
}

function LoginPage({ navigate, onLogin }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res=await fetch(`${API}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!res.ok) throw new Error(await res.text()||"Login failed");
      const user=await res.json(); if(user.token) localStorage.setItem("token",user.token); onLogin(user);
    } catch(err){setError(err.message);} finally{setLoading(false);}
  };
  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-icon">🔐</div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Sign in to your library account</p>
        {error&&<div className="msg-error" style={{ margin:"20px 0 0" }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:16,marginTop:24 }}>
          <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:6,width:"100%",fontSize:15 }}>{loading?<Spinner/>:"Sign In →"}</button>
        </form>
        <div className="divider"/>
        <p style={{ textAlign:"center",fontSize:13,color:"var(--text2)" }}>Don't have an account?{" "}<span style={{ color:"var(--amber)",cursor:"pointer",fontWeight:700 }} onClick={()=>navigate("register")}>Create Account</span></p>
        <p style={{ textAlign:"center",fontSize:12,color:"var(--text3)",marginTop:10,cursor:"pointer" }} onClick={()=>navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

function ProfilePanel({ user }) {
  const [pwForm, setPwForm] = useState({ currentPassword:"",newPassword:"",confirm:"" });
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const handlePasswordChange = async (e) => {
    e.preventDefault(); setError(""); setSuccess(""); if(pwForm.newPassword!==pwForm.confirm){setError("Passwords don't match");return;} setLoading(true);
    try { const r=await fetch(`${API}/auth/change-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:user.email,currentPassword:pwForm.currentPassword,newPassword:pwForm.newPassword})});
      if(!r.ok) throw new Error(await r.text()); setSuccess("Password updated!"); setPwForm({currentPassword:"",newPassword:"",confirm:""});
    } catch(err){setError(err.message);} finally{setLoading(false);}
  };
  return (
    <div style={{ maxWidth:580 }}>
      <div className="page-header"><h1>My Profile</h1><p>Manage your account details and security</p></div>
      <div className="card card-glow" style={{ marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:20,marginBottom:26,paddingBottom:22,borderBottom:"1.5px solid var(--border)" }}>
          <div className="avatar" style={{ width:72,height:72,fontSize:28,borderRadius:20 }}>{user.name?.[0]?.toUpperCase()}</div>
          <div><h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,marginBottom:8 }}>{user.name}</h3>
            <div style={{ display:"flex",gap:8 }}><span className={`tag tag-${user.role?.toLowerCase()}`}>{user.role}</span><span className={`tag ${user.verified?"tag-verified":"tag-pending"}`}>{user.verified?"✓ Verified":"Unverified"}</span></div>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          {[{label:"Full Name",value:user.name},{label:"Email",value:user.email},{label:"Role",value:user.role},{label:"Status",value:user.approved?"Approved":"Pending"}].map((r,i)=>(
            <div key={i} style={{ background:"var(--surface)",borderRadius:10,padding:"14px 16px" }}>
              <div style={{ fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:5,fontWeight:700 }}>{r.label}</div>
              <div style={{ fontSize:14,fontWeight:500 }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:4 }}>Change Password</h3>
        <p style={{ fontSize:13,color:"var(--text2)",marginBottom:22 }}>Update your account password securely</p>
        {error&&<div className="msg-error" style={{ marginBottom:16 }}>{error}</div>}
        {success&&<div className="msg-success" style={{ marginBottom:16 }}>{success}</div>}
        <form onSubmit={handlePasswordChange} style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div className="form-group"><label>Current Password</label><input type="password" placeholder="Enter current password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} required/></div>
          <div className="form-group"><label>New Password</label><input type="password" placeholder="Enter new password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} required/></div>
          <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} required/></div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ alignSelf:"flex-start",minWidth:180 }}>{loading?<Spinner/>:"Update Password"}</button>
        </form>
      </div>
    </div>
  );
}

function ManageReservations() {
  const [reservations, setReservations] = useState([]); const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({text:"",type:""}); const [filter, setFilter] = useState("PENDING");
  const t=localStorage.getItem("token"); const h={...(t?{Authorization:`Bearer ${t}`}:{}),"Content-Type":"application/json"};
  const fetchAll=async()=>{ setLoading(true); try{const r=await fetch(`${API}/reservations/all`,{headers:h}); if(r.ok) setReservations(await r.json()); else setReservations([]);}catch{setReservations([]);} finally{setLoading(false);}};
  useEffect(()=>{fetchAll();},[]);
  const updateStatus=async(id,status)=>{
    try{const r=await fetch(`${API}/reservations/${id}/status?status=${status}`,{method:"PUT",headers:h}); setMsg({text:r.ok?`✅ ${status.toLowerCase()}!`:"❌ Failed",type:r.ok?"success":"error"}); if(r.ok) fetchAll();}
    catch{setMsg({text:"❌ Network error",type:"error"});} setTimeout(()=>setMsg({text:"",type:""}),3000);
  };
  const counts={PENDING:reservations.filter(r=>r.status==="PENDING").length,APPROVED:reservations.filter(r=>r.status==="APPROVED").length,REJECTED:reservations.filter(r=>r.status==="REJECTED").length};
  const filtered=filter==="ALL"?reservations:reservations.filter(r=>r.status===filter);
  const SB=({status})=>{ if(status==="APPROVED") return <span className="badge badge-approved">✅ Approved</span>; if(status==="REJECTED") return <span className="badge badge-rejected">❌ Rejected</span>; return <span className="badge badge-pending">⏳ Pending</span>; };
  return (
    <div>
      <div className="page-header"><h1>Book Reservations</h1><p>Review and manage member book reservation requests</p></div>
      {msg.text&&<div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}
      <div className="filter-tabs">{["PENDING","APPROVED","REJECTED","ALL"].map(f=>(
        <button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={()=>setFilter(f)}>
          {f}{f!=="ALL"&&counts[f]!==undefined&&<span style={{ marginLeft:5,background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"1px 7px",fontSize:10 }}>{counts[f]}</span>}
        </button>))}
      </div>
      <div className="card">{loading?<div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>:filtered.length===0?<div style={{ textAlign:"center",padding:60,color:"var(--text2)" }}><div style={{ fontSize:48,marginBottom:14 }}>📭</div><p>No {filter.toLowerCase()} reservations</p></div>:
        <div className="table-wrap"><table><thead><tr><th>Member</th><th>Book</th><th>Department</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {filtered.map((r,i)=>(<tr key={i}><td style={{ fontWeight:600 }}>{r.memberName||r.memberId}</td><td style={{ fontWeight:600 }}>{r.bookTitle}</td><td><span className="tag tag-librarian">{r.bookDepartment||"—"}</span></td><td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td><td><SB status={r.status}/></td><td>{r.status==="PENDING"?<div style={{ display:"flex",gap:6 }}><button className="btn-success" onClick={()=>updateStatus(r.id,"APPROVED")}>✅ Approve</button><button className="btn-danger" onClick={()=>updateStatus(r.id,"REJECTED")}>❌ Reject</button></div>:<span style={{ color:"var(--text3)",fontSize:12 }}>—</span>}</td></tr>))}
        </tbody></table></div>}
      </div>
    </div>
  );
}

function MemberReservations({ user }) {
  const [books, setBooks] = useState([]); const [reservations, setReservations] = useState([]); const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({text:"",type:""}); const [search, setSearch] = useState("");
  const t=localStorage.getItem("token"); const h={...(t?{Authorization:`Bearer ${t}`}:{}),"Content-Type":"application/json"};
  const fetchData=async()=>{ setLoading(true); try{ const [b,r]=await Promise.allSettled([fetch(`${API}/books`,{headers:h}),fetch(`${API}/reservations/my/${user.id}`,{headers:h})]);
    if(b.status==="fulfilled"&&b.value.ok) setBooks(await b.value.json()); if(r.status==="fulfilled"&&r.value.ok) setReservations(await r.value.json()); }catch{} finally{setLoading(false);} };
  useEffect(()=>{fetchData();},[]);
  const reserve=async(bookId)=>{ try{ const r=await fetch(`${API}/reservations/request`,{method:"POST",headers:h,body:JSON.stringify({bookId,memberId:user.id})});
    const txt=await r.text(); setMsg({text:r.ok?"✅ Reservation sent! Librarian will review it.":"❌ "+txt,type:r.ok?"success":"error"}); if(r.ok) fetchData(); }catch{setMsg({text:"❌ Network error",type:"error"});} setTimeout(()=>setMsg({text:"",type:""}),4000); };
  const unavail=books.filter(b=>(b.availableCopies??0)===0);
  const filtered=unavail.filter(b=>!search||b.title?.toLowerCase().includes(search.toLowerCase())||b.author?.toLowerCase().includes(search.toLowerCase()));
  const ids=new Set(reservations.map(r=>r.bookId));
  const SB=({status})=>{ if(status==="APPROVED") return <span className="badge badge-approved">✅ Approved</span>; if(status==="REJECTED") return <span className="badge badge-rejected">❌ Rejected</span>; return <span className="badge badge-pending">⏳ Pending</span>; };
  return (
    <div>
      <div className="page-header"><h1>Reserve a Book</h1><p>Request unavailable books — librarians review your request promptly</p></div>
      {msg.text&&<div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}
      {reservations.length>0&&(<div className="card card-glow" style={{ marginBottom:24 }}>
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>My Reservation Requests</h3>
        <div className="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Requested</th><th>Status</th></tr></thead><tbody>
          {reservations.map((r,i)=>(<tr key={i}><td style={{ fontWeight:600 }}>{r.bookTitle}</td><td style={{ color:"var(--text2)" }}>{r.bookAuthor}</td><td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td><td><SB status={r.status}/></td></tr>))}
        </tbody></table></div>
      </div>)}
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Unavailable Books</h3>
        <input placeholder="Search by title or author…" value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:18 }}/>
        {loading?<div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>:filtered.length===0?<div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:14 }}>🎉</div><p>{search?"No results":"All books currently available!"}</p></div>:
          <div className="table-wrap"><table><thead><tr><th>Title</th><th>Author</th><th>Department</th><th>Action</th></tr></thead><tbody>
            {filtered.map((b,i)=>(<tr key={i}><td style={{ fontWeight:600 }}>{b.title}</td><td style={{ color:"var(--text2)" }}>{b.author}</td><td><span className="tag tag-librarian">{b.department||"—"}</span></td><td>{ids.has(b.id)?<span className="badge badge-pending">Already Requested</span>:<button className="btn-primary" style={{ padding:"7px 16px",fontSize:12 }} onClick={()=>reserve(b.id)}>📌 Reserve</button>}</td></tr>))}
          </tbody></table></div>}
      </div>
    </div>
  );
}

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home"); const [pendingUsers, setPendingUsers] = useState([]); const [allUsers, setAllUsers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false); const [loadingAll, setLoadingAll] = useState(false); const [actionMsg, setActionMsg] = useState(""); const bs=useBookStats();
  const fetchPending=async()=>{setLoadingPending(true);try{const r=await fetch(`${API}/admin/pending-users`);if(r.ok)setPendingUsers(await r.json());}catch{}finally{setLoadingPending(false);}};
  const fetchAll=async()=>{setLoadingAll(true);try{const r=await fetch(`${API}/admin/all-users`);if(r.ok)setAllUsers(await r.json());}catch{}finally{setLoadingAll(false);}};
  useEffect(()=>{ if(activeTab==="home"){fetchPending();fetchAll();} if(activeTab==="pending")fetchPending(); if(activeTab==="users")fetchAll(); },[activeTab]);
  const approveUser=async(email)=>{try{const r=await fetch(`${API}/admin/approve?email=${encodeURIComponent(email)}`,{method:"POST"});setActionMsg("✅ "+await r.text());fetchPending();fetchAll();}catch{setActionMsg("❌ Failed.");}};
  const navItems=[{id:"home",icon:"🏠",label:"Dashboard"},{id:"books",icon:"📖",label:"Book Management"},{id:"reservations",icon:"📋",label:"Reservations",badge:pendingUsers.length},{id:"pending",icon:"⏳",label:"Pending Approvals"},{id:"users",icon:"👥",label:"All Users"},{id:"profile",icon:"👤",label:"My Profile"}];
  const STATS=[{icon:"📚",num:bs.total,label:"Total Books",c:"var(--amber)"},{icon:"✅",num:bs.available,label:"Available",c:"var(--teal2)"},{icon:"❌",num:bs.unavailable,label:"Unavailable",c:"#F87171"},{icon:"👥",num:allUsers.length,label:"Total Users",c:"#818CF8"},{icon:"⏳",num:pendingUsers.length,label:"Pending",c:"var(--amber2)"},{icon:"📖",num:allUsers.filter(u=>u.role==="LIBRARIAN").length,label:"Librarians",c:"var(--teal2)"}];
  return (
    <div className="app-layout">
      <Sidebar subtitle="Admin Panel" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Admin" onLogout={onLogout}/>
      <main className="main-content">
        {activeTab==="books"&&<BookManagement userRole="ADMIN"/>}
        {activeTab!=="books"&&<div className="main-padded">
          {activeTab==="home"&&<div className="fade-up">
            <div className="page-header"><h1>Welcome back, {user.name?.split(" ")[0]}! 👋</h1><p>Here's your complete library system overview</p></div>
            <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
            <div className="card"><h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Quick Actions</h3>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
                {[{icon:"📖",label:"Manage Books",c:"rgba(232,160,32,0.15)",t:"books"},{icon:"📋",label:"Reservations",c:"rgba(13,148,136,0.15)",t:"reservations"},{icon:"⏳",label:"Pending Approvals",c:"rgba(245,158,11,0.15)",t:"pending"},{icon:"👥",label:"All Users",c:"rgba(79,70,229,0.15)",t:"users"}].map((a,i)=>(
                  <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}><div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div><div style={{ fontWeight:600,fontSize:14 }}>{a.label}</div></div>))}
              </div>
            </div>
          </div>}
          {activeTab==="reservations"&&<ManageReservations/>}
          {activeTab==="pending"&&<div className="fade-up">
            <div className="page-header"><h1>Pending Approvals</h1><p>Review and approve new Librarian accounts</p></div>
            {actionMsg&&<div className="msg-success" style={{ marginBottom:16 }}>{actionMsg}</div>}
            <div className="card">{loadingPending?<div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>:pendingUsers.length===0?<div style={{ textAlign:"center",padding:60,color:"var(--text2)" }}><div style={{ fontSize:48,marginBottom:14 }}>✅</div><p>No pending approvals</p></div>:
              <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead><tbody>
                {pendingUsers.map((u,i)=><tr key={i}><td style={{ fontWeight:600 }}>{u.name}</td><td style={{ color:"var(--text2)" }}>{u.email}</td><td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td><td><button className="btn-success" onClick={()=>approveUser(u.email)}>✅ Approve</button></td></tr>)}
              </tbody></table></div>}
            </div>
          </div>}
          {activeTab==="users"&&<div className="fade-up">
            <div className="page-header"><h1>All Users</h1><p>Every registered account in the system</p></div>
            <div className="card">{loadingAll?<div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>:
              <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Approved</th></tr></thead><tbody>
                {allUsers.map((u,i)=><tr key={i}><td style={{ fontWeight:600 }}>{u.name}</td><td style={{ color:"var(--text2)" }}>{u.email}</td><td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td><td><span className={`tag ${u.verified?"tag-verified":"tag-pending"}`}>{u.verified?"Yes":"No"}</span></td><td><span className={`tag ${u.approved?"tag-verified":"tag-pending"}`}>{u.approved?"Yes":"No"}</span></td></tr>)}
              </tbody></table></div>}
            </div>
          </div>}
          {activeTab==="profile"&&<ProfilePanel user={user}/>}
        </div>}
      </main>
    </div>
  );
}

function LibrarianDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home"); const bs=useBookStats();
  const navItems=[{id:"home",icon:"🏠",label:"Dashboard"},{id:"books",icon:"📖",label:"Manage Books"},{id:"reservations",icon:"📋",label:"Reservations"},{id:"profile",icon:"👤",label:"My Profile"}];
  const STATS=[{icon:"📚",num:bs.total,label:"Total Books",c:"var(--amber)"},{icon:"✅",num:bs.available,label:"Available",c:"var(--teal2)"},{icon:"❌",num:bs.unavailable,label:"Unavailable",c:"#F87171"}];
  return (
    <div className="app-layout">
      <Sidebar subtitle="Librarian Panel" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Librarian" onLogout={onLogout}/>
      <main className="main-content">
        {activeTab==="books"&&<BookManagement userRole="LIBRARIAN"/>}
        {activeTab!=="books"&&<div className="main-padded">
          {activeTab==="home"&&<div className="fade-up">
            <div className="page-header"><h1>Librarian Dashboard</h1><p>Manage the collection and handle member reservations</p></div>
            <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
            <div className="card"><h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Quick Actions</h3>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
                {[{icon:"📖",label:"Manage Books",c:"rgba(232,160,32,0.15)",t:"books"},{icon:"📋",label:"Reservations",c:"rgba(13,148,136,0.15)",t:"reservations"}].map((a,i)=>(
                  <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}><div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div><div style={{ fontWeight:600,fontSize:14 }}>{a.label}</div></div>))}
              </div>
            </div>
          </div>}
          {activeTab==="reservations"&&<ManageReservations/>}
          {activeTab==="profile"&&<ProfilePanel user={user}/>}
        </div>}
      </main>
    </div>
  );
}

function MemberDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home"); const bs=useBookStats();
  const navItems=[{id:"home",icon:"🏠",label:"Dashboard"},{id:"browse",icon:"🔍",label:"Browse Books"},{id:"reservations",icon:"📋",label:"Reserve Books"},{id:"profile",icon:"👤",label:"My Profile"}];
  const STATS=[{icon:"📚",num:bs.total,label:"Total Books",c:"var(--amber)"},{icon:"✅",num:bs.available,label:"Available Now",c:"var(--teal2)"},{icon:"❌",num:bs.unavailable,label:"Unavailable",c:"#F87171"}];
  return (
    <div className="app-layout">
      <Sidebar subtitle="Member Portal" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Member" onLogout={onLogout}/>
      <main className="main-content">
        {activeTab==="browse"&&<BookManagement userRole="MEMBER"/>}
        {activeTab!=="browse"&&<div className="main-padded">
          {activeTab==="home"&&<div className="fade-up">
            <div style={{ background:"linear-gradient(135deg,rgba(232,160,32,0.12) 0%,rgba(13,148,136,0.10) 50%,rgba(79,70,229,0.08) 100%)",border:"1.5px solid var(--border2)",borderRadius:20,padding:"28px 32px",marginBottom:28,display:"flex",alignItems:"center",gap:20 }}>
              <div className="avatar" style={{ width:66,height:66,fontSize:26,borderRadius:18 }}>{user.name?.[0]?.toUpperCase()}</div>
              <div><h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,marginBottom:4 }}>Hello, {user.name?.split(" ")[0]}! 📚</h2>
                <p style={{ fontSize:13,color:"var(--text2)" }}>{user.email}</p>
                <div style={{ marginTop:10,display:"flex",gap:8 }}><span className="tag tag-member">Member</span><span className="tag tag-verified">✓ Verified</span></div>
              </div>
            </div>
            <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
            <div className="card"><h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Quick Actions</h3>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
                {[{icon:"🔍",label:"Browse Books",c:"rgba(232,160,32,0.15)",t:"browse"},{icon:"📋",label:"Reserve a Book",c:"rgba(13,148,136,0.15)",t:"reservations"}].map((a,i)=>(
                  <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}><div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div><div style={{ fontWeight:600,fontSize:14 }}>{a.label}</div></div>))}
              </div>
            </div>
          </div>}
          {activeTab==="reservations"&&<MemberReservations user={user}/>}
          {activeTab==="profile"&&<ProfilePanel user={user}/>}
        </div>}
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(()=>{ try{return JSON.parse(sessionStorage.getItem("libraryUser"));}catch{return null;} });
  const [dark, setDark] = useState(()=>localStorage.getItem("theme")!=="light");
  const toggleTheme=()=>setDark(d=>{const n=!d;localStorage.setItem("theme",n?"dark":"light");return n;});
  const onLogin=(u)=>{setUser(u);sessionStorage.setItem("libraryUser",JSON.stringify(u));};
  const onLogout=()=>{setUser(null);localStorage.removeItem("token");sessionStorage.removeItem("libraryUser");setPage("landing");};
  return (
    <ThemeContext.Provider value={{ dark, toggle:toggleTheme }}>
      <GlobalStyle dark={dark}/>
      {user ? (
        user.role==="ADMIN"     ? <AdminDashboard     user={user} onLogout={onLogout}/> :
        user.role==="LIBRARIAN" ? <LibrarianDashboard user={user} onLogout={onLogout}/> :
                                  <MemberDashboard    user={user} onLogout={onLogout}/>
      ) : (
        <>
          {page==="landing"  && <LandingPage  navigate={setPage}/>}
          {page==="register" && <RegisterPage navigate={setPage}/>}
          {page==="login"    && <LoginPage    navigate={setPage} onLogin={onLogin}/>}
          {page==="otp"      && <OtpPage      navigate={setPage}/>}
        </>
      )}
    </ThemeContext.Provider>
  );
}