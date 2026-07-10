// =============================================================================
// FILE: src/LibraryApp.jsx  —  SINGLE FILE VERSION (all features)
// =============================================================================

// ── SECTION 1: IMPORTS ───────────────────────────────────────────────────────
import { useState, useEffect, createContext, useContext, useRef } from 'react';
import BookManagement from './components/BookManagement';
import NotificationBell from './components/NotificationBell';
import { API, SERVER_URL } from './config';

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
export const FINE_PER_DAY = 10;
export const FINE_BLOCK_LIMIT = 500;
export const MAX_BORROW_AT_ONCE = 3;
export const PLAN_STANDARD = "STANDARD";
export const PLAN_PRO      = "PRO";

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// ── THEME CONTEXT ─────────────────────────────────────────────────────────────
export const ThemeContext = createContext({ dark: true, toggle: () => {} });
function useTheme() { return useContext(ThemeContext); }

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");
  const toggle = () => setDark(prev => {
    const next = !prev;
    localStorage.setItem("theme", next ? "dark" : "light");
    return next;
  });
  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

// ── GLOBAL STYLE ──────────────────────────────────────────────────────────────
function GlobalStyle({ dark }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

      :root {
        --amber:   #E8A020;
        --amber2:  #F5C842;
        --teal:    #0D9488;
        --teal2:   #14B8A6;
        --indigo:  #4F46E5;
        --violet:  #7C3AED;
        --rose:    #E11D48;
        ${dark
          ? "--bg:#080B14;--bg2:#0E1220;--bg3:#141928;--surface:rgba(255,255,255,0.04);--surface2:rgba(255,255,255,0.07);--border:rgba(255,255,255,0.09);--border2:rgba(232,160,32,0.28);--text:#F0EDE8;--text2:#A0A8B8;--text3:#606880;--glow:rgba(232,160,32,0.16);--glow2:rgba(13,148,136,0.12);--sidebar:#0C0F1C;"
          : "--bg:#F0F2F8;--bg2:#E6E9F2;--bg3:#DDE2EE;--surface:rgba(255,255,255,0.75);--surface2:rgba(255,255,255,0.95);--border:rgba(79,70,229,0.12);--border2:rgba(232,160,32,0.32);--text:#12152A;--text2:#4A5075;--text3:#8892A8;--glow:rgba(232,160,32,0.10);--glow2:rgba(13,148,136,0.08);--sidebar:#FFFFFF;"
        }
      }

      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body, #root { height: 100%; font-family: 'Outfit', sans-serif; background: var(--bg); color: var(--text); transition: background 0.3s, color 0.3s; }
      .serif { font-family: 'Cormorant Garamond', serif; }

      input, select, textarea { font-family: 'Outfit', sans-serif; background: var(--surface2); border: 1.5px solid var(--border); color: var(--text); padding: 13px 16px; border-radius: 10px; width: 100%; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
      input:focus, select:focus { border-color: var(--amber); box-shadow: 0 0 0 4px var(--glow); }
      input::placeholder { color: var(--text3); }
      select option { background: var(--bg2); color: var(--text); }

      button { font-family: 'Outfit', sans-serif; cursor: pointer; border: none; border-radius: 10px; font-weight: 600; font-size: 14px; transition: all 0.22s; }
      button:disabled { opacity: 0.45; cursor: not-allowed; }
      .btn-primary { background: linear-gradient(135deg, var(--amber), var(--amber2)); color: #0D0E14; padding: 13px 28px; box-shadow: 0 4px 18px rgba(232,160,32,0.35); }
      .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,160,32,0.50); }
      .btn-teal { background: linear-gradient(135deg, var(--teal), var(--teal2)); color: #fff; padding: 13px 28px; box-shadow: 0 4px 18px rgba(13,148,136,0.35); }
      .btn-teal:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(13,148,136,0.50); }
      .btn-ghost { background: var(--surface); border: 1.5px solid var(--border); color: var(--text2); padding: 12px 24px; }
      .btn-ghost:hover:not(:disabled) { border-color: var(--amber); color: var(--amber); background: var(--glow); }
      .btn-danger { background: rgba(225,29,72,0.10); border: 1.5px solid rgba(225,29,72,0.30); color: #F87171; padding: 8px 16px; }
      .btn-danger:hover { background: rgba(225,29,72,0.18); }
      .btn-success { background: rgba(5,150,105,0.10); border: 1.5px solid rgba(5,150,105,0.30); color: #34D399; padding: 8px 16px; }
      .btn-success:hover { background: rgba(5,150,105,0.18); }

      .card { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 18px; padding: 28px; ${dark ? "box-shadow: 0 4px 24px rgba(0,0,0,0.30);" : "box-shadow: 0 2px 16px rgba(79,70,229,0.07);"} }
      .card-glow { border-color: var(--border2); ${dark ? "box-shadow: 0 0 40px var(--glow), 0 4px 24px rgba(0,0,0,0.3);" : "box-shadow: 0 0 30px var(--glow), 0 2px 16px rgba(79,70,229,0.07);"} }

      .msg-error   { background: rgba(225,29,72,0.10);  border: 1.5px solid rgba(225,29,72,0.28);  color: #FB7185; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
      .msg-success { background: rgba(5,150,105,0.10);  border: 1.5px solid rgba(5,150,105,0.28);  color: #34D399; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
      .msg-warn    { background: rgba(245,158,11,0.10); border: 1.5px solid rgba(245,158,11,0.28); color: #FCD34D; padding: 12px 16px; border-radius: 10px; font-size: 13px; }

      .page-center { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: radial-gradient(ellipse 60% 50% at 10% 20%, rgba(232,160,32,0.09) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(13,148,136,0.09) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 50% 50%, rgba(79,70,229,0.05) 0%, transparent 70%), var(--bg); }
      .app-layout { display: flex; min-height: 100vh; }
      .form-group { display: flex; flex-direction: column; gap: 8px; }
      .form-group label { font-size: 11px; font-weight: 700; color: var(--text2); text-transform: uppercase; letter-spacing: 1px; }

      .sidebar { width: 268px; background: var(--sidebar); ${dark ? "border-right: 1.5px solid rgba(255,255,255,0.07); box-shadow: 4px 0 32px rgba(0,0,0,0.35);" : "border-right: 1.5px solid rgba(79,70,229,0.10); box-shadow: 4px 0 24px rgba(79,70,229,0.07);"} display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow-y: visible; }
      .sidebar-logo { padding: 28px 22px 20px; border-bottom: 1.5px solid var(--border); }
      .logo-mark { display: flex; align-items: center; gap: 12px; }
      .logo-icon { width: 42px; height: 42px; border-radius: 13px; background: linear-gradient(135deg,var(--amber),var(--teal2)); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 16px rgba(232,160,32,0.4); flex-shrink: 0; }
      .logo-text { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: var(--text); }
      .logo-sub { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1.2px; margin-top: 1px; }
      .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 3px; overflow-y: auto; }
      .nav-item { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 12px; font-size: 14px; font-weight: 500; color: var(--text2); cursor: pointer; transition: all 0.18s; border: 1.5px solid transparent; position: relative; overflow: hidden; }
      .nav-item::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, var(--amber), var(--teal2)); border-radius: 0 4px 4px 0; transform: scaleY(0); transition: transform 0.18s; }
      .nav-item:hover { background: var(--surface2); color: var(--text); border-color: var(--border); }
      .nav-item.active { background: linear-gradient(135deg, rgba(232,160,32,0.12), rgba(13,148,136,0.08)); border-color: rgba(232,160,32,0.25); color: var(--amber); }
      .nav-item.active::before { transform: scaleY(1); }
      .nav-icon { font-size: 17px; width: 22px; text-align: center; flex-shrink: 0; }
      .nav-badge { margin-left: auto; background: var(--rose); color: #fff; font-size: 10px; font-weight: 700; border-radius: 10px; padding: 2px 7px; }
      .sidebar-footer { padding: 14px 12px; border-top: 1.5px solid var(--border); }
      .user-chip { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px; background: var(--surface); border: 1.5px solid var(--border); margin-bottom: 10px; }
      .avatar { width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0; background: linear-gradient(135deg, var(--indigo), var(--violet)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; color: #fff; box-shadow: 0 2px 10px rgba(124,58,237,0.4); }
      .user-chip-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .user-chip-role { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; margin-top: 1px; }
      .theme-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 9px 14px; border-radius: 10px; background: var(--surface); border: 1.5px solid var(--border); color: var(--text2); font-size: 12px; font-weight: 700; margin-bottom: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.5px; }
      .theme-btn:hover { border-color: var(--amber); color: var(--amber); background: var(--glow); }

      .main-content { flex: 1; overflow-y: auto; background: var(--bg); display: flex; flex-direction: column; background-image: radial-gradient(ellipse 50% 40% at 80% 10%, rgba(13,148,136,0.06) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 20% 80%, rgba(232,160,32,0.06) 0%, transparent 60%); }
      .main-padded { padding: 36px 44px; flex: 1; overflow-y: auto; }
      .page-header { margin-bottom: 32px; }
      .page-header h1 { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: var(--text); line-height: 1.1; }
      .page-header p { color: var(--text2); margin-top: 7px; font-size: 14px; }

      .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px,1fr)); gap: 16px; margin-bottom: 28px; }
      .stat-card { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 16px; padding: 22px 20px; ${dark ? "box-shadow: 0 2px 16px rgba(0,0,0,0.25);" : "box-shadow: 0 2px 12px rgba(79,70,229,0.06);"} transition: transform 0.2s, box-shadow 0.2s; position: relative; overflow: hidden; }
      .stat-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--amber), var(--teal2)); }
      .stat-card:hover { transform: translateY(-3px); ${dark ? "box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px var(--glow);" : "box-shadow: 0 8px 24px rgba(79,70,229,0.12);"} }
      .stat-icon { font-size: 26px; margin-bottom: 12px; }
      .stat-num { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 700; line-height: 1; }
      .stat-label { font-size: 11px; font-weight: 600; color: var(--text2); margin-top: 5px; text-transform: uppercase; letter-spacing: 0.8px; }

      .table-wrap { overflow-x: auto; border-radius: 12px; }
      table { width: 100%; border-collapse: collapse; }
      thead th { text-align: left; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: var(--text3); padding: 13px 18px; border-bottom: 1.5px solid var(--border); }
      tbody tr { border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(79,70,229,0.05)"}; transition: background 0.15s; }
      tbody tr:hover { background: var(--surface); }
      tbody td { padding: 14px 18px; font-size: 13px; color: var(--text); }

      .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 24px 0; }
      .otp-box { width: 54px; height: 62px; text-align: center; font-size: 26px; font-weight: 700; border-radius: 12px; background: var(--surface2); border: 2px solid var(--border); color: var(--text); caret-color: var(--amber); transition: border-color 0.2s, box-shadow 0.2s; }
      .otp-box:focus { border-color: var(--amber); box-shadow: 0 0 0 4px var(--glow); }
      .divider { height: 1px; margin: 24px 0; background: linear-gradient(90deg, transparent, var(--border2), transparent); }

      .tag { display: inline-block; padding: 3px 11px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; }
      .tag-admin { background: rgba(232,160,32,0.15); color: var(--amber); border: 1px solid rgba(232,160,32,0.30); }
      .tag-librarian { background: rgba(13,148,136,0.15); color: var(--teal2); border: 1px solid rgba(13,148,136,0.30); }
      .tag-member { background: rgba(79,70,229,0.12); color: #818CF8; border: 1px solid rgba(79,70,229,0.25); }
      .tag-verified { background: rgba(5,150,105,0.12); color: #34D399; border: 1px solid rgba(5,150,105,0.25); }
      .tag-pending { background: rgba(245,158,11,0.12); color: #FCD34D; border: 1px solid rgba(245,158,11,0.25); }

      .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
      .badge-pending  { background: rgba(245,158,11,0.15); color: #FCD34D; border: 1px solid rgba(245,158,11,0.3); }
      .badge-approved { background: rgba(5,150,105,0.15);  color: #34D399; border: 1px solid rgba(5,150,105,0.3); }
      .badge-rejected { background: rgba(225,29,72,0.15);  color: #FB7185; border: 1px solid rgba(225,29,72,0.3); }
      .badge-returned { background: rgba(100,116,139,0.15);color: #94A3B8; border: 1px solid rgba(100,116,139,0.3); }
      .badge-overdue  { background: rgba(225,29,72,0.15);  color: #FB7185; border: 1px solid rgba(225,29,72,0.3); }
      .badge-blocked  { background: rgba(220,38,38,0.15);  color: #F87171; border: 1px solid rgba(220,38,38,0.3); }
      .badge-active   { background: rgba(5,150,105,0.15);  color: #34D399; border: 1px solid rgba(5,150,105,0.3); }
      .badge-expired  { background: rgba(225,29,72,0.15);  color: #FB7185; border: 1px solid rgba(225,29,72,0.3); }
      .badge-borrowed { background: rgba(5,150,105,0.15);  color: #34D399; border: 1px solid rgba(5,150,105,0.3); }

      .filter-tabs { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
      .filter-tab { padding: 7px 18px; border-radius: 22px; font-size: 12px; font-weight: 700; border: 1.5px solid var(--border); background: transparent; color: var(--text2); cursor: pointer; transition: all 0.18s; letter-spacing: 0.3px; }
      .filter-tab.active { background: linear-gradient(135deg, var(--amber), var(--amber2)); color: #0D0E14; border-color: transparent; box-shadow: 0 3px 14px rgba(232,160,32,0.4); }
      .filter-tab:hover:not(.active) { border-color: var(--amber); color: var(--amber); }

      .action-card { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 14px; padding: 18px 20px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 14px; }
      .action-card:hover { border-color: var(--amber); transform: translateY(-2px); ${dark ? "box-shadow: 0 8px 28px rgba(0,0,0,0.3), 0 0 20px var(--glow);" : "box-shadow: 0 6px 20px rgba(232,160,32,0.15);"} }
      .action-card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }

      .landing { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg); position: relative; overflow: hidden; background-image: radial-gradient(ellipse 70% 60% at 15% 30%, rgba(232,160,32,0.08) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 85% 70%, rgba(13,148,136,0.08) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 60% 15%, rgba(79,70,229,0.06) 0%, transparent 60%); }
      .orb { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
      .orb-1 { width: 500px; height: 500px; background: rgba(232,160,32,0.11); top: -140px; left: -120px; animation: float 9s ease-in-out infinite; }
      .orb-2 { width: 420px; height: 420px; background: rgba(13,148,136,0.10); bottom: -100px; right: -100px; animation: float 11s ease-in-out infinite 3s; }
      .orb-3 { width: 320px; height: 320px; background: rgba(79,70,229,0.07); top: 38%; left: 52%; animation: float 8s ease-in-out infinite 1.5s; }
      .landing-nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 64px; position: relative; z-index: 10; border-bottom: 1px solid var(--border); backdrop-filter: blur(10px); background: ${dark ? "rgba(8,11,20,0.55)" : "rgba(240,242,248,0.65)"}; }
      .landing-nav-actions { display: flex; gap: 12px; align-items: center; }
      .hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 32px 60px; position: relative; z-index: 5; }
      .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px 6px 8px; background: ${dark ? "rgba(232,160,32,0.08)" : "rgba(232,160,32,0.10)"}; border: 1.5px solid rgba(232,160,32,0.28); border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--amber); margin-bottom: 32px; letter-spacing: 0.4px; animation: fadeUp 0.6s 0.1s both; }
      .eyebrow-dot { width: 8px; height: 8px; background: var(--amber); border-radius: 50%; animation: shimmer 2s infinite; }
      .hero-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(52px,8vw,96px); font-weight: 700; line-height: 1.0; letter-spacing: -2px; margin-bottom: 26px; }
      .hero-title .l1 { display: block; color: var(--text); animation: fadeUp 0.6s 0.2s both; }
      .hero-title .l2 { display: block; background: linear-gradient(135deg,var(--amber) 0%,var(--amber2) 40%,var(--teal2) 100%); background-size: 200% 200%; animation: gradMove 4s ease infinite, fadeUp 0.6s 0.3s both; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      .hero-title .l3 { display: block; color: var(--text); opacity: 0.75; font-style: italic; animation: fadeUp 0.6s 0.4s both; }
      .hero-sub { font-size: 18px; color: var(--text2); line-height: 1.7; max-width: 540px; margin: 0 auto 44px; animation: fadeUp 0.6s 0.5s both; }
      .hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.6s 0.6s both; }
      .hero-stats { display: flex; gap: 48px; justify-content: center; margin-top: 56px; padding-top: 40px; border-top: 1px solid var(--border); animation: fadeUp 0.6s 0.8s both; }
      .hero-stat-num { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: var(--amber); }
      .hero-stat-label { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; }
      .features { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); border-top: 1px solid var(--border); position: relative; z-index: 5; }
      .feat { background: var(--bg); padding: 36px 32px; transition: background 0.22s; }
      .feat:hover { background: var(--bg2); }
      .feat:hover .feat-num { color: var(--amber); }
      .feat-num { font-family: 'Cormorant Garamond', serif; font-size: 54px; font-weight: 700; color: var(--border); line-height: 1; margin-bottom: 12px; transition: color 0.3s; }
      .feat-title { font-weight: 700; font-size: 15px; color: var(--text); margin-bottom: 7px; }
      .feat-desc { font-size: 13px; color: var(--text2); line-height: 1.6; }

      .auth-card { background: var(--surface2); border: 1.5px solid var(--border); border-radius: 22px; padding: 44px; ${dark ? "box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 60px var(--glow);" : "box-shadow: 0 16px 60px rgba(79,70,229,0.12), 0 0 40px var(--glow);"} backdrop-filter: blur(20px); width: 100%; max-width: 460px; animation: fadeUp 0.5s 0.1s both; }
      .auth-icon { width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 16px; background: linear-gradient(135deg,var(--amber),var(--teal2)); display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 6px 24px rgba(232,160,32,0.45); animation: glowPulse 3s ease-in-out infinite; }
      .auth-title { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 700; color: var(--text); text-align: center; }
      .auth-sub { font-size: 14px; color: var(--text2); margin-top: 6px; text-align: center; }

      @keyframes fadeUp    { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes spin      { to   { transform: rotate(360deg); } }
      @keyframes shimmer   { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      @keyframes float     { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
      @keyframes gradMove  { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      @keyframes glowPulse { 0%,100% { box-shadow: 0 0 20px var(--glow); } 50% { box-shadow: 0 0 50px var(--glow), 0 0 90px rgba(232,160,32,0.10); } }
      .fade-up { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) forwards; }

      /* ── CHATBOT ── */
      .chatbot-bubble {
        position: fixed;
        bottom: 28px;
        right: 28px;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--amber), var(--teal2));
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        box-shadow: 0 6px 28px rgba(232,160,32,0.45);
        z-index: 9999;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .chatbot-bubble:hover { transform: scale(1.1); box-shadow: 0 10px 36px rgba(232,160,32,0.55); }
      .chatbot-window {
        position: fixed;
        bottom: 92px;
        right: 28px;
        width: 380px;
        height: 540px;
        background: var(--bg2);
        border: 1.5px solid var(--border2);
        border-radius: 20px;
        box-shadow: 0 24px 64px rgba(0,0,0,0.45);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: fadeUp 0.2s ease forwards;
      }
      .chatbot-header {
        padding: 14px 18px;
        background: linear-gradient(135deg, rgba(232,160,32,0.12), rgba(13,148,136,0.08));
        border-bottom: 1.5px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .chatbot-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .chatbot-msg-bot {
        background: var(--surface2);
        border: 1.5px solid var(--border);
        border-radius: 14px 14px 14px 4px;
        padding: 10px 14px;
        font-size: 13px;
        color: var(--text);
        max-width: 88%;
        line-height: 1.55;
        align-self: flex-start;
      }
      .chatbot-msg-user {
        background: linear-gradient(135deg, rgba(232,160,32,0.18), rgba(13,148,136,0.12));
        border: 1.5px solid rgba(232,160,32,0.25);
        border-radius: 14px 14px 4px 14px;
        padding: 10px 14px;
        font-size: 13px;
        color: var(--text);
        max-width: 88%;
        align-self: flex-end;
        line-height: 1.55;
      }
      .chatbot-suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 0 16px 10px;
        flex-shrink: 0;
      }
      .chatbot-suggestion-btn {
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 20px;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: 600;
        color: var(--text2);
        cursor: pointer;
        transition: all 0.15s;
        font-family: 'Outfit', sans-serif;
      }
      .chatbot-suggestion-btn:hover { border-color: var(--amber); color: var(--amber); background: var(--glow); }
      .chatbot-input-row {
        padding: 12px 14px;
        border-top: 1.5px solid var(--border);
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
      .chatbot-input {
        flex: 1;
        background: var(--surface);
        border: 1.5px solid var(--border);
        border-radius: 12px;
        padding: 9px 14px;
        font-size: 13px;
        color: var(--text);
        outline: none;
        font-family: 'Outfit', sans-serif;
        width: auto;
      }
      .chatbot-input:focus { border-color: var(--amber); box-shadow: 0 0 0 3px var(--glow); }
      .chatbot-send-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--amber), var(--amber2));
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        flex-shrink: 0;
        transition: transform 0.15s;
      }
      .chatbot-send-btn:hover { transform: scale(1.08); }
      .chatbot-typing {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 10px 14px;
        background: var(--surface2);
        border: 1.5px solid var(--border);
        border-radius: 14px 14px 14px 4px;
        width: fit-content;
        align-self: flex-start;
      }
      .chatbot-typing span {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: var(--amber);
        animation: chatDot 1.2s ease-in-out infinite;
        display: inline-block;
      }
      .chatbot-typing span:nth-child(2) { animation-delay: 0.2s; }
      .chatbot-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes chatDot { 0%,80%,100% { transform: scale(0.7); opacity:0.5; } 40% { transform: scale(1); opacity:1; } }
    `}</style>
  );
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return (
    <span style={{ display:"inline-block", width:size, height:size, border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"var(--amber)", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
  );
}

function StatusBadge({ status }) {
  const classMap = { PENDING:"badge-pending", APPROVED:"badge-approved", REJECTED:"badge-rejected", BORROWED:"badge-borrowed", RETURNED:"badge-returned", OVERDUE:"badge-overdue", BLOCKED:"badge-blocked", ACTIVE:"badge-active", EXPIRED:"badge-expired" };
  return <span className={`badge ${classMap[status] || "badge-pending"}`}>{status}</span>;
}

function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return <button className="theme-btn" onClick={toggle}>{dark ? "☀️ Light Mode" : "🌙 Dark Mode"}</button>;
}

// ── TOP BAR ───────────────────────────────────────────────────────────────────
function TopBar({ user, roleLabel }) {
  const { dark, toggle } = useTheme();
  return (
    <div style={{
      height:56, background:"var(--surface2)", borderBottom:"1.5px solid var(--border)",
      display:"flex", alignItems:"center", justifyContent:"flex-end",
      padding:"0 28px", gap:12, position:"sticky", top:0, zIndex:1000, flexShrink:0,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginRight:8 }}>
        <div style={{ width:32, height:32, borderRadius:9, background:"linear-gradient(135deg,var(--indigo),var(--violet))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", lineHeight:1.2 }}>{user?.name}</div>
          <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.6px" }}>{roleLabel}</div>
        </div>
      </div>
      <div style={{ width:1, height:24, background:"var(--border)", flexShrink:0 }} />
      <button onClick={toggle} title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"} style={{ width:40, height:40, borderRadius:12, background:"rgba(255,255,255,0.06)", border:"1.5px solid var(--border)", color:"var(--text2)", fontSize:17, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s" }}>
        {dark ? "☀️" : "🌙"}
      </button>
      {user?.id && <NotificationBell userId={user.id} />}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
function Sidebar({ subtitle, navItems, activeTab, setActiveTab, user, roleLabel, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">📚</div>
          <div>
            <div className="logo-text">LibraryMS</div>
            <div className="logo-sub">{subtitle}</div>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(n => (
          <div key={n.id} className={`nav-item ${activeTab === n.id ? "active" : ""}`} onClick={() => setActiveTab(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="user-chip-name">{user.name}</div>
            <div className="user-chip-role">{roleLabel}</div>
          </div>
        </div>
        <button className="btn-ghost" onClick={onLogout} style={{ width:"100%" }}>Sign Out</button>
      </div>
    </aside>
  );
}

function useBookStats() {
  const [stats, setStats] = useState({ total:0, available:0, unavailable:0 });
  useEffect(() => {
    fetch(`${API}/books`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(books => {
        if (!Array.isArray(books)) return;
        setStats({ total:books.length, available:books.filter(b=>(b.availableCopies??0)>0).length, unavailable:books.filter(b=>(b.availableCopies??0)===0).length });
      }).catch(()=>{});
  }, []);
  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHATBOT COMPONENT
// Role-aware chatbot that fetches real data from the Spring Boot backend.
// Admin/Librarian see system-wide stats; Members see their own data.
// ═══════════════════════════════════════════════════════════════════════════
function LibraryChatbot({ user }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const messagesEndRef = useRef(null);
  const role = user?.role || "MEMBER";

  // Auto-scroll to latest message
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, typing]);

  // Welcome message on open
  useEffect(() => {
    if (open && messages.length === 0) {
      const greet = role === "ADMIN"
        ? `Hi ${user?.name?.split(" ")[0]} 👋 I'm your Library Assistant. I can tell you about books, users, borrows, fines and subscriptions. What would you like to know?`
        : role === "LIBRARIAN"
        ? `Hi ${user?.name?.split(" ")[0]} 👋 I'm your Library Assistant. Ask me about books, borrow requests, active borrows, overdue books or fines!`
        : `Hi ${user?.name?.split(" ")[0]} 👋 I'm your Library Assistant. Ask me about your borrowed books, due dates, fines, subscription or available books!`;
      setMessages([{ from:"bot", text: greet }]);
    }
  }, [open]);

  // ── Suggestion chips per role ─────────────────────────────────────────────
  const suggestions = role === "ADMIN" ? [
    "How many books are there?",
    "How many users?",
    "Pending borrow requests?",
    "Total overdue books?",
    "Members with fines?",
    "Active subscriptions?",
  ] : role === "LIBRARIAN" ? [
    "How many books?",
    "Available books?",
    "Pending requests?",
    "Overdue books?",
    "Active borrows?",
    "Books with fines?",
  ] : [
    "My borrowed books",
    "My due dates",
    "My outstanding fine",
    "My subscription",
    "Available books count",
    "My borrow history",
  ];

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const get = async (url) => {
    const r = await fetch(`${API}${url}`, { headers: authHeaders() });
    return r.ok ? r.json() : null;
  };

  // ── Natural language → answer ─────────────────────────────────────────────
  const getAnswer = async (q) => {
    const lq = q.toLowerCase();

    // ── ADMIN & LIBRARIAN answers ──────────────────────────────────────────
    if (role === "ADMIN" || role === "LIBRARIAN") {

      if (lq.includes("how many book") || lq.includes("total book") || lq.includes("book count")) {
        const books = await get("/books");
        if (!books) return "Couldn't fetch book data right now.";
        const avail = books.filter(b=>(b.availableCopies??0)>0).length;
        const unavail = books.filter(b=>(b.availableCopies??0)===0).length;
        return `📚 **Total Books:** ${books.length}\n✅ Available: ${avail}\n❌ Unavailable: ${unavail}`;
      }

      if (lq.includes("available book")) {
        const books = await get("/books");
        if (!books) return "Couldn't fetch book data.";
        const avail = books.filter(b=>(b.availableCopies??0)>0);
        return `✅ **Available Books:** ${avail.length} out of ${books.length} total books are available for borrowing.`;
      }

      if (lq.includes("unavailable") || lq.includes("not available")) {
        const books = await get("/books");
        if (!books) return "Couldn't fetch book data.";
        const unavail = books.filter(b=>(b.availableCopies??0)===0);
        return `❌ **Unavailable Books:** ${unavail.length} books are currently fully borrowed out.`;
      }

      if (lq.includes("pending") && (lq.includes("request") || lq.includes("borrow"))) {
        const requests = await get("/borrow/requests/all");
        if (!requests) return "Couldn't fetch borrow requests.";
        const pending = requests.filter(r=>r.status==="PENDING");
        return `⏳ **Pending Borrow Requests:** ${pending.length}\n\nThese are waiting for your approval.`;
      }

      if (lq.includes("overdue")) {
        const borrowings = await get("/borrow/borrowings/all");
        if (!borrowings) return "Couldn't fetch borrowings.";
        const overdue = borrowings.filter(b=>b.status==="OVERDUE");
        return `🚨 **Overdue Books:** ${overdue.length} book(s) are overdue.\n\nFine accruing at ₹${FINE_PER_DAY}/day per book.`;
      }

      if (lq.includes("active borrow") || lq.includes("currently borrowed")) {
        const borrowings = await get("/borrow/borrowings/all");
        if (!borrowings) return "Couldn't fetch borrowings.";
        const active = borrowings.filter(b=>b.status==="BORROWED"||b.status==="OVERDUE");
        return `📖 **Active Borrows:** ${active.length} book(s) are currently out.\n📖 Borrowed: ${borrowings.filter(b=>b.status==="BORROWED").length}\n🚨 Overdue: ${borrowings.filter(b=>b.status==="OVERDUE").length}`;
      }

      if (lq.includes("fine") || lq.includes("penalty")) {
        const borrowings = await get("/borrow/borrowings/all");
        if (!borrowings) return "Couldn't fetch fine data.";
        const fineMap = {};
        borrowings.forEach(b => {
          if (!b.finePaid && b.fineAmount > 0) {
            if (!fineMap[b.memberId]) fineMap[b.memberId] = { name:b.memberName, total:0 };
            fineMap[b.memberId].total += b.fineAmount;
          }
        });
        const fineMembers = Object.values(fineMap);
        const totalFine = fineMembers.reduce((s,m)=>s+m.total, 0);
        const blocked = fineMembers.filter(m=>m.total>=FINE_BLOCK_LIMIT).length;
        return `💰 **Outstanding Fines:**\n👤 Members with fines: ${fineMembers.length}\n💸 Total unpaid: ₹${totalFine.toFixed(0)}\n🔒 Blocked accounts: ${blocked}`;
      }

      if ((role === "ADMIN") && (lq.includes("user") || lq.includes("member") || lq.includes("librarian"))) {
        const users = await get("/admin/all-users");
        if (!users) return "Couldn't fetch user data.";
        const members = users.filter(u=>u.role==="MEMBER").length;
        const librarians = users.filter(u=>u.role==="LIBRARIAN").length;
        const admins = users.filter(u=>u.role==="ADMIN").length;
        return `👥 **Total Users:** ${users.length}\n👤 Members: ${members}\n📚 Librarians: ${librarians}\n⭐ Admins: ${admins}`;
      }

      if (lq.includes("subscription") || lq.includes("plan")) {
        const subs = await get("/subscriptions/all");
        if (!subs) return "Couldn't fetch subscription data.";
        const active = subs.filter(s=>s.status==="ACTIVE").length;
        const expired = subs.filter(s=>s.status==="EXPIRED").length;
        return `🎫 **Subscriptions:**\n✅ Active: ${active}\n❌ Expired: ${expired}\n📊 Total: ${subs.length}`;
      }

      if (lq.includes("reservation")) {
        const res = await get("/reservations/all");
        if (!res) return "Couldn't fetch reservations.";
        const pending = res.filter(r=>r.status==="PENDING").length;
        return `📌 **Reservations:**\n⏳ Pending: ${pending}\n✅ Approved: ${res.filter(r=>r.status==="APPROVED").length}\n❌ Rejected: ${res.filter(r=>r.status==="REJECTED").length}`;
      }

      return `I can help you with:\n• Book counts & availability\n• Borrow requests & active borrows\n• Overdue books & fines\n• Subscriptions\n${role==="ADMIN" ? "• User statistics\n" : ""}• Reservations\n\nTry asking one of the suggestions below! 👇`;
    }

    // ── MEMBER answers ─────────────────────────────────────────────────────
    if (role === "MEMBER") {

      if (lq.includes("my book") || lq.includes("i borrowed") || lq.includes("currently") || lq.includes("borrow")) {
        const borrowings = await get(`/borrow/borrowings/my/${user.id}`);
        if (!borrowings) return "Couldn't fetch your borrowings.";
        const active = borrowings.filter(b=>b.status==="BORROWED"||b.status==="OVERDUE");
        if (active.length === 0) return "📭 You don't have any books currently borrowed.";
        const list = active.map(b => {
          const due = b.dueDate ? new Date(b.dueDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";
          const overdue = b.status==="OVERDUE" ? " 🚨 OVERDUE" : "";
          return `• ${b.bookTitle} — due ${due}${overdue}`;
        }).join("\n");
        return `📖 **Your Current Books (${active.length}):**\n${list}`;
      }

      if (lq.includes("due") || lq.includes("return date") || lq.includes("deadline")) {
        const borrowings = await get(`/borrow/borrowings/my/${user.id}`);
        if (!borrowings) return "Couldn't fetch your due dates.";
        const active = borrowings.filter(b=>b.status==="BORROWED"||b.status==="OVERDUE");
        if (active.length === 0) return "✅ You have no books due — nothing currently borrowed!";
        const list = active.map(b => {
          const due = b.dueDate ? new Date(b.dueDate) : null;
          const days = due ? Math.ceil((due - new Date())/(1000*60*60*24)) : null;
          const dueStr = due ? due.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
          const daysStr = days !== null ? (days < 0 ? ` (${Math.abs(days)}d overdue 🚨)` : days === 0 ? " (due today! ⚠️)" : ` (${days}d left)`) : "";
          return `• ${b.bookTitle}: ${dueStr}${daysStr}`;
        }).join("\n");
        return `📅 **Your Due Dates:**\n${list}`;
      }

      if (lq.includes("fine") || lq.includes("penalty") || lq.includes("fee")) {
        const borrowings = await get(`/borrow/borrowings/my/${user.id}`);
        if (!borrowings) return "Couldn't fetch your fine details.";
        const unpaid = borrowings.filter(b=>!b.finePaid && b.fineAmount>0);
        const total = unpaid.reduce((s,b)=>s+b.fineAmount, 0);
        if (total === 0) return "✅ You have no outstanding fines! You're all clear.";
        const list = unpaid.map(b=>`• ${b.bookTitle}: ₹${b.fineAmount.toFixed(0)}`).join("\n");
        return `💰 **Your Outstanding Fines: ₹${total.toFixed(0)}**\n${list}\n\nPlease pay at the library counter.${total>=FINE_BLOCK_LIMIT ? "\n\n🔒 Your account is BLOCKED — pay to restore access." : ""}`;
      }

      if (lq.includes("subscription") || lq.includes("plan") || lq.includes("membership")) {
        const sub = await get(`/subscriptions/my/${user.id}`);
        if (!sub || sub.status === "NONE") return "❌ You don't have an active subscription. Go to the Subscription tab to subscribe!";
        if (sub.status === "EXPIRED") return "⚠️ Your subscription has expired. Please renew it in the Subscription tab.";
        const days = Math.max(0, Math.ceil((new Date(sub.expiresAt)-new Date())/(1000*60*60*24)));
        return `🎫 **Your Subscription:**\n📦 Plan: ${sub.planName}\n📚 Max books: ${sub.maxBooks>=999?"Unlimited":sub.maxBooks}\n📅 Expires: ${new Date(sub.expiresAt).toLocaleDateString("en-IN")}\n⏳ Days left: ${days}`;
      }

      if (lq.includes("available") || lq.includes("how many book")) {
        const books = await get("/books");
        if (!books) return "Couldn't fetch book data.";
        const avail = books.filter(b=>(b.availableCopies??0)>0).length;
        return `📚 **Library Stats:**\n✅ Available to borrow: ${avail} books\n📖 Total in library: ${books.length} books`;
      }

      if (lq.includes("history") || lq.includes("past") || lq.includes("returned")) {
        const borrowings = await get(`/borrow/borrowings/my/${user.id}`);
        if (!borrowings) return "Couldn't fetch your history.";
        const returned = borrowings.filter(b=>b.status==="RETURNED");
        if (returned.length === 0) return "📭 You haven't returned any books yet.";
        return `📋 **Your Borrowing History:**\nYou have borrowed ${borrowings.length} book(s) total.\n✅ Returned: ${returned.length}\n📖 Active: ${borrowings.filter(b=>b.status==="BORROWED").length}\n🚨 Overdue: ${borrowings.filter(b=>b.status==="OVERDUE").length}`;
      }

      if (lq.includes("request") || lq.includes("pending")) {
        const requests = await get(`/borrow/requests/my/${user.id}`);
        if (!requests) return "Couldn't fetch your requests.";
        const pending = requests.filter(r=>r.status==="PENDING");
        if (pending.length === 0) return "📭 You have no pending borrow requests.";
        return `⏳ **Your Pending Request:**\n${pending.map(r=>`• ${r.bookTitles} (${r.bookCount} book${r.bookCount>1?"s":""})`).join("\n")}\n\nWaiting for librarian approval!`;
      }

      return `I can help you with:\n• Your borrowed books & due dates\n• Outstanding fines\n• Your subscription details\n• Available books in the library\n• Your borrowing history\n\nTry one of the suggestions below! 👇`;
    }

    return "I'm not sure about that. Try asking about books, borrows, or fines!";
  };

  // ── Format bot message (handles **bold** and \n) ──────────────────────────
  const formatMsg = (text) => {
    return text.split("\n").map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <div key={i} style={{ marginBottom: i < text.split("\n").length-1 ? 3 : 0 }}>
          {parts.map((p, j) => j%2===1 ? <strong key={j}>{p}</strong> : p)}
        </div>
      );
    });
  };

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    setMessages(prev => [...prev, { from:"user", text:q }]);
    setTyping(true);
    try {
      const answer = await getAnswer(q);
      setMessages(prev => [...prev, { from:"bot", text:answer }]);
    } catch {
      setMessages(prev => [...prev, { from:"bot", text:"Something went wrong. Please try again!" }]);
    }
    setTyping(false);
  };

  const handleKey = (e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <>
      {/* Floating bubble */}
      <button className="chatbot-bubble" onClick={() => setOpen(o=>!o)} title="Library Assistant">
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:"linear-gradient(135deg,var(--amber),var(--teal2))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>Library Assistant</div>
                <div style={{ fontSize:11, color:"var(--teal2)", fontWeight:600 }}>● Online · {role} mode</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:18, cursor:"pointer" }}>✕</button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={m.from==="bot" ? "chatbot-msg-bot" : "chatbot-msg-user"}>
                {m.from==="bot" ? formatMsg(m.text) : m.text}
              </div>
            ))}
            {typing && (
              <div className="chatbot-typing">
                <span/><span/><span/>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          <div className="chatbot-suggestions">
            {suggestions.slice(0,4).map((s, i) => (
              <button key={i} className="chatbot-suggestion-btn" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>

          {/* Input row */}
          <div className="chatbot-input-row">
            <input
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className="chatbot-send-btn" onClick={() => sendMessage()}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── AUTH PAGES ────────────────────────────────────────────────────────────────
function LandingPage({ navigate }) {
  const { dark, toggle } = useTheme();
  return (
    <div className="landing">
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      <nav className="landing-nav">
        <div className="logo-mark">
          <div className="logo-icon" style={{ width:38, height:38, fontSize:18 }}>📚</div>
          <div className="logo-text" style={{ fontSize:20 }}>LibraryMS</div>
        </div>
        <div className="landing-nav-actions">
          <button className="theme-btn" onClick={toggle} style={{ marginBottom:0, width:"auto", padding:"8px 14px", fontSize:12 }}>{dark ? "☀️" : "🌙"}</button>
          <button className="btn-ghost" style={{ padding:"10px 22px" }} onClick={() => navigate("login")}>Sign In</button>
          <button className="btn-primary" style={{ padding:"10px 22px" }} onClick={() => navigate("register")}>Get Started →</button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-eyebrow"><div className="eyebrow-dot" /><span>Library Management System</span></div>
        <h1 className="hero-title">
          <span className="l1">Knowledge Begins</span>
          <span className="l2">In Organisation</span>
          <span className="l3">At Your Fingertips</span>
        </h1>
        <p className="hero-sub">A complete platform for admins, librarians, and members. Manage books, memberships, reservations, borrows and fines — beautifully.</p>
        <div className="hero-cta">
          <button className="btn-primary" style={{ padding:"15px 38px", fontSize:15, borderRadius:12 }} onClick={() => navigate("register")}>Create Free Account</button>
          <button className="btn-ghost" style={{ padding:"14px 32px", fontSize:15, borderRadius:12 }} onClick={() => navigate("login")}>Sign In →</button>
        </div>
        <div className="hero-stats">
          {[{num:"50+",label:"Books Seeded"},{num:"3",label:"Role Types"},{num:"∞",label:"Possibilities"}].map((s,i)=>(
            <div key={i} style={{ textAlign:"center" }}><div className="hero-stat-num">{s.num}</div><div className="hero-stat-label">{s.label}</div></div>
          ))}
        </div>
      </section>
      <div className="features">
        {[{n:"01",t:"Role-Based Access",d:"Admin, Librarian & Member dashboards, each precisely tailored to their workflow."},{n:"02",t:"OTP Verification",d:"Secure email OTP ensures only verified users can access your library system."},{n:"03",t:"Smart Reservations",d:"Members request unavailable books; librarians approve with one click."},{n:"04",t:"Borrow & Fine System",d:"Borrow up to 3 books. ₹10/day overdue fine. Auto-block at ₹500. Subscription plans included."}].map((f,i)=>(
          <div className="feat" key={i}><div className="feat-num">{f.n}</div><div className="feat-title">{f.t}</div><div className="feat-desc">{f.d}</div></div>
        ))}
      </div>
    </div>
  );
}

function RegisterPage({ navigate }) {
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"MEMBER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleRegister = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text() || "Registration failed");
      sessionStorage.setItem("otpEmail", form.email);
      navigate("otp");
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-icon">📚</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join the Library Management System</p>
        {error && <div className="msg-error" style={{ margin:"20px 0 0" }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:16, marginTop:24 }}>
          <div className="form-group"><label>Full Name</label><input placeholder="Enter your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></div>
          <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Create a strong password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
          <div className="form-group"><label>Register As</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="MEMBER">Member</option><option value="LIBRARIAN">Librarian</option></select></div>
          {form.role==="MEMBER" && <p style={{ fontSize:12, color:"var(--text3)", lineHeight:1.6 }}>📧 An OTP will be sent to your email to verify your account.</p>}
          {form.role==="LIBRARIAN" && <p style={{ fontSize:12, color:"var(--text3)", lineHeight:1.6 }}>⏳ Librarian accounts require Admin approval before you can log in.</p>}
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:6, width:"100%", fontSize:15 }}>{loading ? <Spinner /> : "Create Account →"}</button>
        </form>
        <div className="divider" />
        <p style={{ textAlign:"center", fontSize:13, color:"var(--text2)" }}>Already have an account? <span style={{ color:"var(--amber)", cursor:"pointer", fontWeight:700 }} onClick={() => navigate("login")}>Sign In</span></p>
        <p style={{ textAlign:"center", fontSize:12, color:"var(--text3)", marginTop:10, cursor:"pointer" }} onClick={() => navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

function OtpPage({ navigate }) {
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const email = sessionStorage.getItem("otpEmail") || "";
  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx+1}`)?.focus();
  };
  const handleKeyDown = (idx, e) => { if (e.key==="Backspace" && !otp[idx] && idx>0) document.getElementById(`otp-${idx-1}`)?.focus(); };
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter all 6 digits"); return; }
    setError(""); setLoading(true);
    try {
      const r = await fetch(`${API}/auth/verify?email=${encodeURIComponent(email)}&otp=${code}`, { method:"POST" });
      const txt = await r.text();
      if (txt.includes("successfully") || txt.toLowerCase().includes("verified")) { setSuccess("✅ Email verified! You can now sign in."); sessionStorage.removeItem("otpEmail"); }
      else setError(txt || "Verification failed.");
    } catch { setError("Network error."); } finally { setLoading(false); }
  };
  return (
    <div className="page-center">
      <div className="auth-card" style={{ textAlign:"center" }}>
        <div className="auth-icon">✉️</div>
        <h2 className="auth-title">Verify Email</h2>
        <p className="auth-sub">Enter the 6-digit code sent to <strong style={{ color:"var(--amber)" }}>{email}</strong></p>
        {error && <div className="msg-error" style={{ marginTop:14 }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginTop:14 }}>{success}</div>}
        {!success && (<><div className="otp-inputs">{otp.map((digit,i)=><input key={i} id={`otp-${i}`} className="otp-box" maxLength={1} value={digit} onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)} />)}</div><button className="btn-primary" onClick={handleVerify} disabled={loading} style={{ width:"100%", padding:14 }}>{loading ? <Spinner /> : "Verify Code →"}</button></>)}
        {success && <button className="btn-teal" onClick={() => navigate("login")} style={{ width:"100%", padding:14, marginTop:16 }}>Go to Sign In →</button>}
        <p style={{ marginTop:16, fontSize:12, color:"var(--text3)" }}>Code is valid for 5 minutes</p>
      </div>
    </div>
  );
}

function LoginPage({ navigate, onLogin }) {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text() || "Login failed");
      const user = await res.json();
      if (user.token) localStorage.setItem("token", user.token);
      onLogin(user);
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-icon">🔐</div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Sign in to your library account</p>
        {error && <div className="msg-error" style={{ margin:"20px 0 0" }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16, marginTop:24 }}>
          <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:6, width:"100%", fontSize:15 }}>{loading ? <Spinner /> : "Sign In →"}</button>
        </form>
        <div className="divider" />
        <p style={{ textAlign:"center", fontSize:13, color:"var(--text2)" }}>Don't have an account? <span style={{ color:"var(--amber)", cursor:"pointer", fontWeight:700 }} onClick={() => navigate("register")}>Create Account</span></p>
        <p style={{ textAlign:"center", fontSize:12, color:"var(--text3)", marginTop:10, cursor:"pointer" }} onClick={() => navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

// ── PROFILE PANEL ─────────────────────────────────────────────────────────────
function ProfilePanel({ user }) {
  const [pwForm, setPwForm] = useState({ currentPassword:"", newPassword:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handlePasswordChange = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    if (pwForm.newPassword !== pwForm.confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/change-password`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ email:user.email, currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword }) });
      if (!r.ok) throw new Error(await r.text());
      setSuccess("✅ Password updated successfully!");
      setPwForm({ currentPassword:"", newPassword:"", confirm:"" });
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };
  return (
    <div style={{ maxWidth:580 }}>
      <div className="page-header"><h1>My Profile</h1><p>Manage your account details and security settings</p></div>
      <div className="card card-glow" style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:26, paddingBottom:22, borderBottom:"1.5px solid var(--border)" }}>
          <div className="avatar" style={{ width:72, height:72, fontSize:28, borderRadius:20 }}>{user.name?.[0]?.toUpperCase()}</div>
          <div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, marginBottom:8 }}>{user.name}</h3>
            <div style={{ display:"flex", gap:8 }}>
              <span className={`tag tag-${user.role?.toLowerCase()}`}>{user.role}</span>
              <span className={`tag ${user.verified ? "tag-verified" : "tag-pending"}`}>{user.verified ? "✓ Verified" : "Unverified"}</span>
            </div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[{label:"Full Name",value:user.name},{label:"Email",value:user.email},{label:"Role",value:user.role},{label:"Status",value:user.approved?"Approved":"Pending"}].map((row,i)=>(
            <div key={i} style={{ background:"var(--surface)", borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:5, fontWeight:700 }}>{row.label}</div>
              <div style={{ fontSize:14, fontWeight:500 }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:4 }}>Change Password</h3>
        <p style={{ fontSize:13, color:"var(--text2)", marginBottom:22 }}>Update your account password securely</p>
        {error && <div className="msg-error" style={{ marginBottom:16 }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginBottom:16 }}>{success}</div>}
        <form onSubmit={handlePasswordChange} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="form-group"><label>Current Password</label><input type="password" placeholder="Enter your current password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})} required /></div>
          <div className="form-group"><label>New Password</label><input type="password" placeholder="Enter your new password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})} required /></div>
          <div className="form-group"><label>Confirm New Password</label><input type="password" placeholder="Re-enter your new password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})} required /></div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ alignSelf:"flex-start", minWidth:180 }}>{loading ? <Spinner /> : "Update Password"}</button>
        </form>
      </div>
    </div>
  );
}

// ── MANAGE RESERVATIONS ───────────────────────────────────────────────────────
function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text:"", type:"" });
  const [filter, setFilter] = useState("PENDING");
  const fetchAll = async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/reservations/all`, { headers:authHeaders() }); setReservations(r.ok ? await r.json() : []); }
    catch { setReservations([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const updateStatus = async (id, status) => {
    try {
      const r = await fetch(`${API}/reservations/${id}/status?status=${status}`, { method:"PUT", headers:authHeaders() });
      setMsg({ text: r.ok ? `✅ Reservation ${status.toLowerCase()}!` : "❌ Update failed", type: r.ok ? "success" : "error" });
      if (r.ok) fetchAll();
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  };
  const counts = { PENDING:reservations.filter(r=>r.status==="PENDING").length, APPROVED:reservations.filter(r=>r.status==="APPROVED").length, REJECTED:reservations.filter(r=>r.status==="REJECTED").length };
  const filtered = filter==="ALL" ? reservations : reservations.filter(r=>r.status===filter);
  return (
    <div>
      <div className="page-header"><h1>Book Reservations</h1><p>Manage member waitlist requests for currently unavailable books</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}
      <div className="filter-tabs">
        {["PENDING","APPROVED","REJECTED","ALL"].map(f=>(
          <button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
            {f}{f!=="ALL" && counts[f]!==undefined && <span style={{ marginLeft:5, background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"1px 7px", fontSize:10 }}>{counts[f]}</span>}
          </button>
        ))}
      </div>
      <div className="card">
        {loading ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
        : filtered.length===0 ? <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}><div style={{ fontSize:48, marginBottom:14 }}>📭</div><p>No {filter.toLowerCase()} reservations</p></div>
        : <div className="table-wrap"><table><thead><tr><th>Member</th><th>Book Title</th><th>Department</th><th>Requested On</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {filtered.map((r,i)=>(
            <tr key={i}>
              <td style={{ fontWeight:600 }}>{r.memberName||r.memberId}</td>
              <td style={{ fontWeight:600 }}>{r.bookTitle}</td>
              <td><span className="tag tag-librarian">{r.bookDepartment||"—"}</span></td>
              <td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td>
              <td><StatusBadge status={r.status} /></td>
              <td>{r.status==="PENDING" ? <div style={{ display:"flex", gap:6 }}><button className="btn-success" onClick={()=>updateStatus(r.id,"APPROVED")}>✅ Approve</button><button className="btn-danger" onClick={()=>updateStatus(r.id,"REJECTED")}>❌ Reject</button></div> : <span style={{ color:"var(--text3)", fontSize:12 }}>—</span>}</td>
            </tr>
          ))}
        </tbody></table></div>}
      </div>
    </div>
  );
}

// ── MEMBER RESERVATIONS ───────────────────────────────────────────────────────
function MemberReservations({ user }) {
  const [books, setBooks] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text:"", type:"" });
  const [search, setSearch] = useState("");
  const fetchData = async () => {
    setLoading(true);
    try {
      const [bR, rR] = await Promise.allSettled([fetch(`${API}/books`,{headers:authHeaders()}), fetch(`${API}/reservations/my/${user.id}`,{headers:authHeaders()})]);
      if (bR.status==="fulfilled" && bR.value.ok) setBooks(await bR.value.json());
      if (rR.status==="fulfilled" && rR.value.ok) setReservations(await rR.value.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);
  const reserve = async (bookId) => {
    try {
      const r = await fetch(`${API}/reservations/request`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ bookId, memberId:user.id }) });
      const txt = await r.text();
      setMsg({ text: r.ok ? "✅ Reservation sent!" : `❌ ${txt}`, type: r.ok ? "success" : "error" });
      if (r.ok) fetchData();
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 4000);
  };
  const unavailableBooks = books.filter(b=>(b.availableCopies??0)===0);
  const filteredBooks = unavailableBooks.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase()));
  const alreadyReservedIds = new Set(reservations.map(r=>r.bookId));
  return (
    <div>
      <div className="page-header"><h1>Reserve a Book</h1><p>These books are currently unavailable. Submit a request and a librarian will notify you when available.</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}
      {reservations.length > 0 && (
        <div className="card card-glow" style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>My Reservation Requests</h3>
          <div className="table-wrap"><table><thead><tr><th>Book Title</th><th>Author</th><th>Requested On</th><th>Status</th></tr></thead><tbody>
            {reservations.map((r,i)=>(
              <tr key={i}><td style={{ fontWeight:600 }}>{r.bookTitle}</td><td style={{ color:"var(--text2)" }}>{r.bookAuthor}</td><td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td><td><StatusBadge status={r.status} /></td></tr>
            ))}
          </tbody></table></div>
        </div>
      )}
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Unavailable Books ({unavailableBooks.length})</h3>
        <input placeholder="Search by title or author…" value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:18 }} />
        {loading ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
        : filteredBooks.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:14 }}>🎉</div><p>{search?"No results":"All books are currently available!"}</p></div>
        : <div className="table-wrap"><table><thead><tr><th>Title</th><th>Author</th><th>Department</th><th>Action</th></tr></thead><tbody>
          {filteredBooks.map((b,i)=>(
            <tr key={i}><td style={{ fontWeight:600 }}>{b.title}</td><td style={{ color:"var(--text2)" }}>{b.author}</td><td><span className="tag tag-librarian">{b.department||"—"}</span></td>
            <td>{alreadyReservedIds.has(b.id) ? <span className="badge badge-pending">Already Requested</span> : <button className="btn-primary" style={{ padding:"7px 16px", fontSize:12 }} onClick={()=>reserve(b.id)}>📌 Reserve</button>}</td></tr>
          ))}
        </tbody></table></div>}
      </div>
    </div>
  );
}

// ── MANAGE BORROWINGS ─────────────────────────────────────────────────────────
function ReturnModal({ borrowing, onClose, onConfirm }) {
  const [damaged,      setDamaged]      = useState(false);
  const [damageFine,   setDamageFine]   = useState("");
  const [damageReason, setDamageReason] = useState("");
  const [loading,      setLoading]      = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm({
      damaged,
      damageFine:   damaged ? parseFloat(damageFine || 0) : 0,
      damageReason: damaged ? damageReason : null,
    });
    setLoading(false);
  };

  const overdueFine = (() => {
    if (!borrowing.dueDate) return 0;
    const due = new Date(borrowing.dueDate);
    const now = new Date();
    if (now <= due) return 0;
    const days = Math.ceil((now - due) / (1000 * 60 * 60 * 24));
    return Math.max(1, days) * 10;
  })();

  const totalPreview = overdueFine + parseFloat(damageFine || 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position:"fixed", inset:0,
          background:"rgba(0,0,0,0.6)",
          zIndex:10000,
        }}
      />

      {/* Scrollable wrapper centers the modal */}
      <div style={{
        position:"fixed", inset:0,
        zIndex:10001,
        overflowY:"auto",
        display:"flex",
        alignItems:"flex-start",
        justifyContent:"center",
        padding:"20px 16px",
      }}>

        {/* Modal card */}
        <div style={{
          width:"100%",
          maxWidth:460,
          background:"var(--bg2)",
          border:"1.5px solid rgba(232,160,32,0.28)",
          borderRadius:18,
          padding:24,
          marginTop:"auto",
          marginBottom:"auto",
        }}>

          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{
              width:40, height:40, borderRadius:10,
              background:"linear-gradient(135deg,var(--teal),var(--teal2))",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, flexShrink:0,
            }}>📥</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:16, color:"var(--text)" }}>Return Book</div>
              <div style={{ fontSize:12, color:"var(--text2)" }}>{borrowing.memberName} — {borrowing.bookTitle}</div>
            </div>
            <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--text3)", fontSize:18, cursor:"pointer", lineHeight:1 }}>✕</button>
          </div>

          {/* Info row */}
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:10, marginBottom:18,
            background:"var(--surface)",
            border:"1.5px solid var(--border)",
            borderRadius:12, padding:14,
          }}>
            {[
              { label:"Member",       value: borrowing.memberName },
              { label:"Book",         value: borrowing.bookTitle  },
              { label:"Due Date",     value: borrowing.dueDate ? new Date(borrowing.dueDate).toLocaleDateString("en-IN") : "—" },
              { label:"Overdue Fine", value: `₹${overdueFine}`, red: overdueFine > 0 },
            ].map((r,i) => (
              <div key={i}>
                <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.8px", fontWeight:700, marginBottom:2 }}>{r.label}</div>
                <div style={{ fontSize:13, fontWeight:600, color: r.red ? "#F87171" : "var(--text)" }}>{r.value}</div>
              </div>
            ))}
          </div>

          {/* Damage question */}
          <div style={{
            background: damaged ? "rgba(225,29,72,0.06)" : "var(--surface)",
            border:`1.5px solid ${damaged ? "rgba(225,29,72,0.30)" : "var(--border)"}`,
            borderRadius:12, padding:14, marginBottom:14,
          }}>
            <div style={{ fontWeight:700, fontSize:13, color:"var(--text)", marginBottom:12 }}>
              📋 Is the book damaged?
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => { setDamaged(false); setDamageFine(""); setDamageReason(""); }}
                style={{
                  flex:1, padding:"10px", borderRadius:8, fontSize:13, fontWeight:700,
                  background: !damaged ? "linear-gradient(135deg,var(--teal),var(--teal2))" : "var(--surface2)",
                  border: !damaged ? "none" : "1.5px solid var(--border)",
                  color: !damaged ? "#fff" : "var(--text2)",
                  cursor:"pointer", fontFamily:"'Outfit',sans-serif",
                }}
              >✅ No Damage</button>
              <button
                onClick={() => setDamaged(true)}
                style={{
                  flex:1, padding:"10px", borderRadius:8, fontSize:13, fontWeight:700,
                  background: damaged ? "rgba(225,29,72,0.15)" : "var(--surface2)",
                  border: damaged ? "1.5px solid rgba(225,29,72,0.45)" : "1.5px solid var(--border)",
                  color: damaged ? "#F87171" : "var(--text2)",
                  cursor:"pointer", fontFamily:"'Outfit',sans-serif",
                }}
              >⚠️ Book Damaged</button>
            </div>
          </div>

          {/* Damage details */}
          {damaged && (
            <div style={{
              background:"rgba(225,29,72,0.05)",
              border:"1.5px solid rgba(225,29,72,0.22)",
              borderRadius:12, padding:14, marginBottom:14,
            }}>
              {/* Reason input */}
              <div className="form-group" style={{ marginBottom:12 }}>
                <label style={{ color:"#F87171" }}>Damage Description</label>
                <input
                  placeholder="e.g. Torn pages, water damage..."
                  value={damageReason}
                  onChange={e => setDamageReason(e.target.value)}
                  style={{ borderColor:"rgba(225,29,72,0.35)", padding:"10px 12px" }}
                />
              </div>

              {/* Preset chips */}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:11, color:"#F87171", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:8 }}>
                  Quick Amount
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  {[50,100,200,500].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setDamageFine(amt.toString())}
                      style={{
                        flex:1, padding:"7px 0", borderRadius:20, fontSize:12, fontWeight:700,
                        background: damageFine===amt.toString() ? "rgba(225,29,72,0.20)" : "var(--surface)",
                        border: damageFine===amt.toString() ? "1.5px solid rgba(225,29,72,0.55)" : "1.5px solid var(--border)",
                        color: damageFine===amt.toString() ? "#F87171" : "var(--text2)",
                        cursor:"pointer", fontFamily:"'Outfit',sans-serif",
                      }}
                    >₹{amt}</button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div className="form-group" style={{ marginBottom: damageFine && parseFloat(damageFine)>0 ? 12 : 0 }}>
                <label style={{ color:"#F87171" }}>Custom Amount (₹)</label>
                <input
                  type="number" min={0}
                  placeholder="Enter custom damage fine"
                  value={damageFine}
                  onChange={e => setDamageFine(e.target.value)}
                  style={{ borderColor:"rgba(225,29,72,0.35)", padding:"10px 12px" }}
                />
              </div>

              {/* Total preview */}
              {damageFine && parseFloat(damageFine) > 0 && (
                <div style={{
                  padding:"10px 14px", background:"rgba(225,29,72,0.10)",
                  borderRadius:8, fontSize:13, color:"#F87171", fontWeight:700,
                }}>
                  💰 Total = ₹{totalPreview.toFixed(0)}
                  <span style={{ fontWeight:400, fontSize:11, color:"var(--text2)", marginLeft:6 }}>
                    (₹{overdueFine} overdue + ₹{parseFloat(damageFine).toFixed(0)} damage)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={onClose} className="btn-ghost" style={{ flex:1, padding:"11px" }}>
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || (damaged && !damageFine)}
              style={{
                flex:2, padding:"11px", borderRadius:10, fontSize:14, fontWeight:700,
                background: damaged
                  ? "linear-gradient(135deg,#E11D48,#BE123C)"
                  : "linear-gradient(135deg,var(--teal),var(--teal2))",
                border:"none", color:"#fff",
                cursor:(loading||(damaged&&!damageFine))?"not-allowed":"pointer",
                opacity:(loading||(damaged&&!damageFine))?0.5:1,
                fontFamily:"'Outfit',sans-serif",
              }}
            >
              {loading
                ? <Spinner />
                : damaged
                  ? `⚠️ Return + ₹${parseFloat(damageFine||0).toFixed(0)} Fine`
                  : "📥 Confirm Return"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

function ManageBorrowings({ userRole }) {
  const [requests, setRequests] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [tab, setTab] = useState("requests");
  const [msg, setMsg] = useState({ text:"", type:"" });
  const [dueDays, setDueDays] = useState(14);
  const [approving, setApproving] = useState(null);
  const [search, setSearch] = useState("");
  const [returnModal, setReturnModal] = useState(null);
  const fetchAll = async () => {
    try {
      const [rR, bR] = await Promise.allSettled([fetch(`${API}/borrow/requests/all`,{headers:authHeaders()}), fetch(`${API}/borrow/borrowings/all`,{headers:authHeaders()})]);
      if (rR.status==="fulfilled" && rR.value.ok) setRequests(await rR.value.json());
      if (bR.status==="fulfilled" && bR.value.ok) setBorrowings(await bR.value.json());
    } catch {}
  };
  useEffect(() => { fetchAll(); }, []);
  const approveRequest = async (id) => {
    try {
      const r = await fetch(`${API}/borrow/requests/${id}/approve`, { method:"PUT", headers:authHeaders(), body:JSON.stringify({ dueDays, approvedBy:userRole }) });
      const txt = await r.text();
      setMsg({ text: r.ok ? `✅ ${txt}` : `❌ ${txt}`, type: r.ok ? "success" : "error" });
      if (r.ok) { setApproving(null); fetchAll(); }
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  };
  const rejectRequest = async (id) => {
    try {
      const r = await fetch(`${API}/borrow/requests/${id}/reject`, { method:"PUT", headers:authHeaders() });
      setMsg({ text: r.ok ? "✅ Request rejected" : "❌ Failed", type: r.ok ? "success" : "error" });
      if (r.ok) fetchAll();
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  };
const returnBook = async ({ id, damaged, damageFine, damageReason }) => {
  try {
    const r = await fetch(`${API}/borrow/borrowings/${id}/return`, {
      method:  "PUT",
      headers: authHeaders(),
      body:    JSON.stringify({ damaged, damageFine, damageReason }),
    });
    const txt = await r.text();
    setMsg({ text: r.ok ? `✅ ${txt}` : `❌ ${txt}`, type: r.ok ? "success" : "error" });
    if (r.ok) { setReturnModal(null); fetchAll(); }
  } catch {
    setMsg({ text:"❌ Network error", type:"error" });
  }
  setTimeout(() => setMsg({ text:"", type:"" }), 4000);
};
  const payFine = async (memberId, memberName) => {
    try {
      const r = await fetch(`${API}/borrow/borrowings/${memberId}/pay-fine`, { method:"PUT", headers:authHeaders() });
      setMsg({ text: r.ok ? `✅ Fine cleared for ${memberName}. Account unblocked.` : "❌ Failed", type: r.ok ? "success" : "error" });
      if (r.ok) fetchAll();
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 4000);
  };
  const pendingRequests  = requests.filter(r=>r.status==="PENDING");
  const activeBorrowings = borrowings.filter(b=>b.status==="BORROWED"||b.status==="OVERDUE");
  const overdueBorrowings = borrowings.filter(b=>b.status==="OVERDUE");
  const filteredAll = borrowings.filter(b => !search || b.memberName?.toLowerCase().includes(search.toLowerCase()) || b.bookTitle?.toLowerCase().includes(search.toLowerCase()));
  const memberFineMap = {};
  borrowings.forEach(b => { if (!b.finePaid && b.fineAmount>0) { if (!memberFineMap[b.memberId]) memberFineMap[b.memberId]={name:b.memberName,email:b.memberEmail,memberId:b.memberId,total:0}; memberFineMap[b.memberId].total+=b.fineAmount; } });
  const fineMembers = Object.values(memberFineMap);
  return (
    <div>
      <div className="page-header"><h1>Manage Borrowings</h1><p>Handle borrow requests, returns, fines, and member account status</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:24 }}>
        {[{icon:"⏳",label:"Pending Requests",value:pendingRequests.length,c:"#FCD34D"},{icon:"📖",label:"Active Borrows",value:activeBorrowings.length,c:"var(--teal2)"},{icon:"⚠️",label:"Overdue",value:overdueBorrowings.length,c:"#F87171"},{icon:"💰",label:"Members with Fines",value:fineMembers.length,c:"#F87171"}].map((s,i)=>(
          <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ fontSize:32, color:s.c }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div className="filter-tabs">
        {[{id:"requests",label:`⏳ Borrow Requests${pendingRequests.length>0?` (${pendingRequests.length})`:""}`},{id:"active",label:"📖 Active Borrows"},{id:"all",label:"📋 All Borrowings"},{id:"fines",label:`💰 Fines${fineMembers.length>0?` (${fineMembers.length})`:""}`}].map(t=>(
          <button key={t.id} className={`filter-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {tab==="requests" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Borrow Requests</h3>
          {requests.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:12 }}>📭</div><p>No borrow requests yet</p></div>
          : <div className="table-wrap"><table><thead><tr><th>Member</th><th>Books Requested</th><th>Count</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {requests.map((r,i)=>(
              <tr key={i}>
                <td><div style={{ fontWeight:600 }}>{r.memberName}</div><div style={{ fontSize:11, color:"var(--text3)" }}>{r.memberEmail}</div></td>
                <td style={{ maxWidth:260, fontSize:13 }}>{r.bookTitles}</td>
                <td style={{ textAlign:"center", fontWeight:700, color:"var(--amber)" }}>{r.bookCount}</td>
                <td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.status==="PENDING" && (approving===r.id ?
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="number" value={dueDays} min={1} max={90} onChange={e=>setDueDays(parseInt(e.target.value))} style={{ width:60, padding:"6px 8px", fontSize:12 }} />
                    <span style={{ fontSize:12, color:"var(--text2)" }}>days</span>
                    <button className="btn-success" style={{ padding:"6px 12px", fontSize:12 }} onClick={()=>approveRequest(r.id)}>✅ Confirm</button>
                    <button className="btn-ghost" style={{ padding:"6px 10px", fontSize:12 }} onClick={()=>setApproving(null)}>✕</button>
                  </div>
                  : <div style={{ display:"flex", gap:6 }}><button className="btn-success" onClick={()=>setApproving(r.id)}>✅ Approve</button><button className="btn-danger" onClick={()=>rejectRequest(r.id)}>❌ Reject</button></div>
                )}{r.status!=="PENDING" && <span style={{ color:"var(--text3)", fontSize:12 }}>{r.approvedBy||"—"}</span>}</td>
              </tr>
            ))}
          </tbody></table></div>}
        </div>
      )}
      {tab==="active" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Active Borrows</h3>
          {activeBorrowings.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:12 }}>📚</div><p>No books currently borrowed</p></div>
          : <div className="table-wrap"><table><thead><tr><th>Member</th><th>Book</th><th>Borrowed On</th><th>Due Date</th><th>Fine (₹)</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {activeBorrowings.map((b,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{b.memberName}</td><td style={{ fontWeight:600 }}>{b.bookTitle}</td>
                <td style={{ color:"var(--text2)" }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString():"—"}</td>
                <td style={{ color:b.status==="OVERDUE"?"#F87171":"var(--teal2)", fontWeight:600 }}>{b.dueDate?new Date(b.dueDate).toLocaleDateString():"—"}</td>
                <td style={{ color:b.fineAmount>0?"#F87171":"var(--teal2)", fontWeight:700 }}>₹{b.fineAmount?.toFixed(0)||0}</td>
                <td><StatusBadge status={b.status} /></td>
                <td><button className="btn-teal" style={{ padding:"6px 14px", fontSize:12 }}
  onClick={() => setReturnModal(b)}>
  📥 Return
</button></td>
              </tr>
            ))}
          </tbody></table></div>}
        </div>
      )}
      {tab==="all" && (
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, gap:12 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22 }}>All Borrowings</h3>
            <input placeholder="Search member or book…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:260 }} />
          </div>
          <div className="table-wrap"><table><thead><tr><th>Member</th><th>Book</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead><tbody>
            {filteredAll.map((b,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{b.memberName}</td><td>{b.bookTitle}</td>
                <td style={{ color:"var(--text2)" }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString():"—"}</td>
                <td style={{ color:b.status==="OVERDUE"?"#F87171":"var(--text2)" }}>{b.dueDate?new Date(b.dueDate).toLocaleDateString():"—"}</td>
                <td style={{ color:"var(--text2)" }}>{b.returnedAt?new Date(b.returnedAt).toLocaleDateString():"—"}</td>
                <td style={{ color:b.fineAmount>0?"#F87171":"var(--text2)", fontWeight:b.fineAmount>0?700:400 }}>₹{b.fineAmount?.toFixed(0)||0}{b.finePaid&&<span style={{ color:"var(--teal2)", fontSize:10, marginLeft:4 }}>✓ paid</span>}</td>
                <td><StatusBadge status={b.status} /></td>
              </tr>
            ))}
          </tbody></table></div>
        </div>
      )}
      {tab==="fines" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:6 }}>Fine Management</h3>
          <p style={{ fontSize:13, color:"var(--text2)", marginBottom:20 }}>₹{FINE_PER_DAY}/day overdue. Accounts with ≥ ₹{FINE_BLOCK_LIMIT} in unpaid fines are auto-blocked.</p>
          {fineMembers.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:12 }}>✅</div><p>No outstanding fines — all clear!</p></div>
          : <div className="table-wrap"><table><thead><tr><th>Member</th><th>Email</th><th>Total Fine</th><th>Account Status</th><th>Action</th></tr></thead><tbody>
            {fineMembers.map((m,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{m.name}</td><td style={{ color:"var(--text2)" }}>{m.email}</td>
                <td style={{ color:"#F87171", fontWeight:800, fontSize:16 }}>₹{m.total.toFixed(0)}</td>
                <td>{m.total>=FINE_BLOCK_LIMIT?<span className="badge badge-blocked">🔒 BLOCKED</span>:<span className="badge badge-pending">Active</span>}</td>
                <td><button className="btn-success" onClick={()=>payFine(m.memberId,m.name)}>💳 Mark Paid & Unblock</button></td>
              </tr>
            ))}
          </tbody></table></div>}
        </div>
      )}

      {/* Return Modal */}
      {returnModal && (
        <ReturnModal
          borrowing={returnModal}
          onClose={() => setReturnModal(null)}
          onConfirm={(data) => returnBook({ id:returnModal.id, ...data })}
        />
      )}

    </div>
  );
}

// ── SUBSCRIPTION PAGES ────────────────────────────────────────────────────────
function MemberSubscriptionPage({ user }) {
  const [plans, setPlans] = useState([]);
  const [mySub, setMySub] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text:"", type:"" });
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pR,sR,hR] = await Promise.allSettled([fetch(`${API}/subscriptions/plans`,{headers:authHeaders()}),fetch(`${API}/subscriptions/my/${user.id}`,{headers:authHeaders()}),fetch(`${API}/subscriptions/history/${user.id}`,{headers:authHeaders()})]);
      if (pR.status==="fulfilled"&&pR.value.ok) setPlans(await pR.value.json());
      if (sR.status==="fulfilled"&&sR.value.ok) setMySub(await sR.value.json());
      if (hR.status==="fulfilled"&&hR.value.ok) setHistory(await hR.value.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const subscribe = async (planId) => {
    try {
      const r = await fetch(`${API}/subscriptions/subscribe`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ memberId:user.id, planId }) });
      const txt = await r.text();
      if (r.ok) { setMsg({ text:`✅ ${txt}`, type:"success" }); fetchAll(); }
      else if (txt.startsWith("ALREADY_SUBSCRIBED")) { const planName=txt.split(":")[1]; setMsg({ text:`❌ You already have an active ${planName} subscription.`, type:"error" }); }
      else setMsg({ text:`❌ ${txt}`, type:"error" });
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 4000);
  };
  const isSubActive = mySub && mySub.status!=="NONE" && mySub.status!=="EXPIRED";
  const daysLeft = isSubActive ? Math.max(0,Math.ceil((new Date(mySub.expiresAt)-new Date())/(1000*60*60*24))) : 0;
  return (
    <div>
      <div className="page-header"><h1>Subscription</h1><p>Choose a plan to unlock borrowing.</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:20 }}>{msg.text}</div>}
      {isSubActive && (
        <div className="card card-glow" style={{ marginBottom:28, background:"linear-gradient(135deg,rgba(13,148,136,0.10),rgba(232,160,32,0.08))" }}>
          <div style={{ display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ fontSize:48 }}>🎫</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>{mySub.planName} — Active</div>
              <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
                <span style={{ fontSize:13, color:"var(--text2)" }}>📚 Max books: <strong style={{ color:"var(--amber)" }}>{mySub.maxBooks>=999?"Unlimited":mySub.maxBooks}</strong></span>
                <span style={{ fontSize:13, color:"var(--text2)" }}>📅 Expires: <strong style={{ color:"var(--teal2)" }}>{new Date(mySub.expiresAt).toLocaleDateString()}</strong></span>
                <span style={{ fontSize:13, color:"var(--text2)" }}>⏳ Days left: <strong style={{ color:daysLeft<=5?"#F87171":"var(--amber)" }}>{daysLeft}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
      {!isSubActive && <div className="msg-warn" style={{ marginBottom:24 }}>⚠️ You don't have an active subscription. Subscribe below to start borrowing books.</div>}
      {loading ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
      : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, marginBottom:32 }}>
        {plans.map((plan,i) => {
          const isPro = plan.planType==="PRO";
          const isCurrent = isSubActive && mySub.planType===plan.planType;
          return (
            <div key={i} className="card" style={{ position:"relative", border:isPro?"2px solid var(--amber)":"1.5px solid var(--border)", background:isPro?"linear-gradient(135deg,rgba(232,160,32,0.08),rgba(13,148,136,0.05))":"var(--surface2)" }}>
              {isPro && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,var(--amber),var(--amber2))", color:"#0D0E14", fontSize:11, fontWeight:800, padding:"3px 16px", borderRadius:20, whiteSpace:"nowrap" }}>⭐ MOST POPULAR</div>}
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, marginBottom:6 }}>{plan.planName}</div>
              <div style={{ fontSize:38, fontWeight:800, color:"var(--amber)", marginBottom:4 }}>₹{plan.price}<span style={{ fontSize:14, color:"var(--text2)", fontWeight:400 }}>/{plan.durationDays} days</span></div>
              <div style={{ fontSize:13, color:"var(--text2)", marginBottom:20, lineHeight:1.6 }}>{plan.description}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
                {[`Borrow up to ${plan.maxBooks>=999?"Unlimited":plan.maxBooks} books`,`Valid for ${plan.durationDays} days`,"Access to all departments"].map((f,j)=>(
                  <div key={j} style={{ display:"flex", alignItems:"center", gap:8, fontSize:14 }}><span style={{ color:"var(--teal2)", fontWeight:700 }}>✓</span><span>{f}</span></div>
                ))}
              </div>
              {isCurrent ? <div style={{ textAlign:"center", padding:"12px", background:"rgba(13,148,136,0.12)", border:"1.5px solid rgba(13,148,136,0.25)", borderRadius:10, color:"var(--teal2)", fontWeight:700 }}>✅ Current Plan</div>
              : <button className={isPro?"btn-primary":"btn-teal"} onClick={()=>subscribe(plan.id)} style={{ width:"100%", fontSize:15 }}>Subscribe for ₹{plan.price}</button>}
            </div>
          );
        })}
      </div>}
      {history.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Subscription History</h3>
          <div className="table-wrap"><table><thead><tr><th>Plan</th><th>Amount Paid</th><th>Start Date</th><th>Expiry</th><th>Status</th></tr></thead><tbody>
            {history.map((h,i)=>(
              <tr key={i}><td style={{ fontWeight:600 }}>{h.planName}</td><td style={{ color:"var(--amber)", fontWeight:700 }}>₹{h.amountPaid}</td><td style={{ color:"var(--text2)" }}>{h.subscribedAt?new Date(h.subscribedAt).toLocaleDateString():"—"}</td><td style={{ color:"var(--text2)" }}>{h.expiresAt?new Date(h.expiresAt).toLocaleDateString():"—"}</td><td><StatusBadge status={h.status} /></td></tr>
            ))}
          </tbody></table></div>
        </div>
      )}
    </div>
  );
}

function AdminSubscriptionManager() {
  const [plans, setPlans] = useState([]);
  const [allSubs, setAllSubs] = useState([]);
  const [editPlan, setEditPlan] = useState(null);
  const [msg, setMsg] = useState({ text:"", type:"" });
  const fetchAll = async () => {
    try {
      const [pR,sR] = await Promise.allSettled([fetch(`${API}/subscriptions/plans`,{headers:authHeaders()}),fetch(`${API}/subscriptions/all`,{headers:authHeaders()})]);
      if (pR.status==="fulfilled"&&pR.value.ok) setPlans(await pR.value.json());
      if (sR.status==="fulfilled"&&sR.value.ok) setAllSubs(await sR.value.json());
    } catch {}
  };
  useEffect(() => { fetchAll(); }, []);
  const savePlan = async () => {
    try {
      const r = await fetch(`${API}/subscriptions/plans/${editPlan.id}`, { method:"PUT", headers:authHeaders(), body:JSON.stringify(editPlan) });
      if (r.ok) { setMsg({ text:"✅ Plan updated!", type:"success" }); setEditPlan(null); fetchAll(); }
      else setMsg({ text:"❌ Failed to update plan", type:"error" });
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  };
  return (
    <div>
      <div className="page-header"><h1>Subscription Management</h1><p>Configure Standard and Pro plan pricing and limits.</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, marginBottom:32 }}>
        {plans.map((plan,i)=>(
          <div key={i} className="card card-glow">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700 }}>{plan.planName}</div>
              <span className={`tag ${plan.planType==="PRO"?"tag-admin":"tag-librarian"}`}>{plan.planType}</span>
            </div>
            {editPlan?.id===plan.id ? (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div className="form-group"><label>Plan Name</label><input value={editPlan.planName} onChange={e=>setEditPlan({...editPlan,planName:e.target.value})} /></div>
                <div className="form-group"><label>Price (₹)</label><input type="number" value={editPlan.price} onChange={e=>setEditPlan({...editPlan,price:parseFloat(e.target.value)})} /></div>
                <div className="form-group"><label>Duration (Days)</label><input type="number" value={editPlan.durationDays} onChange={e=>setEditPlan({...editPlan,durationDays:parseInt(e.target.value)})} /></div>
                <div className="form-group"><label>Max Books (999 = Unlimited)</label><input type="number" value={editPlan.maxBooks} onChange={e=>setEditPlan({...editPlan,maxBooks:parseInt(e.target.value)})} /></div>
                <div className="form-group"><label>Description</label><input value={editPlan.description} onChange={e=>setEditPlan({...editPlan,description:e.target.value})} /></div>
                <div style={{ display:"flex", gap:8, marginTop:4 }}><button className="btn-primary" onClick={savePlan}>💾 Save</button><button className="btn-ghost" onClick={()=>setEditPlan(null)}>Cancel</button></div>
              </div>
            ) : (
              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                  {[{l:"Price",v:`₹${plan.price}`},{l:"Duration",v:`${plan.durationDays} days`},{l:"Max Books",v:plan.maxBooks>=999?"Unlimited":plan.maxBooks}].map((row,j)=>(
                    <div key={j} style={{ background:"var(--surface)", borderRadius:8, padding:"10px 12px" }}><div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:3, fontWeight:700 }}>{row.l}</div><div style={{ fontSize:15, fontWeight:600, color:"var(--amber)" }}>{row.v}</div></div>
                  ))}
                </div>
                <p style={{ fontSize:12, color:"var(--text2)", marginBottom:14 }}>{plan.description}</p>
                <button className="btn-ghost" onClick={()=>setEditPlan({...plan})} style={{ width:"100%" }}>✏️ Edit Plan Settings</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>All Member Subscriptions</h3>
        {allSubs.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:12 }}>🎫</div><p>No member subscriptions yet</p></div>
        : <div className="table-wrap"><table><thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Start</th><th>Expiry</th><th>Status</th></tr></thead><tbody>
          {allSubs.map((s,i)=>(
            <tr key={i}><td style={{ fontWeight:600 }}>{s.memberName}</td><td><span className={`tag ${s.planType==="PRO"?"tag-admin":"tag-librarian"}`}>{s.planType}</span></td><td style={{ color:"var(--amber)", fontWeight:700 }}>₹{s.amountPaid}</td><td style={{ color:"var(--text2)" }}>{s.subscribedAt?new Date(s.subscribedAt).toLocaleDateString():"—"}</td><td style={{ color:"var(--text2)" }}>{s.expiresAt?new Date(s.expiresAt).toLocaleDateString():"—"}</td><td><StatusBadge status={s.status} /></td></tr>
          ))}
        </tbody></table></div>}
      </div>
    </div>
  );
}

// ── BORROW BOOKS ──────────────────────────────────────────────────────────────
function BorrowBooks({ user }) {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myBorrowings, setMyBorrowings] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ text:"", type:"" });
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("borrow");
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bR,rR,boR,sR] = await Promise.allSettled([fetch(`${API}/books`,{headers:authHeaders()}),fetch(`${API}/borrow/requests/my/${user.id}`,{headers:authHeaders()}),fetch(`${API}/borrow/borrowings/my/${user.id}`,{headers:authHeaders()}),fetch(`${API}/subscriptions/my/${user.id}`,{headers:authHeaders()})]);
      if (bR.status==="fulfilled"&&bR.value.ok) setBooks(await bR.value.json());
      if (rR.status==="fulfilled"&&rR.value.ok) setMyRequests(await rR.value.json());
      if (boR.status==="fulfilled"&&boR.value.ok) setMyBorrowings(await boR.value.json());
      if (sR.status==="fulfilled"&&sR.value.ok) setSubscription(await sR.value.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);
  const toggleSelect = (book) => {
    if (selected.find(b=>b.id===book.id)) { setSelected(selected.filter(b=>b.id!==book.id)); }
    else {
      if (selected.length >= MAX_BORROW_AT_ONCE) { setMsg({ text:`⚠️ Max ${MAX_BORROW_AT_ONCE} books per request`, type:"error" }); setTimeout(()=>setMsg({text:"",type:""}),3000); return; }
      setSelected([...selected, book]);
    }
  };
  const submitRequest = async () => {
    if (selected.length===0) { setMsg({ text:"Please select at least 1 book", type:"error" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/borrow/request`, { method:"POST", headers:authHeaders(), body:JSON.stringify({ memberId:user.id, bookIds:selected.map(b=>b.id) }) });
      const txt = await res.text();
      if (res.ok) { setMsg({ text:"✅ Borrow request submitted!", type:"success" }); setSelected([]); fetchAll(); }
      else if (txt==="NO_SUBSCRIPTION") setMsg({ text:"❌ You need an active subscription to borrow books.", type:"error" });
      else if (txt==="SUBSCRIPTION_EXPIRED") setMsg({ text:"❌ Your subscription has expired. Please renew it.", type:"error" });
      else if (txt.startsWith("LIMIT_EXCEEDED")) { const [,max,cur]=txt.split(":"); setMsg({ text:`❌ Limit exceeded! Plan allows ${max} books. You have ${cur}.`, type:"error" }); }
      else setMsg({ text:`❌ ${txt}`, type:"error" });
    } catch { setMsg({ text:"❌ Network error.", type:"error" }); } finally { setSubmitting(false); }
    setTimeout(() => setMsg({ text:"", type:"" }), 6000);
  };
  const availableBooks = books.filter(b=>(b.availableCopies??0)>0);
  const filteredBooks = availableBooks.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase()));
  const hasPendingRequest = myRequests.some(r=>r.status==="PENDING");
  const currentlyBorrowed = myBorrowings.filter(b=>b.status==="BORROWED"||b.status==="OVERDUE");
  const totalFine = myBorrowings.filter(b=>!b.finePaid&&b.fineAmount>0).reduce((s,b)=>s+b.fineAmount,0);
  const subActive = subscription && subscription.status!=="NONE" && subscription.status!=="EXPIRED";
  const maxBooks = subscription?.maxBooks ?? 0;
  return (
    <div>
      <div className="page-header"><h1>Borrow Books</h1><p>Select up to {MAX_BORROW_AT_ONCE} books and submit a request</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
        {[{icon:"🎫",label:"Subscription",value:subActive?subscription.planName:"None",color:subActive?"var(--teal2)":"#F87171"},{icon:"📚",label:"Max Books Allowed",value:subActive?(maxBooks>=999?"Unlimited":maxBooks):"—",color:"var(--amber)"},{icon:"📖",label:"Currently Borrowed",value:currentlyBorrowed.length,color:"#818CF8"},{icon:"💰",label:"Outstanding Fine",value:`₹${totalFine.toFixed(0)}`,color:totalFine>0?"#F87171":"var(--teal2)"}].map((s,i)=>(
          <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ fontSize:22, color:s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div className="filter-tabs">
        {[{id:"borrow",label:"📚 Borrow Books"},{id:"requests",label:"📋 My Requests"},{id:"history",label:"📖 My Borrowings"}].map(t=>(
          <button key={t.id} className={`filter-tab ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}
      {tab==="borrow" && (
        <>
          {!subActive && <div className="msg-warn" style={{ marginBottom:20 }}>⚠️ You need an active Subscription to borrow books.</div>}
          {hasPendingRequest && <div style={{ background:"rgba(79,70,229,0.10)", border:"1.5px solid rgba(79,70,229,0.30)", borderRadius:14, padding:"16px 20px", marginBottom:20 }}><span style={{ fontWeight:700, color:"#818CF8" }}>⏳ You already have a pending borrow request.</span></div>}
          {selected.length > 0 && (
            <div className="card card-glow" style={{ marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ fontWeight:700, marginBottom:8 }}>📦 Selected ({selected.length}/{MAX_BORROW_AT_ONCE})</div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {selected.map(b=>(
                      <div key={b.id} style={{ background:"var(--surface)", border:"1.5px solid var(--border2)", borderRadius:10, padding:"6px 14px", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
                        {b.title}<span style={{ cursor:"pointer", color:"var(--text3)", fontSize:16 }} onClick={()=>toggleSelect(b)}>×</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={submitRequest} disabled={submitting||hasPendingRequest||!subActive}>{submitting?"Submitting…":"📨 Submit Borrow Request"}</button>
              </div>
            </div>
          )}
          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, gap:12 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22 }}>Available Books ({availableBooks.length})</h3>
              <input placeholder="Search title or author…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }} />
            </div>
            {loading ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
            : filteredBooks.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:12 }}>📭</div><p>{search?"No results":"No available books right now"}</p></div>
            : <div className="table-wrap"><table><thead><tr><th>Select</th><th style={{ minWidth:220 }}>Book</th><th>Author</th><th>Department</th><th>Copies</th></tr></thead><tbody>
              {filteredBooks.map((b,i) => {
                const isSelected = !!selected.find(s=>s.id===b.id);
                const GRAD_START=["#667eea","#f093fb","#4facfe","#43e97b","#fa709a","#a18cd1","#fd7043","#2196f3"];
                const GRAD_END=["#764ba2","#f5576c","#00f2fe","#38f9d7","#fee140","#fbc2eb","#ff8a65","#21cbf3"];
                const gIdx=(b.title?.charCodeAt(0)||0)%8;
                const bookGrad=`linear-gradient(135deg, ${GRAD_START[gIdx]}, ${GRAD_END[gIdx]})`;
                const cleanCover=b.coverImageUrl?b.coverImageUrl.replace(/^uploads\/books\/covers\//,"").replace(/^covers\//,""):null;
                return (
                  <tr key={i} style={{ cursor:"pointer", background:isSelected?"rgba(232,160,32,0.06)":"" }} onClick={()=>toggleSelect(b)}>
                    <td><div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${isSelected?"var(--amber)":"var(--border)"}`, background:isSelected?"var(--amber)":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>{isSelected&&<span style={{ color:"#0D0E14", fontSize:13, fontWeight:900 }}>✓</span>}</div></td>
                    <td><div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ width:40, height:54, borderRadius:6, overflow:"hidden", flexShrink:0, background:bookGrad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, color:"rgba(255,255,255,0.8)", boxShadow:"0 2px 8px rgba(0,0,0,0.3)" }}>
                        {cleanCover?<img src={`${SERVER_URL}/images/covers/${cleanCover}`} alt={b.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>{e.target.style.display="none"}} />:<span>{b.title?.[0]?.toUpperCase()}</span>}
                      </div>
                      <div><div style={{ fontWeight:600, fontSize:13 }}>{b.title}</div>{b.genre&&<div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{b.genre}</div>}</div>
                    </div></td>
                    <td style={{ color:"var(--text2)" }}>{b.author}</td>
                    <td><span className="tag tag-librarian">{b.department||"—"}</span></td>
                    <td><span style={{ color:"var(--teal2)", fontWeight:700 }}>{b.availableCopies}</span></td>
                  </tr>
                );
              })}
            </tbody></table></div>}
          </div>
        </>
      )}
      {tab==="requests" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>My Borrow Requests</h3>
          {myRequests.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:12 }}>📋</div><p>No borrow requests yet</p></div>
          : <div className="table-wrap"><table><thead><tr><th>Books Requested</th><th>Count</th><th>Requested On</th><th>Due Date</th><th>Status</th></tr></thead><tbody>
            {myRequests.map((r,i)=>(
              <tr key={i}><td style={{ fontWeight:600, maxWidth:280 }}>{r.bookTitles}</td><td style={{ textAlign:"center", color:"var(--amber)", fontWeight:700 }}>{r.bookCount}</td><td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td><td style={{ color:"var(--teal2)" }}>{r.dueDate?new Date(r.dueDate).toLocaleDateString():"—"}</td><td><StatusBadge status={r.status} /></td></tr>
            ))}
          </tbody></table></div>}
        </div>
      )}
      {tab==="history" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>My Borrowings</h3>
          {totalFine > 0 && <div className="msg-error" style={{ marginBottom:18 }}>⚠️ Outstanding Fine: <strong>₹{totalFine.toFixed(0)}</strong>{totalFine>=FINE_BLOCK_LIMIT&&" — Account BLOCKED. Pay fine to restore access."}</div>}
          {myBorrowings.length===0 ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}><div style={{ fontSize:44, marginBottom:12 }}>📚</div><p>No borrowings yet</p></div>
          : <div className="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Borrowed On</th><th>Due Date</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead><tbody>
            {myBorrowings.map((b,i)=>(
              <tr key={i}><td style={{ fontWeight:600 }}>{b.bookTitle}</td><td style={{ color:"var(--text2)" }}>{b.bookAuthor}</td><td style={{ color:"var(--text2)" }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString():"—"}</td><td style={{ color:b.status==="OVERDUE"?"#F87171":"var(--teal2)", fontWeight:600 }}>{b.dueDate?new Date(b.dueDate).toLocaleDateString():"—"}</td><td style={{ color:"var(--text2)" }}>{b.returnedAt?new Date(b.returnedAt).toLocaleDateString():"—"}</td><td style={{ color:b.fineAmount>0?"#F87171":"var(--teal2)", fontWeight:700 }}>₹{b.fineAmount?.toFixed(0)||0}{b.finePaid&&<span style={{ color:"var(--teal2)", fontSize:10, marginLeft:4 }}>✓ paid</span>}</td><td><StatusBadge status={b.status} /></td></tr>
            ))}
          </tbody></table></div>}
        </div>
      )}
    </div>
  );
}

// ── RENEW BUTTON ──────────────────────────────────────────────────────────────
function RenewButton({ borrowingId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const handleRenew = async () => {
    setLoading(true); setErr("");
    try {
      const t = localStorage.getItem("token");
      const r = await fetch(`${API}/borrow/borrowings/${borrowingId}/renew`, { method:"PUT", headers:{ Authorization:`Bearer ${t}` } });
      const text = await r.text();
      if (r.ok) { setDone(true); onSuccess(); }
      else setErr(text.includes("ALREADY_RENEWED")?"Already renewed":text.includes("OVERDUE")?"Can't renew overdue":"Failed");
    } catch { setErr("Error"); } finally { setLoading(false); }
  };
  if (done) return <span style={{ fontSize:11, color:"var(--teal2)" }}>✓ Renewed!</span>;
  if (err)  return <span style={{ fontSize:11, color:"#F87171" }}>{err}</span>;
  return (
    <button onClick={handleRenew} disabled={loading} style={{ background:"rgba(13,148,136,0.12)", border:"1px solid rgba(13,148,136,0.35)", color:"var(--teal2)", borderRadius:8, padding:"5px 12px", fontSize:11, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?0.6:1 }}>
      {loading?"...":"🔄 Renew +7d"}
    </button>
  );
}

// ── MY BOOKS ──────────────────────────────────────────────────────────────────
function MyBooks({ user }) {
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("current");
  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const t = localStorage.getItem("token");
      const r = await fetch(`${API}/borrow/borrowings/my/${user.id}`, { headers: t?{Authorization:`Bearer ${t}`}:{} });
      if (r.ok) setBorrowings(await r.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchBorrowings(); }, []);
  const currentBooks = borrowings.filter(b=>b.status==="BORROWED"||b.status==="OVERDUE");
  const allHistory = [...borrowings].sort((a,b)=>new Date(b.borrowedAt)-new Date(a.borrowedAt));
  const totalFine = borrowings.filter(b=>!b.finePaid&&b.fineAmount>0).reduce((s,b)=>s+b.fineAmount,0);
  const hasOverdue = currentBooks.some(b=>b.status==="OVERDUE");
  const daysLeft = (dueDateStr) => {
    if (!dueDateStr) return { text:"—", color:"var(--text3)" };
    const diff = Math.ceil((new Date(dueDateStr)-new Date())/(1000*60*60*24));
    if (diff<0)  return { text:`${Math.abs(diff)}d overdue`, color:"#F87171" };
    if (diff===0) return { text:"Due today!", color:"#F87171" };
    if (diff<=2)  return { text:`${diff}d left`, color:"#FCD34D" };
    return { text:`${diff}d left`, color:"var(--teal2)" };
  };
  return (
    <div>
      <div className="page-header"><h1>My Books</h1><p>Track your currently borrowed books, due dates, and complete borrowing history</p></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:24 }}>
        {[{icon:"📖",label:"Currently Borrowed",value:currentBooks.length,color:"var(--amber)"},{icon:"⚠️",label:"Overdue",value:currentBooks.filter(b=>b.status==="OVERDUE").length,color:"#F87171"},{icon:"✅",label:"Total Returned",value:borrowings.filter(b=>b.status==="RETURNED").length,color:"var(--teal2)"},{icon:"💰",label:"Outstanding Fine",value:`₹${totalFine.toFixed(0)}`,color:totalFine>0?"#F87171":"var(--teal2)"}].map((s,i)=>(
          <div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ fontSize:26, color:s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      {hasOverdue && <div style={{ background:"rgba(225,29,72,0.10)", border:"1.5px solid rgba(225,29,72,0.35)", borderRadius:14, padding:"16px 22px", marginBottom:22, display:"flex", alignItems:"center", gap:14 }}><span style={{ fontSize:28 }}>🚨</span><div><div style={{ fontWeight:700, color:"#F87171", fontSize:15, marginBottom:3 }}>You have overdue books!</div><div style={{ fontSize:13, color:"var(--text2)" }}>Fine is ₹10 per day per book. Return them to avoid being blocked at ₹500.</div></div></div>}
      {totalFine>0 && !hasOverdue && <div className="msg-error" style={{ marginBottom:20 }}>💰 Outstanding fine of <strong>₹{totalFine.toFixed(0)}</strong>. Please pay at the library counter.</div>}
      <div className="filter-tabs">
        <button className={`filter-tab ${tab==="current"?"active":""}`} onClick={()=>setTab("current")}>📖 Currently Borrowed{currentBooks.length>0&&<span style={{ marginLeft:6, background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"1px 7px", fontSize:10 }}>{currentBooks.length}</span>}</button>
        <button className={`filter-tab ${tab==="history"?"active":""}`} onClick={()=>setTab("history")}>📋 Borrowing History<span style={{ marginLeft:6, background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"1px 7px", fontSize:10 }}>{allHistory.length}</span></button>
      </div>
      {tab==="current" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Books You Currently Have</h3>
          {loading ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
          : currentBooks.length===0 ? <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}><div style={{ fontSize:52, marginBottom:16 }}>📭</div><p style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>No books currently borrowed</p><p style={{ fontSize:13 }}>Go to "Borrow Books" to request books</p></div>
          : <div className="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Issue Date</th><th>Due Date</th><th>Days Left</th><th>Fine (₹)</th><th>Status</th><th>Renew</th></tr></thead><tbody>
            {currentBooks.map((b,i) => {
              const dl = daysLeft(b.dueDate);
              return (
                <tr key={i}>
                  <td><div style={{ fontWeight:700, fontSize:14 }}>{b.bookTitle}</div></td>
                  <td style={{ color:"var(--text2)" }}>{b.bookAuthor||"—"}</td>
                  <td style={{ color:"var(--text2)", fontSize:13 }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                  <td style={{ fontWeight:600, color:b.status==="OVERDUE"?"#F87171":"var(--teal2)" }}>{b.dueDate?new Date(b.dueDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                  <td><span style={{ background:dl.color==="#F87171"?"rgba(225,29,72,0.12)":dl.color==="#FCD34D"?"rgba(245,158,11,0.12)":"rgba(13,148,136,0.12)", color:dl.color, border:`1px solid ${dl.color}44`, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>{dl.text}</span></td>
                  <td style={{ fontWeight:700, color:b.fineAmount>0?"#F87171":"var(--teal2)" }}>₹{b.fineAmount?.toFixed(0)||0}</td>
                  <td>{b.status==="OVERDUE"?<span className="badge badge-rejected">⚠️ Overdue</span>:<span className="badge badge-approved">📖 Borrowed</span>}</td>
                  <td>{b.renewed?<span style={{ fontSize:11, color:"var(--text3)" }}>Renewed ✓</span>:b.status==="OVERDUE"?<span style={{ fontSize:11, color:"#F87171" }}>Can't renew</span>:<RenewButton borrowingId={b.id} onSuccess={fetchBorrowings} />}</td>
                </tr>
              );
            })}
          </tbody></table></div>}
        </div>
      )}
      {tab==="history" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:6 }}>Complete Borrowing History</h3>
          <p style={{ fontSize:13, color:"var(--text2)", marginBottom:20 }}>Full record of every book you have borrowed</p>
          {loading ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
          : allHistory.length===0 ? <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}><div style={{ fontSize:52, marginBottom:16 }}>📚</div><p style={{ fontSize:16, fontWeight:600 }}>No borrowing history yet</p></div>
          : <div className="table-wrap"><table><thead><tr><th>Book</th><th>Author</th><th>Issue Date</th><th>Due Date</th><th>Return Date</th><th>Penalty (₹)</th><th>Fine Status</th><th>Status</th></tr></thead><tbody>
            {allHistory.map((b,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:700 }}>{b.bookTitle}</td>
                <td style={{ color:"var(--text2)" }}>{b.bookAuthor||"—"}</td>
                <td style={{ color:"var(--text2)", fontSize:13 }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                <td style={{ color:b.fineAmount>0?"#F87171":"var(--text2)", fontSize:13 }}>{b.dueDate?new Date(b.dueDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                <td style={{ color:"var(--teal2)", fontSize:13, fontWeight:b.returnedAt?600:400 }}>{b.returnedAt?new Date(b.returnedAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):<span style={{ color:"var(--text3)" }}>Not returned</span>}</td>
                <td style={{ fontWeight:700, color:b.fineAmount>0?"#F87171":"var(--teal2)" }}>{b.fineAmount>0?`₹${b.fineAmount.toFixed(0)}`:"₹0"}</td>
                <td>{b.fineAmount>0?(b.finePaid?<span style={{ color:"var(--teal2)", fontSize:12, fontWeight:700 }}>✓ Paid</span>:<span style={{ color:"#F87171", fontSize:12, fontWeight:700 }}>Unpaid</span>):<span style={{ color:"var(--text3)", fontSize:12 }}>No fine</span>}</td>
                <td>{b.status==="RETURNED"&&<span className="badge badge-approved">✅ Returned</span>}{b.status==="BORROWED"&&<span className="badge badge-pending">📖 Borrowed</span>}{b.status==="OVERDUE"&&<span className="badge badge-rejected">⚠️ Overdue</span>}</td>
              </tr>
            ))}
          </tbody></table></div>}
        </div>
      )}
    </div>
  );
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
// ── FINE ANALYTICS PANEL ──────────────────────────────────────────────────────
function FineAnalyticsPanel() {
  const [borrowings, setBorrowings] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/borrow/borrowings/all`, { headers:authHeaders() });
      if (r.ok) setBorrowings(await r.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const unpaidFines  = borrowings.filter(b => b.fineAmount > 0 && !b.finePaid);
  const paidFines    = borrowings.filter(b => b.fineAmount > 0 &&  b.finePaid);
  const damagedBooks = borrowings.filter(b => b.damaged && (b.damageFine||0) > 0);

  const totalPending   = unpaidFines.reduce((s,b)  => s + b.fineAmount, 0);
  const totalCollected = paidFines.reduce((s,b)    => s + b.fineAmount, 0);
  const totalDamage    = damagedBooks.reduce((s,b)  => s + (b.damageFine||0), 0);

  // Group unpaid by member
  const memberFineMap = {};
  unpaidFines.forEach(b => {
    if (!memberFineMap[b.memberId]) {
      memberFineMap[b.memberId] = {
        name:"", email:"", overdueFine:0, damageFine:0, total:0, books:[],
      };
    }
    const m = memberFineMap[b.memberId];
    m.name  = b.memberName;
    m.email = b.memberEmail;
    m.damageFine  += (b.damageFine||0);
    m.overdueFine += (b.fineAmount - (b.damageFine||0));
    m.total       += b.fineAmount;
    m.books.push(b.bookTitle);
  });
  const memberFines = Object.values(memberFineMap).sort((a,b)=>b.total-a.total);

  return (
    <div>
      <div className="page-header">
        <h1>Fine Analytics</h1>
        <p>Complete breakdown of all fines — overdue and damage</p>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:16, marginBottom:28 }}>
        {[
          { icon:"💰", label:"Total Pending",      value:`₹${totalPending.toFixed(0)}`,   color:"#F87171"       },
          { icon:"✅", label:"Total Collected",     value:`₹${totalCollected.toFixed(0)}`, color:"var(--teal2)"  },
          { icon:"⚠️", label:"Damage Fines",        value:`₹${totalDamage.toFixed(0)}`,    color:"var(--amber)"  },
          { icon:"👤", label:"Members with Fines",  value: memberFines.length,             color:"#818CF8"       },
          { icon:"📚", label:"Damaged Books",       value: damagedBooks.length,            color:"var(--amber2)" },
          { icon:"🔒", label:"Blocked Accounts",    value: memberFines.filter(m=>m.total>=500).length, color:"#F87171" },
        ].map((s,i)=>(
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num" style={{ fontSize:28, color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Members with outstanding fines */}
      <div className="card" style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22 }}>
            Members with Outstanding Fines
          </h3>
          <button className="btn-ghost" onClick={fetchData} style={{ padding:"7px 14px", fontSize:12 }}>
            🔄 Refresh
          </button>
        </div>
        {loading
          ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28}/></div>
          : memberFines.length === 0
            ? <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
                <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
                <p>No outstanding fines!</p>
              </div>
            : <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Overdue Fine</th>
                      <th>Damage Fine</th>
                      <th>Total Due</th>
                      <th>Status</th>
                      <th>Books</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberFines.map((m,i)=>(
                      <tr key={i}>
                        <td>
                          <div style={{ fontWeight:700 }}>{m.name}</div>
                          <div style={{ fontSize:11, color:"var(--text3)" }}>{m.email}</div>
                        </td>
                        <td style={{ color:"var(--amber)", fontWeight:700 }}>₹{m.overdueFine.toFixed(0)}</td>
                        <td style={{ color:"#F87171", fontWeight:700 }}>{m.damageFine>0?`₹${m.damageFine.toFixed(0)}`:"—"}</td>
                        <td style={{ color:"#F87171", fontWeight:800, fontSize:16 }}>₹{m.total.toFixed(0)}</td>
                        <td>{m.total>=500?<span className="badge badge-blocked">🔒 BLOCKED</span>:<span className="badge badge-pending">Active</span>}</td>
                        <td style={{ fontSize:12, color:"var(--text2)" }}>{m.books.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
        }
      </div>

      {/* Damaged books */}
      {damagedBooks.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
            Damaged Book Records
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th><th>Book</th><th>Damage Fine</th>
                  <th>Reason</th><th>Returned On</th><th>Fine Paid</th>
                </tr>
              </thead>
              <tbody>
                {damagedBooks.map((b,i)=>(
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{b.memberName}</td>
                    <td style={{ fontWeight:600 }}>{b.bookTitle}</td>
                    <td style={{ color:"#F87171", fontWeight:700 }}>₹{b.damageFine}</td>
                    <td style={{ color:"var(--text2)", fontSize:12 }}>{b.damageReason||"—"}</td>
                    <td style={{ color:"var(--text2)" }}>{b.returnedAt?new Date(b.returnedAt).toLocaleDateString("en-IN"):"—"}</td>
                    <td>{b.finePaid?<span className="badge badge-approved">✅ Paid</span>:<span className="badge badge-rejected">Unpaid</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const bs = useBookStats();
  const fetchPending = async () => { setLoadingPending(true); try { const r=await fetch(`${API}/admin/pending-users`); if(r.ok) setPendingUsers(await r.json()); } catch {} finally { setLoadingPending(false); } };
  const fetchAllUsers = async () => { setLoadingAll(true); try { const r=await fetch(`${API}/admin/all-users`); if(r.ok) setAllUsers(await r.json()); } catch {} finally { setLoadingAll(false); } };
  useEffect(() => { if(activeTab==="home"){fetchPending();fetchAllUsers();} if(activeTab==="pending")fetchPending(); if(activeTab==="users")fetchAllUsers(); }, [activeTab]);
  const approveUser = async (email) => {
    try { const r=await fetch(`${API}/admin/approve?email=${encodeURIComponent(email)}`,{method:"POST"}); setActionMsg("✅ "+await r.text()); fetchPending(); fetchAllUsers(); }
    catch { setActionMsg("❌ Approval failed."); }
  };
  const navItems = [
    {id:"home",icon:"🏠",label:"Dashboard"},
    {id:"books",icon:"📖",label:"Book Management"},
    {id:"reservations",icon:"📌",label:"Reservations"},
    {id:"borrowings",icon:"📦",label:"Manage Borrows"},
    {id:"subscriptions",icon:"🎫",label:"Subscriptions"},
    {id:"pending",icon:"⏳",label:"Pending Approvals",badge:pendingUsers.length},
    {id:"fineanalytics", icon:"📊", label:"Fine Analytics"},
    {id:"users",icon:"👥",label:"All Users"},
    {id:"profile",icon:"👤",label:"My Profile"},
  ];
  const STATS = [
    {icon:"📚",num:bs.total,label:"Total Books",c:"var(--amber)"},{icon:"✅",num:bs.available,label:"Available",c:"var(--teal2)"},{icon:"❌",num:bs.unavailable,label:"Unavailable",c:"#F87171"},
    {icon:"📊", label:"Fine Analytics", c:"rgba(225,29,72,0.15)", t:"fineanalytics"},
    {icon:"👥",num:allUsers.length,label:"Total Users",c:"#818CF8"},{icon:"⏳",num:pendingUsers.length,label:"Pending",c:"var(--amber2)"},{icon:"📖",num:allUsers.filter(u=>u.role==="LIBRARIAN").length,label:"Librarians",c:"var(--teal2)"},
  ];
  return (
    <div className="app-layout">
      <Sidebar subtitle="Admin Panel" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Admin" onLogout={onLogout} />
      <main className="main-content">
        <TopBar user={user} roleLabel="Admin" />
        {activeTab==="books" && <BookManagement userRole="ADMIN" />}
        {activeTab!=="books" && (
          <div className="main-padded">
            {activeTab==="home" && (
              <div className="fade-up">
                <div className="page-header"><h1>Welcome back, {user.name?.split(" ")[0]}! 👋</h1><p>Here's your complete library system overview</p></div>
                <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
                <div className="card">
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Quick Actions</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
                    {[{icon:"📖",label:"Manage Books",c:"rgba(232,160,32,0.15)",t:"books"},{icon:"📌",label:"Reservations",c:"rgba(13,148,136,0.15)",t:"reservations"},{icon:"📦",label:"Manage Borrows",c:"rgba(79,70,229,0.15)",t:"borrowings"},{icon:"📊", label:"Fine Analytics", c:"rgba(225,29,72,0.15)", t:"fineanalytics"},{icon:"🎫",label:"Subscriptions",c:"rgba(232,160,32,0.15)",t:"subscriptions"},{icon:"⏳",label:"Pending Approvals",c:"rgba(245,158,11,0.15)",t:"pending"},{icon:"👥",label:"All Users",c:"rgba(79,70,229,0.15)",t:"users"}].map((a,i)=>(
                      <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}><div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div><div style={{ fontWeight:600, fontSize:14 }}>{a.label}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab==="reservations"  && <ManageReservations />}
            {activeTab==="borrowings"    && <ManageBorrowings userRole="ADMIN" />}
            {activeTab==="subscriptions" && <AdminSubscriptionManager />}
            {activeTab==="pending" && (
              <div className="fade-up">
                <div className="page-header"><h1>Pending Approvals</h1><p>Review and approve new Librarian account registrations</p></div>
                {actionMsg && <div className="msg-success" style={{ marginBottom:16 }}>{actionMsg}</div>}
                <div className="card">
                  {loadingPending ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
                  : pendingUsers.length===0 ? <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}><div style={{ fontSize:48, marginBottom:14 }}>✅</div><p>No pending approvals — all clear!</p></div>
                  : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead><tbody>
                    {pendingUsers.map((u,i)=>(<tr key={i}><td style={{ fontWeight:600 }}>{u.name}</td><td style={{ color:"var(--text2)" }}>{u.email}</td><td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td><td><button className="btn-success" onClick={()=>approveUser(u.email)}>✅ Approve</button></td></tr>))}
                  </tbody></table></div>}
                </div>
              </div>
            )}
            {activeTab==="users" && (
              <div className="fade-up">
                <div className="page-header"><h1>All Users</h1><p>Every registered account in the system</p></div>
                <div className="card">
                  {loadingAll ? <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
                  : <div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Approved</th></tr></thead><tbody>
                    {allUsers.map((u,i)=>(<tr key={i}><td style={{ fontWeight:600 }}>{u.name}</td><td style={{ color:"var(--text2)" }}>{u.email}</td><td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td><td><span className={`tag ${u.verified?"tag-verified":"tag-pending"}`}>{u.verified?"Yes":"No"}</span></td><td><span className={`tag ${u.approved?"tag-verified":"tag-pending"}`}>{u.approved?"Yes":"No"}</span></td></tr>))}
                  </tbody></table></div>}
                </div>
              </div>
            )}
            {activeTab==="fineanalytics" && <FineAnalyticsPanel />}
            {activeTab==="profile" && <ProfilePanel user={user} />}
          </div>
        )}
      </main>
      <LibraryChatbot user={user} />
    </div>
  );
}

// ── LIBRARIAN DASHBOARD ───────────────────────────────────────────────────────
function LibrarianDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const bs = useBookStats();
  const navItems = [
    {id:"home",icon:"🏠",label:"Dashboard"},
    {id:"books",icon:"📖",label:"Manage Books"},
    {id:"reservations",icon:"📌",label:"Reservations"},
    {id:"borrowings",icon:"📦",label:"Manage Borrows"},
    {id:"fineanalytics", icon:"📊", label:"Fine Analytics"},
    {id:"profile",icon:"👤",label:"My Profile"},
  ];
  const STATS = [{icon:"📚",num:bs.total,label:"Total Books",c:"var(--amber)"},{icon:"✅",num:bs.available,label:"Available",c:"var(--teal2)"},{icon:"❌",num:bs.unavailable,label:"Unavailable",c:"#F87171"}];
  return (
    <div className="app-layout">
      <Sidebar subtitle="Librarian Panel" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Librarian" onLogout={onLogout} />
      <main className="main-content">
        <TopBar user={user} roleLabel="Librarian" />
        {activeTab==="books" && <BookManagement userRole="LIBRARIAN" />}
        {activeTab!=="books" && (
          <div className="main-padded">
            {activeTab==="home" && (
              <div className="fade-up">
                <div className="page-header"><h1>Librarian Dashboard</h1><p>Manage the book collection and handle all member requests</p></div>
                <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
                <div className="card">
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Quick Actions</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
                    {[{icon:"📖",label:"Manage Books",c:"rgba(232,160,32,0.15)",t:"books"},{icon:"📌",label:"Reservations",c:"rgba(13,148,136,0.15)",t:"reservations"},{icon:"📦",label:"Manage Borrows",c:"rgba(79,70,229,0.15)",t:"borrowings"}].map((a,i)=>(
                      <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}><div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div><div style={{ fontWeight:600, fontSize:14 }}>{a.label}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab==="reservations" && <ManageReservations />}
            {activeTab==="borrowings"   && <ManageBorrowings userRole="LIBRARIAN" />}
            {activeTab==="profile"      && <ProfilePanel user={user} />}
          </div>
        )}
      </main>
      <LibraryChatbot user={user} />
    </div>
  );
}

// ── MEMBER DASHBOARD ──────────────────────────────────────────────────────────
function MemberDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const bs = useBookStats();
  const navItems = [
    {id:"home",icon:"🏠",label:"Dashboard"},
    {id:"mybooks",icon:"📖",label:"My Books"},
    {id:"browse",icon:"🔍",label:"Browse Books"},
    {id:"borrow",icon:"📦",label:"Borrow Books"},
    {id:"reservations",icon:"📌",label:"Reserve Books"},
    {id:"subscription",icon:"🎫",label:"Subscription"},
    {id:"profile",icon:"👤",label:"My Profile"},
  ];
  const STATS = [{icon:"📚",num:bs.total,label:"Total Books",c:"var(--amber)"},{icon:"✅",num:bs.available,label:"Available Now",c:"var(--teal2)"},{icon:"❌",num:bs.unavailable,label:"Unavailable",c:"#F87171"}];
  return (
    <div className="app-layout">
      <Sidebar subtitle="Member Portal" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Member" onLogout={onLogout} />
      <main className="main-content">
        <TopBar user={user} roleLabel="Member" />
        {activeTab==="browse" && <BookManagement userRole="MEMBER" />}
        {activeTab!=="browse" && (
          <div className="main-padded">
            {activeTab==="home" && (
              <div className="fade-up">
                <div style={{ background:"linear-gradient(135deg,rgba(232,160,32,0.12) 0%,rgba(13,148,136,0.10) 50%,rgba(79,70,229,0.08) 100%)", border:"1.5px solid var(--border2)", borderRadius:20, padding:"28px 32px", marginBottom:28, display:"flex", alignItems:"center", gap:20 }}>
                  <div className="avatar" style={{ width:66, height:66, fontSize:26, borderRadius:18 }}>{user.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, marginBottom:4 }}>Hello, {user.name?.split(" ")[0]}! 📚</h2>
                    <p style={{ fontSize:13, color:"var(--text2)" }}>{user.email}</p>
                    <div style={{ marginTop:10, display:"flex", gap:8 }}><span className="tag tag-member">Member</span><span className="tag tag-verified">✓ Verified</span></div>
                  </div>
                </div>
                <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
                <div className="card">
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>Quick Actions</h3>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
                    {[{icon:"📖",label:"My Books",c:"rgba(124,58,237,0.15)",t:"mybooks"},{icon:"🔍",label:"Browse Books",c:"rgba(232,160,32,0.15)",t:"browse"},{icon:"📦",label:"Borrow Books",c:"rgba(13,148,136,0.15)",t:"borrow"},{icon:"📌",label:"Reserve a Book",c:"rgba(79,70,229,0.15)",t:"reservations"},{icon:"🎫",label:"Subscription",c:"rgba(232,160,32,0.15)",t:"subscription"}].map((a,i)=>(
                      <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}><div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div><div style={{ fontWeight:600, fontSize:14 }}>{a.label}</div></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab==="mybooks"      && <MyBooks user={user} />}
            {activeTab==="borrow"       && <BorrowBooks user={user} />}
            {activeTab==="reservations" && <MemberReservations user={user} />}
            {activeTab==="subscription" && <MemberSubscriptionPage user={user} />}
            {activeTab==="profile"      && <ProfilePanel user={user} />}
          </div>
        )}
      </main>
      <LibraryChatbot user={user} />
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
function AppInner() {
  const { dark } = useTheme();
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(() => { try { return JSON.parse(sessionStorage.getItem("libraryUser")); } catch { return null; } });
  const onLogin = (u) => { setUser(u); sessionStorage.setItem("libraryUser", JSON.stringify(u)); };
  const onLogout = () => { setUser(null); localStorage.removeItem("token"); sessionStorage.removeItem("libraryUser"); setPage("landing"); };
  return (
    <>
      <GlobalStyle dark={dark} />
      {user ? (
        user.role==="ADMIN"     ? <AdminDashboard     user={user} onLogout={onLogout} /> :
        user.role==="LIBRARIAN" ? <LibrarianDashboard user={user} onLogout={onLogout} /> :
                                   <MemberDashboard    user={user} onLogout={onLogout} />
      ) : (
        <>
          {page==="landing"  && <LandingPage  navigate={setPage} />}
          {page==="register" && <RegisterPage navigate={setPage} />}
          {page==="otp"      && <OtpPage      navigate={setPage} />}
          {page==="login"    && <LoginPage    navigate={setPage} onLogin={onLogin} />}
        </>
      )}
    </>
  );
}

function App() {
  return <ThemeProvider><AppInner /></ThemeProvider>;
}

export default App;
