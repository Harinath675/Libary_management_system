// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                        LibraryApp.jsx — COMPLETE FILE                       ║
// ║                                                                              ║
// ║  HOW THIS FILE IS ORGANISED (read top to bottom):                           ║
// ║                                                                              ║
// ║  SECTION 1 — Imports, Constants, Theme                                      ║
// ║  SECTION 2 — Global CSS (all styles in one <style> tag)                     ║
// ║  SECTION 3 — Tiny shared UI pieces (Spinner, ThemeToggle, Sidebar)          ║
// ║  SECTION 4 — Auth Pages  (Landing → Register → OTP → Login)                ║
// ║  SECTION 5 — Shared Pages (Profile, ManageReservations, ManageBorrowings,   ║
// ║                             SubscriptionPages, BorrowBooks, MemberReserve)  ║
// ║  SECTION 6 — Role Dashboards (Admin, Librarian, Member)                     ║
// ║  SECTION 7 — Root App component (routes everything)                         ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1 — IMPORTS, CONSTANTS, THEME CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

// React core hooks
import { useState, useEffect, createContext, useContext } from "react";

// Our existing BookManagement component (handles book CRUD, cover images, PDFs)
import BookManagement from "./components/BookManagement";

// ── API BASE URL ──────────────────────────────────────────────────────────────
// Change this ONE line if your backend moves to a different port or server.
const API = "http://localhost:8080/api";

// ── FINE SETTINGS ─────────────────────────────────────────────────────────────
// ₹10 charged per day a book is returned late
const FINE_PER_DAY = 10;

// When total unpaid fines hit ₹500, the member account is blocked automatically
const FINE_BLOCK_LIMIT = 500;

// A member can select at most 3 books per single borrow request
const MAX_BORROW_AT_ONCE = 3;

// ── THEME CONTEXT ─────────────────────────────────────────────────────────────
// React Context lets ANY component read the current theme (dark/light)
// without having to pass `dark` as a prop through every parent → child chain.
//
// How it works:
//   1. createContext() makes the "pipe"
//   2. <ThemeContext.Provider value={...}> in App() fills the pipe
//   3. useTheme() in any component reads from the pipe
const ThemeContext = createContext({ dark: true, toggle: () => {} });

// Custom hook — cleaner than writing useContext(ThemeContext) everywhere
function useTheme() {
  return useContext(ThemeContext);
}

// ── JWT HELPER ────────────────────────────────────────────────────────────────
// Returns the Authorization header object if a token exists, otherwise {}.
// Used by every protected API call so we don't repeat this logic everywhere.
//   Usage: fetch(url, { headers: authHeaders() })
function authHeaders() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2 — GLOBAL CSS
//
// Why one big <style> tag instead of a .css file?
//   → The `dark` prop lets us inject DIFFERENT CSS variables at runtime.
//     If dark=true, we write dark-mode variables. If false, light-mode.
//     This can't be done cleanly with a static .css file.
//
// STRUCTURE OF THE CSS (in order):
//   A. Google Fonts import
//   B. CSS Variables  (:root block — switches between dark/light)
//   C. Base element resets (html, body, input, button)
//   D. Button variants (.btn-primary, .btn-teal, .btn-ghost, .btn-danger, .btn-success)
//   E. Cards (.card, .card-glow)
//   F. Alert messages (.msg-error, .msg-success, .msg-warn)
//   G. Page layout (.page-center, .app-layout)
//   H. Sidebar (.sidebar, .nav-item, .user-chip, .avatar)
//   I. Main content (.main-content, .main-padded, .page-header)
//   J. Stats cards (.stats-grid, .stat-card)
//   K. Tables (.table-wrap, table, thead, tbody)
//   L. OTP inputs (.otp-inputs, .otp-box)
//   M. Tags & Badges (.tag-*, .badge-*)
//   N. Filter tabs (.filter-tabs, .filter-tab)
//   O. Action cards (.action-card)
//   P. Landing page (.landing, .orb, .hero, .features)
//   Q. Auth cards (.auth-card, .auth-icon)
//   R. Animations (@keyframes)
// ─────────────────────────────────────────────────────────────────────────────

const GlobalStyle = ({ dark }) => (
  <style>{`
    /* ── A. Google Fonts ───────────────────────────────────────────────────── */
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
    /* Cormorant Garamond = elegant serif used for headings and big numbers     */
    /* Outfit = clean modern sans-serif used for all body text                  */

    /* ── CSS Reset ─────────────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── B. CSS Variables ──────────────────────────────────────────────────── */
    /* All colour/shadow values are stored here as variables.                   */
    /* Components reference var(--text), var(--amber), etc.                    */
    /* When dark changes, these values change → whole UI re-themes instantly.  */
    :root {
      /* Brand colours — same in both themes */
      --amber:  #E8A020;   /* primary gold brand colour                        */
      --amber2: #F5C842;   /* lighter gold for gradients                       */
      --teal:   #0D9488;   /* secondary teal                                   */
      --teal2:  #14B8A6;   /* lighter teal                                     */
      --indigo: #4F46E5;   /* avatar background start                          */
      --violet: #7C3AED;   /* avatar background end                            */
      --rose:   #E11D48;   /* red badge / danger                               */

      /* ── DARK THEME ── injected when dark=true */
      ${dark ? `
      --bg:       #080B14;                  /* page background — near black    */
      --bg2:      #0E1220;                  /* slightly lighter for hover bg   */
      --bg3:      #141928;                  /* nested card backgrounds         */
      --surface:  rgba(255,255,255,0.04);   /* very faint white layer          */
      --surface2: rgba(255,255,255,0.07);   /* card surfaces                   */
      --border:   rgba(255,255,255,0.09);   /* subtle borders                  */
      --border2:  rgba(232,160,32,0.28);    /* amber-tinted borders            */
      --text:     #F0EDE8;                  /* main text — warm white          */
      --text2:    #A0A8B8;                  /* secondary text — muted          */
      --text3:    #606880;                  /* placeholder / label text        */
      --glow:     rgba(232,160,32,0.16);    /* amber glow for focus/hover      */
      --glow2:    rgba(13,148,136,0.12);    /* teal glow                       */
      --sidebar:  #0C0F1C;                  /* sidebar panel background        */
      ` : `
      /* ── LIGHT THEME ── injected when dark=false */
      --bg:       #F0F2F8;
      --bg2:      #E6E9F2;
      --bg3:      #DDE2EE;
      --surface:  rgba(255,255,255,0.75);
      --surface2: rgba(255,255,255,0.95);
      --border:   rgba(79,70,229,0.12);
      --border2:  rgba(232,160,32,0.32);
      --text:     #12152A;
      --text2:    #4A5075;
      --text3:    #8892A8;
      --glow:     rgba(232,160,32,0.10);
      --glow2:    rgba(13,148,136,0.08);
      --sidebar:  #FFFFFF;
      `}
    }

    /* ── C. Base Elements ──────────────────────────────────────────────────── */
    html, body, #root {
      height: 100%;
      font-family: 'Outfit', sans-serif;
      background: var(--bg);
      color: var(--text);
      transition: background 0.3s, color 0.3s; /* smooth theme switch */
    }
    .serif { font-family: 'Cormorant Garamond', serif; }

    /* All form inputs share the same base style */
    input, select, textarea {
      font-family: 'Outfit', sans-serif;
      background: var(--surface2);
      border: 1.5px solid var(--border);
      color: var(--text);
      padding: 13px 16px;
      border-radius: 10px;
      width: 100%;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    /* When focused: amber border + soft amber glow ring */
    input:focus, select:focus {
      border-color: var(--amber);
      box-shadow: 0 0 0 4px var(--glow);
    }
    input::placeholder { color: var(--text3); }
    select option { background: var(--bg2); color: var(--text); }

    /* ── D. Button Variants ────────────────────────────────────────────────── */
    button {
      font-family: 'Outfit', sans-serif;
      cursor: pointer;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.22s;
    }
    button:disabled { opacity: 0.45; cursor: not-allowed; }

    /* Gold gradient — primary CTA button */
    .btn-primary {
      background: linear-gradient(135deg, var(--amber), var(--amber2));
      color: #0D0E14;
      padding: 13px 28px;
      box-shadow: 0 4px 18px rgba(232,160,32,0.35);
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(232,160,32,0.50);
    }

    /* Teal gradient — secondary action button */
    .btn-teal {
      background: linear-gradient(135deg, var(--teal), var(--teal2));
      color: #fff;
      padding: 13px 28px;
      box-shadow: 0 4px 18px rgba(13,148,136,0.35);
    }
    .btn-teal:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(13,148,136,0.50);
    }

    /* Ghost — transparent with border, for secondary/cancel actions */
    .btn-ghost {
      background: var(--surface);
      border: 1.5px solid var(--border);
      color: var(--text2);
      padding: 12px 24px;
    }
    .btn-ghost:hover:not(:disabled) {
      border-color: var(--amber);
      color: var(--amber);
      background: var(--glow);
    }

    /* Danger — soft red, used for Reject / Delete */
    .btn-danger {
      background: rgba(225,29,72,0.10);
      border: 1.5px solid rgba(225,29,72,0.30);
      color: #F87171;
      padding: 8px 16px;
    }
    .btn-danger:hover { background: rgba(225,29,72,0.18); }

    /* Success — soft green, used for Approve / Confirm */
    .btn-success {
      background: rgba(5,150,105,0.10);
      border: 1.5px solid rgba(5,150,105,0.30);
      color: #34D399;
      padding: 8px 16px;
    }
    .btn-success:hover { background: rgba(5,150,105,0.18); }

    /* ── E. Cards ──────────────────────────────────────────────────────────── */
    .card {
      background: var(--surface2);
      border: 1.5px solid var(--border);
      border-radius: 18px;
      padding: 28px;
      ${dark
        ? "box-shadow: 0 4px 24px rgba(0,0,0,0.30);"
        : "box-shadow: 0 2px 16px rgba(79,70,229,0.07);"}
    }
    /* card-glow = highlighted card with amber border glow */
    .card-glow {
      border-color: var(--border2);
      ${dark
        ? "box-shadow: 0 0 40px var(--glow), 0 4px 24px rgba(0,0,0,0.3);"
        : "box-shadow: 0 0 30px var(--glow), 0 2px 16px rgba(79,70,229,0.07);"}
    }

    /* ── F. Alert Messages ─────────────────────────────────────────────────── */
    .msg-error   { background:rgba(225,29,72,0.10);  border:1.5px solid rgba(225,29,72,0.28);  color:#FB7185; padding:12px 16px; border-radius:10px; font-size:13px; }
    .msg-success { background:rgba(5,150,105,0.10);  border:1.5px solid rgba(5,150,105,0.28);  color:#34D399; padding:12px 16px; border-radius:10px; font-size:13px; }
    .msg-warn    { background:rgba(245,158,11,0.10); border:1.5px solid rgba(245,158,11,0.28); color:#FCD34D; padding:12px 16px; border-radius:10px; font-size:13px; }

    /* ── G. Page Layout ────────────────────────────────────────────────────── */
    /* .page-center: centers auth cards (Login, Register, OTP) on screen */
    .page-center {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background:
        radial-gradient(ellipse 60% 50% at 10% 20%, rgba(232,160,32,0.09) 0%, transparent 70%),
        radial-gradient(ellipse 50% 40% at 90% 80%, rgba(13,148,136,0.09) 0%, transparent 70%),
        radial-gradient(ellipse 40% 60% at 50% 50%, rgba(79,70,229,0.05) 0%, transparent 70%),
        var(--bg);
    }
    .form-group { display:flex; flex-direction:column; gap:8px; }
    .form-group label {
      font-size:11px; font-weight:700; color:var(--text2);
      text-transform:uppercase; letter-spacing:1px;
    }

    /* .app-layout: the main dashboard layout — sidebar on left, content on right */
    .app-layout { display: flex; min-height: 100vh; }

    /* ── H. Sidebar ────────────────────────────────────────────────────────── */
    .sidebar {
      width: 268px;
      background: var(--sidebar);
      ${dark
        ? "border-right:1.5px solid rgba(255,255,255,0.07); box-shadow:4px 0 32px rgba(0,0,0,0.35);"
        : "border-right:1.5px solid rgba(79,70,229,0.10); box-shadow:4px 0 24px rgba(79,70,229,0.07);"}
      display: flex;
      flex-direction: column;
      position: sticky;   /* sidebar stays visible while main content scrolls */
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar-logo { padding:28px 22px 20px; border-bottom:1.5px solid var(--border); }
    .logo-mark    { display:flex; align-items:center; gap:12px; }
    .logo-icon    { width:42px; height:42px; border-radius:13px; background:linear-gradient(135deg,var(--amber),var(--teal2)); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 16px rgba(232,160,32,0.4); flex-shrink:0; }
    .logo-text    { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:var(--text); }
    .logo-sub     { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:1.2px; margin-top:1px; }

    /* Navigation item list */
    .sidebar-nav  { flex:1; padding:16px 12px; display:flex; flex-direction:column; gap:3px; }
    .nav-item {
      display:flex; align-items:center; gap:12px;
      padding:11px 14px; border-radius:12px;
      font-size:14px; font-weight:500; color:var(--text2);
      cursor:pointer; transition:all 0.18s;
      border:1.5px solid transparent;
      position:relative; overflow:hidden;
    }
    /* Left accent bar that slides in when this nav item is active */
    .nav-item::before {
      content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
      background:linear-gradient(180deg,var(--amber),var(--teal2));
      border-radius:0 4px 4px 0;
      transform:scaleY(0); transition:transform 0.18s;
    }
    .nav-item:hover  { background:var(--surface2); color:var(--text); border-color:var(--border); }
    .nav-item.active { background:linear-gradient(135deg,rgba(232,160,32,0.12),rgba(13,148,136,0.08)); border-color:rgba(232,160,32,0.25); color:var(--amber); }
    .nav-item.active::before { transform:scaleY(1); } /* show the accent bar */
    .nav-icon  { font-size:17px; width:22px; text-align:center; flex-shrink:0; }
    .nav-badge { margin-left:auto; background:var(--rose); color:#fff; font-size:10px; font-weight:700; border-radius:10px; padding:2px 7px; }

    /* Sidebar footer: user chip + theme toggle + sign out */
    .sidebar-footer { padding:14px 12px; border-top:1.5px solid var(--border); }
    .user-chip      { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:14px; background:var(--surface); border:1.5px solid var(--border); margin-bottom:10px; }
    .avatar         { width:38px; height:38px; border-radius:12px; flex-shrink:0; background:linear-gradient(135deg,var(--indigo),var(--violet)); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px; color:#fff; box-shadow:0 2px 10px rgba(124,58,237,0.4); }
    .user-chip-name { font-size:13px; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .user-chip-role { font-size:10px; color:var(--text3); text-transform:uppercase; letter-spacing:0.7px; margin-top:1px; }
    .theme-btn      { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:9px 14px; border-radius:10px; background:var(--surface); border:1.5px solid var(--border); color:var(--text2); font-size:12px; font-weight:700; margin-bottom:8px; cursor:pointer; text-transform:uppercase; letter-spacing:0.5px; }
    .theme-btn:hover { border-color:var(--amber); color:var(--amber); background:var(--glow); }

    /* ── I. Main Content Area ──────────────────────────────────────────────── */
    .main-content {
      flex:1; overflow-y:auto; background:var(--bg);
      /* Subtle radial gradients give the content area visual depth */
      background-image:
        radial-gradient(ellipse 50% 40% at 80% 10%, rgba(13,148,136,0.06) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 20% 80%, rgba(232,160,32,0.06) 0%, transparent 60%);
    }
    .main-padded { padding: 36px 44px; }  /* inner padding for all page content */
    .page-header { margin-bottom:32px; }
    .page-header h1 { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:700; color:var(--text); line-height:1.1; }
    .page-header p  { color:var(--text2); margin-top:7px; font-size:14px; }

    /* ── J. Stats Cards ────────────────────────────────────────────────────── */
    .stats-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:16px; margin-bottom:28px; }
    .stat-card  {
      background:var(--surface2); border:1.5px solid var(--border); border-radius:16px; padding:22px 20px;
      ${dark ? "box-shadow:0 2px 16px rgba(0,0,0,0.25);" : "box-shadow:0 2px 12px rgba(79,70,229,0.06);"}
      transition:transform 0.2s,box-shadow 0.2s; position:relative; overflow:hidden;
    }
    /* The 3-pixel coloured bar across the top of each stat card */
    .stat-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--amber),var(--teal2)); }
    .stat-card:hover  { transform:translateY(-3px); ${dark ? "box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 20px var(--glow);" : "box-shadow:0 8px 24px rgba(79,70,229,0.12);"} }
    .stat-icon  { font-size:26px; margin-bottom:12px; }
    .stat-num   { font-family:'Cormorant Garamond',serif; font-size:40px; font-weight:700; line-height:1; }
    .stat-label { font-size:11px; font-weight:600; color:var(--text2); margin-top:5px; text-transform:uppercase; letter-spacing:0.8px; }

    /* ── K. Tables ─────────────────────────────────────────────────────────── */
    .table-wrap { overflow-x:auto; border-radius:12px; }
    table { width:100%; border-collapse:collapse; }
    thead th {
      text-align:left; font-size:10px; font-weight:700; letter-spacing:1px;
      text-transform:uppercase; color:var(--text3); padding:13px 18px;
      border-bottom:1.5px solid var(--border);
    }
    tbody tr { border-bottom:1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(79,70,229,0.05)"}; transition:background 0.15s; }
    tbody tr:hover { background:var(--surface); }
    tbody td { padding:14px 18px; font-size:13px; color:var(--text); }

    /* ── L. OTP Boxes ──────────────────────────────────────────────────────── */
    /* 6 individual digit-input boxes for email OTP verification */
    .otp-inputs { display:flex; gap:10px; justify-content:center; margin:24px 0; }
    .otp-box    { width:54px; height:62px; text-align:center; font-size:26px; font-weight:700; border-radius:12px; background:var(--surface2); border:2px solid var(--border); color:var(--text); caret-color:var(--amber); transition:border-color 0.2s,box-shadow 0.2s; }
    .otp-box:focus { border-color:var(--amber); box-shadow:0 0 0 4px var(--glow); }

    /* Horizontal gradient line used as a visual divider */
    .divider { height:1px; margin:24px 0; background:linear-gradient(90deg,transparent,var(--border2),transparent); }

    /* ── M. Tags & Badges ──────────────────────────────────────────────────── */
    /* Tags: small coloured labels (ADMIN, LIBRARIAN, MEMBER, etc.) */
    .tag           { display:inline-block; padding:3px 11px; border-radius:20px; font-size:10px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; }
    .tag-admin     { background:rgba(232,160,32,0.15); color:var(--amber); border:1px solid rgba(232,160,32,0.30); }
    .tag-librarian { background:rgba(13,148,136,0.15); color:var(--teal2); border:1px solid rgba(13,148,136,0.30); }
    .tag-member    { background:rgba(79,70,229,0.12);  color:#818CF8;      border:1px solid rgba(79,70,229,0.25); }
    .tag-verified  { background:rgba(5,150,105,0.12);  color:#34D399;      border:1px solid rgba(5,150,105,0.25); }
    .tag-pending   { background:rgba(245,158,11,0.12); color:#FCD34D;      border:1px solid rgba(245,158,11,0.25); }

    /* Badges: status pills in tables (PENDING, APPROVED, etc.) */
    .badge          { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; }
    .badge-pending  { background:rgba(245,158,11,0.15); color:#FCD34D; border:1px solid rgba(245,158,11,0.3); }
    .badge-approved { background:rgba(5,150,105,0.15);  color:#34D399; border:1px solid rgba(5,150,105,0.3); }
    .badge-rejected { background:rgba(225,29,72,0.15);  color:#FB7185; border:1px solid rgba(225,29,72,0.3); }
    .badge-returned { background:rgba(100,116,139,0.15);color:#94A3B8; border:1px solid rgba(100,116,139,0.3); }
    .badge-overdue  { background:rgba(225,29,72,0.15);  color:#FB7185; border:1px solid rgba(225,29,72,0.3); }
    .badge-blocked  { background:rgba(220,38,38,0.15);  color:#F87171; border:1px solid rgba(220,38,38,0.3); }

    /* ── N. Filter Tabs ────────────────────────────────────────────────────── */
    /* Pill-shaped buttons used to switch between PENDING / APPROVED / ALL views */
    .filter-tabs { display:flex; gap:8px; margin-bottom:22px; flex-wrap:wrap; }
    .filter-tab  { padding:7px 18px; border-radius:22px; font-size:12px; font-weight:700; border:1.5px solid var(--border); background:transparent; color:var(--text2); cursor:pointer; transition:all 0.18s; letter-spacing:0.3px; }
    .filter-tab.active { background:linear-gradient(135deg,var(--amber),var(--amber2)); color:#0D0E14; border-color:transparent; box-shadow:0 3px 14px rgba(232,160,32,0.4); }
    .filter-tab:hover:not(.active) { border-color:var(--amber); color:var(--amber); }

    /* ── O. Action Cards ───────────────────────────────────────────────────── */
    /* Clickable dashboard tiles on home screens */
    .action-card { background:var(--surface2); border:1.5px solid var(--border); border-radius:14px; padding:18px 20px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:14px; }
    .action-card:hover { border-color:var(--amber); transform:translateY(-2px); ${dark ? "box-shadow:0 8px 28px rgba(0,0,0,0.3),0 0 20px var(--glow);" : "box-shadow:0 6px 20px rgba(232,160,32,0.15);"} }
    .action-card-icon { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }

    /* ── P. Landing Page ───────────────────────────────────────────────────── */
    .landing {
      min-height:100vh; display:flex; flex-direction:column; background:var(--bg);
      position:relative; overflow:hidden;
      background-image:
        radial-gradient(ellipse 70% 60% at 15% 30%, rgba(232,160,32,0.08) 0%, transparent 65%),
        radial-gradient(ellipse 60% 50% at 85% 70%, rgba(13,148,136,0.08) 0%, transparent 65%),
        radial-gradient(ellipse 40% 40% at 60% 15%, rgba(79,70,229,0.06) 0%, transparent 60%);
    }
    /* Floating blurred colour orbs — purely decorative background blobs */
    .orb   { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
    .orb-1 { width:500px; height:500px; background:rgba(232,160,32,0.11); top:-140px; left:-120px; animation:float 9s ease-in-out infinite; }
    .orb-2 { width:420px; height:420px; background:rgba(13,148,136,0.10); bottom:-100px; right:-100px; animation:float 11s ease-in-out infinite 3s; }
    .orb-3 { width:320px; height:320px; background:rgba(79,70,229,0.07); top:38%; left:52%; animation:float 8s ease-in-out infinite 1.5s; }

    /* Frosted glass top navigation bar on landing page */
    .landing-nav         { display:flex; align-items:center; justify-content:space-between; padding:22px 64px; position:relative; z-index:10; border-bottom:1px solid var(--border); backdrop-filter:blur(10px); background:${dark ? "rgba(8,11,20,0.55)" : "rgba(240,242,248,0.65)"}; }
    .landing-nav-actions { display:flex; gap:12px; align-items:center; }

    /* Hero section — the big centered headline area */
    .hero         { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:80px 32px 60px; position:relative; z-index:5; }
    .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; padding:6px 18px 6px 8px; background:${dark ? "rgba(232,160,32,0.08)" : "rgba(232,160,32,0.10)"}; border:1.5px solid rgba(232,160,32,0.28); border-radius:100px; font-size:12px; font-weight:600; color:var(--amber); margin-bottom:32px; letter-spacing:0.4px; animation:fadeUp 0.6s 0.1s both; }
    .eyebrow-dot  { width:8px; height:8px; background:var(--amber); border-radius:50%; animation:shimmer 2s infinite; }

    /* The big 3-line headline */
    .hero-title       { font-family:'Cormorant Garamond',serif; font-size:clamp(52px,8vw,96px); font-weight:700; line-height:1.0; letter-spacing:-2px; margin-bottom:26px; }
    .hero-title .l1   { display:block; color:var(--text); animation:fadeUp 0.6s 0.2s both; }
    /* l2 has an animated colour gradient that moves back and forth */
    .hero-title .l2   { display:block; background:linear-gradient(135deg,var(--amber) 0%,var(--amber2) 40%,var(--teal2) 100%); background-size:200% 200%; animation:gradMove 4s ease infinite,fadeUp 0.6s 0.3s both; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
    .hero-title .l3   { display:block; color:var(--text); opacity:0.75; font-style:italic; animation:fadeUp 0.6s 0.4s both; }
    .hero-sub         { font-size:18px; color:var(--text2); line-height:1.7; max-width:540px; margin:0 auto 44px; animation:fadeUp 0.6s 0.5s both; }
    .hero-cta         { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; animation:fadeUp 0.6s 0.6s both; }
    .hero-stats       { display:flex; gap:48px; justify-content:center; margin-top:56px; padding-top:40px; border-top:1px solid var(--border); animation:fadeUp 0.6s 0.8s both; }
    .hero-stat-num    { font-family:'Cormorant Garamond',serif; font-size:38px; font-weight:700; color:var(--amber); }
    .hero-stat-label  { font-size:11px; color:var(--text3); text-transform:uppercase; letter-spacing:0.8px; margin-top:2px; }

    /* Feature strip at the bottom of landing page — 4 columns */
    .features      { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:var(--border); border-top:1px solid var(--border); position:relative; z-index:5; }
    .feat          { background:var(--bg); padding:36px 32px; transition:background 0.22s; }
    .feat:hover    { background:var(--bg2); }
    .feat:hover .feat-num { color:var(--amber); }
    .feat-num      { font-family:'Cormorant Garamond',serif; font-size:54px; font-weight:700; color:var(--border); line-height:1; margin-bottom:12px; transition:color 0.3s; }
    .feat-title    { font-weight:700; font-size:15px; color:var(--text); margin-bottom:7px; }
    .feat-desc     { font-size:13px; color:var(--text2); line-height:1.6; }

    /* ── Q. Auth Card ──────────────────────────────────────────────────────── */
    /* The frosted glass card on Login, Register, OTP pages */
    .auth-card  { background:var(--surface2); border:1.5px solid var(--border); border-radius:22px; padding:44px; ${dark ? "box-shadow:0 24px 80px rgba(0,0,0,0.5),0 0 60px var(--glow);" : "box-shadow:0 16px 60px rgba(79,70,229,0.12),0 0 40px var(--glow);"} backdrop-filter:blur(20px); width:100%; max-width:460px; animation:fadeUp 0.5s 0.1s both; }
    .auth-icon  { width:64px; height:64px; border-radius:18px; margin:0 auto 16px; background:linear-gradient(135deg,var(--amber),var(--teal2)); display:flex; align-items:center; justify-content:center; font-size:28px; box-shadow:0 6px 24px rgba(232,160,32,0.45); animation:glowPulse 3s ease-in-out infinite; }
    .auth-title { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:700; color:var(--text); text-align:center; }
    .auth-sub   { font-size:14px; color:var(--text2); margin-top:6px; text-align:center; }

    /* ── R. Animations ─────────────────────────────────────────────────────── */
    @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin     { to{transform:rotate(360deg)} }
    @keyframes shimmer  { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes float    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
    @keyframes gradMove { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
    @keyframes glowPulse{ 0%,100%{box-shadow:0 0 20px var(--glow)} 50%{box-shadow:0 0 50px var(--glow),0 0 90px rgba(232,160,32,0.10)} }
    .fade-up { animation:fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) forwards; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3 — SHARED UI COMPONENTS
// These are tiny, reusable pieces used all across the app.
// ─────────────────────────────────────────────────────────────────────────────

// ── Spinner ───────────────────────────────────────────────────────────────────
// Animated circular loading indicator.
// `size` controls width/height in px (default 16px = fits inside buttons).
function Spinner({ size = 16 }) {
  return (
    <span style={{
      display:       "inline-block",
      width:         size,
      height:        size,
      border:        "2px solid rgba(255,255,255,0.2)", // faint ring
      borderTopColor:"var(--amber)",                    // amber arc that spins
      borderRadius:  "50%",
      animation:     "spin 0.7s linear infinite",       // @keyframes spin defined in CSS
    }}/>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────────
// Renders a coloured pill badge for status strings like PENDING, APPROVED, etc.
// Maps each status to a CSS class from GlobalStyle.
function StatusBadge({ status }) {
  const map = {
    PENDING:  "badge-pending",
    APPROVED: "badge-approved",
    REJECTED: "badge-rejected",
    BORROWED: "badge-approved",  // treated like approved — same green
    RETURNED: "badge-returned",
    OVERDUE:  "badge-overdue",
    BLOCKED:  "badge-blocked",
    ACTIVE:   "badge-approved",
    EXPIRED:  "badge-rejected",
  };
  return <span className={`badge ${map[status] || "badge-pending"}`}>{status}</span>;
}

// ── ThemeToggle ───────────────────────────────────────────────────────────────
// Button shown in the sidebar footer.
// Reads dark/toggle from ThemeContext via useTheme().
function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button className="theme-btn" onClick={toggle}>
      {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
// The left navigation panel rendered inside all three dashboards.
//
// Props:
//   subtitle    — text shown under "LibraryMS" logo ("Admin Panel", etc.)
//   navItems    — array of { id, icon, label, badge? }
//   activeTab   — currently selected tab's id
//   setActiveTab — function to switch active tab
//   user        — logged-in user object { name, email, role, ... }
//   roleLabel   — string shown in user chip ("Admin", "Librarian", "Member")
//   onLogout    — function called when Sign Out is clicked
function Sidebar({ subtitle, navItems, activeTab, setActiveTab, user, roleLabel, onLogout }) {
  return (
    <aside className="sidebar">

      {/* Logo + subtitle */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">📚</div>
          <div>
            <div className="logo-text">LibraryMS</div>
            <div className="logo-sub">{subtitle}</div>
          </div>
        </div>
      </div>

      {/* Nav links — rendered from the navItems array */}
      <nav className="sidebar-nav">
        {navItems.map(n => (
          <div
            key={n.id}
            className={`nav-item ${activeTab === n.id ? "active" : ""}`}
            onClick={() => setActiveTab(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
            {/* Red badge number — only shown when badge > 0 */}
            {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
          </div>
        ))}
      </nav>

      {/* Footer: user info + theme + logout */}
      <div className="sidebar-footer">
        <div className="user-chip">
          {/* Avatar shows first letter of user's name */}
          <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="user-chip-name">{user.name}</div>
            <div className="user-chip-role">{roleLabel}</div>
          </div>
        </div>
        <ThemeToggle />
        <button className="btn-ghost" onClick={onLogout} style={{ width:"100%" }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── useBookStats ──────────────────────────────────────────────────────────────
// Custom hook: fetches all books from backend and returns computed count stats.
// Called on the home dashboard of all three roles.
// Returns: { total, available, unavailable }
function useBookStats() {
  const [stats, setStats] = useState({ total:0, available:0, unavailable:0 });

  useEffect(() => {
    fetch(`${API}/books`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : [])
      .then(books => {
        if (!Array.isArray(books)) return;
        setStats({
          total:       books.length,
          available:   books.filter(b => (b.availableCopies ?? 0) > 0).length,
          unavailable: books.filter(b => (b.availableCopies ?? 0) === 0).length,
        });
      })
      .catch(() => {});
  }, []);

  return stats;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4 — AUTH PAGES
//
// Page flow:
//   Landing → Register → OTP verify → Login → Dashboard
//
// Navigation is done by calling navigate(pageName) which updates the `page`
// state in App(). No router library needed — just a string state.
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// 4A. LANDING PAGE
//     Shown to all unauthenticated users when they visit the app.
//     Contains: animated hero, stats row, feature strip, top nav.
// ═══════════════════════════════════════════════════════════════════════════
function LandingPage({ navigate }) {
  const { dark, toggle } = useTheme();  // need toggle for top-nav theme button

  return (
    <div className="landing">
      {/* Floating glowing background orbs — CSS animation "float" */}
      <div className="orb orb-1"/>
      <div className="orb orb-2"/>
      <div className="orb orb-3"/>

      {/* ── Top Nav Bar ── */}
      <nav className="landing-nav">
        <div className="logo-mark">
          <div className="logo-icon" style={{ width:38,height:38,fontSize:18 }}>📚</div>
          <div className="logo-text" style={{ fontSize:20 }}>LibraryMS</div>
        </div>
        <div className="landing-nav-actions">
          <button className="theme-btn" onClick={toggle} style={{ marginBottom:0,width:"auto",padding:"8px 14px",fontSize:12 }}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button className="btn-ghost"   style={{ padding:"10px 22px" }} onClick={() => navigate("login")}>Sign In</button>
          <button className="btn-primary" style={{ padding:"10px 22px" }} onClick={() => navigate("register")}>Get Started →</button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="hero">
        {/* Pulsing amber dot + label above headline */}
        <div className="hero-eyebrow">
          <div className="eyebrow-dot"/>
          <span>Library Management System</span>
        </div>

        {/* 3-line headline — each line animates in with a staggered delay */}
        <h1 className="hero-title">
          <span className="l1">Knowledge Begins</span>
          <span className="l2">In Organisation</span>   {/* animated gradient text */}
          <span className="l3">At Your Fingertips</span>{/* italic, slightly faded */}
        </h1>

        <p className="hero-sub">
          A complete platform for admins, librarians, and members.
          Manage books, memberships, reservations, borrows, and fines — beautifully.
        </p>

        <div className="hero-cta">
          <button className="btn-primary" style={{ padding:"15px 38px",fontSize:15,borderRadius:12 }} onClick={() => navigate("register")}>Create Free Account</button>
          <button className="btn-ghost"   style={{ padding:"14px 32px",fontSize:15,borderRadius:12 }} onClick={() => navigate("login")}>Sign In →</button>
        </div>

        {/* Stats row at bottom of hero */}
        <div className="hero-stats">
          {[{num:"50+",label:"Books Seeded"},{num:"3",label:"Role Types"},{num:"∞",label:"Possibilities"}].map((s,i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div className="hero-stat-num">{s.num}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Strip ── 4 tiles at the very bottom */}
      <div className="features">
        {[
          { n:"01", t:"Role-Based Access",    d:"Admin, Librarian & Member dashboards, each precisely tailored to their workflow." },
          { n:"02", t:"OTP Verification",     d:"Secure email OTP ensures only verified users access your library system." },
          { n:"03", t:"Smart Reservations",   d:"Members request unavailable books; librarians approve with one click." },
          { n:"04", t:"Borrow & Fine System", d:"Borrow up to 3 books. ₹10/day overdue fine. Auto-block at ₹500. Subscription plans." },
        ].map((f,i) => (
          <div className="feat" key={i}>
            <div className="feat-num">{f.n}</div>
            <div className="feat-title">{f.t}</div>
            <div className="feat-desc">{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4B. REGISTER PAGE
//     User enters name, email, password, role (MEMBER or LIBRARIAN).
//     On success → saves otpEmail to sessionStorage → navigates to OTP page.
// ═══════════════════════════════════════════════════════════════════════════
function RegisterPage({ navigate }) {
  // All form fields in one state object — updated with spread syntax
  const [form,    setForm]    = useState({ name:"", email:"", password:"", role:"MEMBER" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();   // stop browser from reloading the page
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),  // send all form fields as JSON
      });

      if (!res.ok) throw new Error(await res.text() || "Registration failed");

      // Save email so OtpPage knows where to send/verify the code
      sessionStorage.setItem("otpEmail", form.email);
      sessionStorage.setItem("otpRole",  form.role);

      navigate("otp");  // go to OTP verification step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-icon">📚</div>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-sub">Join the Library Management System</p>

        {error && <div className="msg-error" style={{ margin:"20px 0 0" }}>{error}</div>}

        {/* onSubmit on <form> means Enter key also submits the form */}
        <form onSubmit={handleRegister} style={{ display:"flex",flexDirection:"column",gap:16,marginTop:24 }}>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="Enter your full name" value={form.name}
              onChange={e => setForm({...form, name:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Create a strong password" value={form.password}
              onChange={e => setForm({...form, password:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label>Register As</label>
            <select value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
              <option value="MEMBER">Member</option>
              <option value="LIBRARIAN">Librarian</option>
            </select>
          </div>

          {/* Context-sensitive hint based on selected role */}
          {form.role === "MEMBER"    && <p style={{ fontSize:12,color:"var(--text3)",lineHeight:1.6 }}>📧 An OTP will be sent to verify your email.</p>}
          {form.role === "LIBRARIAN" && <p style={{ fontSize:12,color:"var(--text3)",lineHeight:1.6 }}>⏳ Your account requires Admin approval before you can log in.</p>}

          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:6,width:"100%",fontSize:15 }}>
            {loading ? <Spinner/> : "Create Account →"}
          </button>
        </form>

        <div className="divider"/>
        <p style={{ textAlign:"center",fontSize:13,color:"var(--text2)" }}>
          Already have an account?{" "}
          <span style={{ color:"var(--amber)",cursor:"pointer",fontWeight:700 }} onClick={() => navigate("login")}>Sign In</span>
        </p>
        <p style={{ textAlign:"center",fontSize:12,color:"var(--text3)",marginTop:10,cursor:"pointer" }}
           onClick={() => navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4C. OTP PAGE
//     Shows 6 individual digit boxes for the verification code.
//     Auto-focuses next box when a digit is typed.
//     Auto-moves back on Backspace in an empty box.
// ═══════════════════════════════════════════════════════════════════════════
function OtpPage({ navigate }) {
  // 6-element array, one string per digit box ("")
  const [otp,     setOtp]     = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // Retrieved from sessionStorage where RegisterPage stored it
  const email = sessionStorage.getItem("otpEmail") || "";

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;  // only allow digits 0-9
    const next = [...otp];
    next[idx] = val.slice(-1);       // keep only the last typed character
    setOtp(next);
    // Automatically focus the NEXT box after a digit is entered
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (idx, e) => {
    // On Backspace in an empty box → move focus back to previous box
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");  // combine ["1","2","3","4","5","6"] → "123456"
    if (code.length < 6) { setError("Please enter all 6 digits"); return; }
    setError(""); setLoading(true);

    try {
      const r = await fetch(`${API}/auth/verify?email=${encodeURIComponent(email)}&otp=${code}`, { method:"POST" });
      const txt = await r.text();
      if (txt.includes("successfully") || txt.toLowerCase().includes("verified")) {
        setSuccess("✅ Email verified!");
        sessionStorage.removeItem("otpEmail");  // clean up — no longer needed
      } else {
        setError(txt || "Verification failed");
      }
    } catch { setError("Network error."); }
    finally   { setLoading(false); }
  };

  return (
    <div className="page-center">
      <div className="auth-card" style={{ textAlign:"center" }}>
        <div className="auth-icon">✉️</div>
        <h2 className="auth-title">Verify Email</h2>
        <p className="auth-sub">6-digit code sent to <strong style={{ color:"var(--amber)" }}>{email}</strong></p>

        {error   && <div className="msg-error"   style={{ marginTop:14 }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginTop:14 }}>{success}</div>}

        {/* Only show boxes + button before successful verification */}
        {!success && (
          <>
            <div className="otp-inputs">
              {otp.map((d, i) => (
                <input key={i} id={`otp-${i}`} className="otp-box"
                  maxLength={1} value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}/>
              ))}
            </div>
            <button className="btn-primary" onClick={handleVerify} disabled={loading} style={{ width:"100%",padding:14 }}>
              {loading ? <Spinner/> : "Verify Code →"}
            </button>
          </>
        )}

        {/* After success: show button to proceed to login */}
        {success && (
          <button className="btn-teal" onClick={() => navigate("login")} style={{ width:"100%",padding:14,marginTop:16 }}>
            Go to Sign In →
          </button>
        )}
        <p style={{ marginTop:16,fontSize:12,color:"var(--text3)" }}>Code valid for 5 minutes</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4D. LOGIN PAGE
//     Email + password form.
//     On success: backend returns user object WITH a JWT token.
//     Token stored in localStorage. User object passed to App via onLogin().
// ═══════════════════════════════════════════════════════════════════════════
function LoginPage({ navigate, onLogin }) {
  const [form,    setForm]    = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleLogin = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text() || "Login failed");

      const user = await res.json();           // { id, name, email, role, token, ... }
      if (user.token) localStorage.setItem("token", user.token); // save JWT

      onLogin(user);  // ← tells App.jsx who is logged in → triggers dashboard render
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card">
        <div className="auth-icon">🔐</div>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-sub">Sign in to your library account</p>

        {error && <div className="msg-error" style={{ margin:"20px 0 0" }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:16,marginTop:24 }}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form,email:e.target.value})} required/>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Your password" value={form.password}
              onChange={e => setForm({...form,password:e.target.value})} required/>
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop:6,width:"100%",fontSize:15 }}>
            {loading ? <Spinner/> : "Sign In →"}
          </button>
        </form>

        <div className="divider"/>
        <p style={{ textAlign:"center",fontSize:13,color:"var(--text2)" }}>
          Don't have an account?{" "}
          <span style={{ color:"var(--amber)",cursor:"pointer",fontWeight:700 }} onClick={() => navigate("register")}>Create Account</span>
        </p>
        <p style={{ textAlign:"center",fontSize:12,color:"var(--text3)",marginTop:10,cursor:"pointer" }}
           onClick={() => navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5 — SHARED FEATURE PAGES
// Used by more than one role. Passed the `user` prop when needed.
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// 5A. PROFILE PANEL  (Admin ✓ | Librarian ✓ | Member ✓)
//     Shows user info card + password-change form.
// ═══════════════════════════════════════════════════════════════════════════
function ProfilePanel({ user }) {
  const [pwForm,   setPwForm]   = useState({ currentPassword:"", newPassword:"", confirm:"" });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    // Client-side check before hitting the API
    if (pwForm.newPassword !== pwForm.confirm) { setError("Passwords don't match"); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API}/auth/change-password`, {
        method:  "POST",
        headers: authHeaders(),
        body:    JSON.stringify({ email:user.email, currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword }),
      });
      if (!r.ok) throw new Error(await r.text());
      setSuccess("Password updated!");
      setPwForm({ currentPassword:"", newPassword:"", confirm:"" });
    } catch (err) { setError(err.message); }
    finally      { setLoading(false); }
  };

  return (
    <div style={{ maxWidth:580 }}>
      <div className="page-header"><h1>My Profile</h1><p>Manage your account details and security</p></div>

      {/* User info card */}
      <div className="card card-glow" style={{ marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:20,marginBottom:26,paddingBottom:22,borderBottom:"1.5px solid var(--border)" }}>
          <div className="avatar" style={{ width:72,height:72,fontSize:28,borderRadius:20 }}>{user.name?.[0]?.toUpperCase()}</div>
          <div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,marginBottom:8 }}>{user.name}</h3>
            <div style={{ display:"flex",gap:8 }}>
              <span className={`tag tag-${user.role?.toLowerCase()}`}>{user.role}</span>
              <span className={`tag ${user.verified?"tag-verified":"tag-pending"}`}>{user.verified?"✓ Verified":"Unverified"}</span>
            </div>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          {[{label:"Full Name",value:user.name},{label:"Email",value:user.email},{label:"Role",value:user.role},{label:"Status",value:user.approved?"Approved":"Pending"}].map((r,i) => (
            <div key={i} style={{ background:"var(--surface)",borderRadius:10,padding:"14px 16px" }}>
              <div style={{ fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:5,fontWeight:700 }}>{r.label}</div>
              <div style={{ fontSize:14,fontWeight:500 }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Password change form */}
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:4 }}>Change Password</h3>
        <p style={{ fontSize:13,color:"var(--text2)",marginBottom:22 }}>Update your account password securely</p>
        {error   && <div className="msg-error"   style={{ marginBottom:16 }}>{error}</div>}
        {success && <div className="msg-success" style={{ marginBottom:16 }}>{success}</div>}
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

// ═══════════════════════════════════════════════════════════════════════════
// 5B. MANAGE RESERVATIONS  (Admin ✓ | Librarian ✓)
//     Reservations = member wants an UNAVAILABLE book (waitlist).
//     Admin/Librarian can Approve or Reject each request.
// ═══════════════════════════════════════════════════════════════════════════
function ManageReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [msg,      setMsg]      = useState({ text:"", type:"" });
  const [filter,   setFilter]   = useState("PENDING"); // which status tab is active

  const fetchAll = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/reservations/all`, { headers:authHeaders() });
      setReservations(r.ok ? await r.json() : []);
    } catch { setReservations([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    try {
      const r = await fetch(`${API}/reservations/${id}/status?status=${status}`, { method:"PUT", headers:authHeaders() });
      setMsg({ text:r.ok ? `✅ ${status.toLowerCase()}!` : "❌ Failed", type:r.ok?"success":"error" });
      if (r.ok) fetchAll(); // refresh the list
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  };

  // Count by status for the filter tab badges
  const counts   = { PENDING:reservations.filter(r=>r.status==="PENDING").length, APPROVED:reservations.filter(r=>r.status==="APPROVED").length, REJECTED:reservations.filter(r=>r.status==="REJECTED").length };
  const filtered = filter === "ALL" ? reservations : reservations.filter(r => r.status === filter);

  return (
    <div>
      <div className="page-header"><h1>Book Reservations</h1><p>Manage member waitlist requests for unavailable books</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}

      {/* Status filter tabs */}
      <div className="filter-tabs">
        {["PENDING","APPROVED","REJECTED","ALL"].map(f => (
          <button key={f} className={`filter-tab ${filter===f?"active":""}`} onClick={() => setFilter(f)}>
            {f}
            {/* Show count badge on each tab */}
            {f !== "ALL" && counts[f] !== undefined && (
              <span style={{ marginLeft:5,background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"1px 7px",fontSize:10 }}>{counts[f]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>
          : filtered.length === 0
            ? <div style={{ textAlign:"center",padding:60,color:"var(--text2)" }}><div style={{ fontSize:48,marginBottom:14 }}>📭</div><p>No {filter.toLowerCase()} reservations</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Member</th><th>Book</th><th>Department</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map((r,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{r.memberName||r.memberId}</td>
                      <td style={{ fontWeight:600 }}>{r.bookTitle}</td>
                      <td><span className="tag tag-librarian">{r.bookDepartment||"—"}</span></td>
                      <td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td>
                      <td><StatusBadge status={r.status}/></td>
                      <td>
                        {r.status === "PENDING"
                          ? <div style={{ display:"flex",gap:6 }}>
                              <button className="btn-success" onClick={() => updateStatus(r.id,"APPROVED")}>✅ Approve</button>
                              <button className="btn-danger"  onClick={() => updateStatus(r.id,"REJECTED")}>❌ Reject</button>
                            </div>
                          : <span style={{ color:"var(--text3)",fontSize:12 }}>—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5C. MEMBER RESERVATIONS  (Member only)
//     Member views UNAVAILABLE books and sends a reservation request.
//     Different from BorrowBooks (which is for AVAILABLE books).
// ═══════════════════════════════════════════════════════════════════════════
function MemberReservations({ user }) {
  const [books,        setBooks]        = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [msg,          setMsg]          = useState({ text:"", type:"" });
  const [search,       setSearch]       = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch books and this member's reservations in parallel
      const [b, r] = await Promise.allSettled([
        fetch(`${API}/books`,                          { headers:authHeaders() }),
        fetch(`${API}/reservations/my/${user.id}`,    { headers:authHeaders() }),
      ]);
      if (b.status==="fulfilled" && b.value.ok) setBooks(await b.value.json());
      if (r.status==="fulfilled" && r.value.ok) setReservations(await r.value.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const reserve = async (bookId) => {
    try {
      const r = await fetch(`${API}/reservations/request`, {
        method:"POST", headers:authHeaders(),
        body:JSON.stringify({ bookId, memberId:user.id }),
      });
      const txt = await r.text();
      setMsg({ text:r.ok?"✅ Reservation sent! Librarian will review it.":"❌ "+txt, type:r.ok?"success":"error" });
      if (r.ok) fetchData();
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    setTimeout(() => setMsg({ text:"", type:"" }), 4000);
  };

  const unavail    = books.filter(b => (b.availableCopies??0) === 0);
  const filtered   = unavail.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase()));
  const reservedIds = new Set(reservations.map(r => r.bookId)); // set of already-reserved book IDs

  return (
    <div>
      <div className="page-header"><h1>Reserve a Book</h1><p>Request unavailable books — librarians will review your request promptly</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}

      {/* Show member's existing reservations */}
      {reservations.length > 0 && (
        <div className="card card-glow" style={{ marginBottom:24 }}>
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>My Reservation Requests</h3>
          <div className="table-wrap"><table>
            <thead><tr><th>Book</th><th>Author</th><th>Requested</th><th>Status</th></tr></thead>
            <tbody>
              {reservations.map((r,i) => (
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{r.bookTitle}</td>
                  <td style={{ color:"var(--text2)" }}>{r.bookAuthor}</td>
                  <td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td>
                  <td><StatusBadge status={r.status}/></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* List of unavailable books to reserve */}
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Unavailable Books</h3>
        <input placeholder="Search by title or author…" value={search} onChange={e=>setSearch(e.target.value)} style={{ marginBottom:18 }}/>
        {loading ? <div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>
          : filtered.length === 0
            ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:14 }}>🎉</div><p>{search?"No results":"All books currently available!"}</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Title</th><th>Author</th><th>Department</th><th>Action</th></tr></thead>
                <tbody>
                  {filtered.map((b,i) => (
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{b.title}</td>
                      <td style={{ color:"var(--text2)" }}>{b.author}</td>
                      <td><span className="tag tag-librarian">{b.department||"—"}</span></td>
                      <td>
                        {reservedIds.has(b.id)
                          ? <span className="badge badge-pending">Already Requested</span>
                          : <button className="btn-primary" style={{ padding:"7px 16px",fontSize:12 }} onClick={() => reserve(b.id)}>📌 Reserve</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5D. BORROW BOOKS  (Member only)
//     Member selects 1-3 AVAILABLE books and submits a borrow request.
//     Requires: active subscription, no existing pending request.
//
// COMPLETE FLOW:
//   1. Member needs an active subscription (Standard or Pro)
//   2. Member clicks rows to select books (max 3)
//   3. Submits → POST /api/borrow/request
//   4. Librarian/Admin approves → availableCopies decreases, due date set
//   5. Member returns book → availableCopies increases, fine if overdue
//   6. Unpaid fine ≥ ₹500 → account auto-blocked
// ═══════════════════════════════════════════════════════════════════════════
function BorrowBooks({ user }) {
  const [books,        setBooks]        = useState([]);   // all books from API
  const [selected,     setSelected]     = useState([]);   // member's current selection (max 3)
  const [myRequests,   setMyRequests]   = useState([]);   // this member's past borrow requests
  const [myBorrowings, setMyBorrowings] = useState([]);   // individual book borrowing records
  const [subscription, setSubscription] = useState(null); // member's active subscription
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [msg,          setMsg]          = useState({ text:"", type:"" });
  const [search,       setSearch]       = useState("");
  const [tab,          setTab]          = useState("borrow"); // inner tab: borrow | requests | history

  const fetchAll = async () => {
    setLoading(true);
    try {
      // 4 API calls in parallel — Promise.allSettled won't fail if one request fails
      const [booksRes, reqRes, borRes, subRes] = await Promise.allSettled([
        fetch(`${API}/books`,                               { headers:authHeaders() }),
        fetch(`${API}/borrow/requests/my/${user.id}`,      { headers:authHeaders() }),
        fetch(`${API}/borrow/borrowings/my/${user.id}`,    { headers:authHeaders() }),
        fetch(`${API}/subscriptions/my/${user.id}`,        { headers:authHeaders() }),
      ]);
      if (booksRes.status==="fulfilled" && booksRes.value.ok) setBooks(await booksRes.value.json());
      if (reqRes.status  ==="fulfilled" && reqRes.value.ok)   setMyRequests(await reqRes.value.json());
      if (borRes.status  ==="fulfilled" && borRes.value.ok)   setMyBorrowings(await borRes.value.json());
      if (subRes.status  ==="fulfilled" && subRes.value.ok)   setSubscription(await subRes.value.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  // Toggle a book in/out of the selection array
  const toggleSelect = (book) => {
    if (selected.find(b => b.id === book.id)) {
      setSelected(selected.filter(b => b.id !== book.id)); // deselect
    } else {
      if (selected.length >= MAX_BORROW_AT_ONCE) {
        setMsg({ text:`⚠️ You can select at most ${MAX_BORROW_AT_ONCE} books at a time`, type:"error" });
        setTimeout(() => setMsg({ text:"", type:"" }), 3000);
        return;
      }
      setSelected([...selected, book]); // add to selection
    }
  };

  const submitRequest = async () => {
    if (selected.length === 0) { setMsg({ text:"Please select at least 1 book", type:"error" }); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/borrow/request`, {
        method:"POST", headers:authHeaders(),
        body:JSON.stringify({ memberId:user.id, bookIds:selected.map(b=>b.id) }),
      });
      const txt = await res.text();
      if (res.ok) {
        setMsg({ text:"✅ Borrow request submitted! Waiting for approval.", type:"success" });
        setSelected([]); fetchAll();
      } else if (txt === "NO_SUBSCRIPTION") {
        setMsg({ text:"❌ You need an active subscription to borrow books.", type:"error" });
      } else if (txt === "SUBSCRIPTION_EXPIRED") {
        setMsg({ text:"❌ Your subscription has expired. Please renew it.", type:"error" });
      } else if (txt.startsWith("LIMIT_EXCEEDED")) {
        // Backend returns "LIMIT_EXCEEDED:maxAllowed:currentCount"
        const [,max,cur] = txt.split(":");
        setMsg({ text:`❌ Book limit exceeded! Your plan allows ${max} total. You have ${cur} borrowed.`, type:"error" });
      } else {
        setMsg({ text:"❌ " + txt, type:"error" });
      }
    } catch { setMsg({ text:"❌ Network error", type:"error" }); }
    finally  { setSubmitting(false); }
    setTimeout(() => setMsg({ text:"", type:"" }), 5000);
  };

  // Only show books with at least 1 available copy
  const availableBooks = books.filter(b => (b.availableCopies??0) > 0);
  const filteredBooks  = availableBooks.filter(b => !search || b.title?.toLowerCase().includes(search.toLowerCase()) || b.author?.toLowerCase().includes(search.toLowerCase()));

  const hasPendingRequest   = myRequests.some(r => r.status === "PENDING");
  const currentlyBorrowed   = myBorrowings.filter(b => b.status==="BORROWED" || b.status==="OVERDUE");
  const totalFine           = myBorrowings.filter(b => !b.finePaid && b.fineAmount>0).reduce((s,b) => s+b.fineAmount, 0);
  const subActive           = subscription && subscription.status !== "NONE" && subscription.status !== "EXPIRED";
  const maxBooks            = subscription?.maxBooks ?? 0;

  return (
    <div>
      <div className="page-header"><h1>Borrow Books</h1><p>Select up to {MAX_BORROW_AT_ONCE} available books and submit a borrow request</p></div>

      {/* ── Summary strip ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:14,marginBottom:24 }}>
        {[
          { icon:"🎫", label:"Subscription",      value:subActive?subscription.planName:"None",              color:subActive?"var(--teal2)":"#F87171" },
          { icon:"📚", label:"Max Books Allowed",  value:subActive?(maxBooks>=999?"Unlimited":maxBooks):"—", color:"var(--amber)" },
          { icon:"📖", label:"Currently Borrowed", value:currentlyBorrowed.length,                           color:"#818CF8" },
          { icon:"💰", label:"Outstanding Fine",   value:`₹${totalFine.toFixed(0)}`,                         color:totalFine>0?"#F87171":"var(--teal2)" },
        ].map((s,i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num" style={{ fontSize:22,color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Inner tabs ── */}
      <div className="filter-tabs">
        {[{id:"borrow",label:"📚 Borrow Books"},{id:"requests",label:"📋 My Requests"},{id:"history",label:"📖 My Borrowings"}].map(t2 => (
          <button key={t2.id} className={`filter-tab ${tab===t2.id?"active":""}`} onClick={()=>setTab(t2.id)}>{t2.label}</button>
        ))}
      </div>

      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}

      {/* ════ TAB: SELECT BOOKS TO BORROW ════ */}
      {tab === "borrow" && (
        <>
          {/* No subscription warning */}
          {!subActive && (
            <div className="msg-warn" style={{ marginBottom:20,display:"flex",alignItems:"center",gap:12 }}>
              <span style={{ fontSize:22 }}>⚠️</span>
              <span>You need an active <strong>Subscription</strong> to borrow books. Go to the Subscription tab.</span>
            </div>
          )}

          {/* Pending request block */}
          {hasPendingRequest && (
            <div style={{ background:"rgba(79,70,229,0.10)",border:"1.5px solid rgba(79,70,229,0.30)",borderRadius:14,padding:"16px 20px",marginBottom:20 }}>
              <span style={{ fontWeight:700,color:"#818CF8" }}>⏳ You already have a pending borrow request.</span>
              <span style={{ fontSize:13,color:"var(--text2)",marginLeft:8 }}>Wait for approval before making a new request.</span>
            </div>
          )}

          {/* Selected books confirmation bar — shown when selection is non-empty */}
          {selected.length > 0 && (
            <div className="card card-glow" style={{ marginBottom:20,background:"linear-gradient(135deg,rgba(232,160,32,0.08),rgba(13,148,136,0.06))" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
                <div>
                  <div style={{ fontWeight:700,marginBottom:8 }}>📦 Selected ({selected.length}/{MAX_BORROW_AT_ONCE})</div>
                  <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                    {selected.map(b => (
                      <div key={b.id} style={{ background:"var(--surface)",border:"1.5px solid var(--border2)",borderRadius:10,padding:"6px 14px",fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:8 }}>
                        {b.title}
                        {/* × to deselect this book */}
                        <span style={{ cursor:"pointer",color:"var(--text3)",fontSize:16 }} onClick={()=>toggleSelect(b)}>×</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-primary" onClick={submitRequest} disabled={submitting||hasPendingRequest||!subActive}>
                  {submitting?"Submitting…":"📨 Submit Borrow Request"}
                </button>
              </div>
            </div>
          )}

          {/* Available books table */}
          <div className="card">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,gap:12 }}>
              <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22 }}>Available Books ({availableBooks.length})</h3>
              <input placeholder="Search title or author…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:280 }}/>
            </div>
            {loading ? <div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>
              : filteredBooks.length === 0
                ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:12 }}>📭</div><p>{search?"No results":"No available books right now"}</p></div>
                : <div className="table-wrap"><table>
                    <thead><tr><th>Select</th><th>Title</th><th>Author</th><th>Department</th><th>Copies</th></tr></thead>
                    <tbody>
                      {filteredBooks.map((b,i) => {
                        const isSel = !!selected.find(s => s.id===b.id);
                        return (
                          // Clicking entire row toggles selection
                          <tr key={i} style={{ cursor:"pointer",background:isSel?"rgba(232,160,32,0.06)":"" }} onClick={()=>toggleSelect(b)}>
                            <td>
                              {/* Visual amber checkbox */}
                              <div style={{ width:22,height:22,borderRadius:6,border:`2px solid ${isSel?"var(--amber)":"var(--border)"}`,background:isSel?"var(--amber)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
                                {isSel && <span style={{ color:"#0D0E14",fontSize:13,fontWeight:900 }}>✓</span>}
                              </div>
                            </td>
                            <td style={{ fontWeight:600 }}>{b.title}</td>
                            <td style={{ color:"var(--text2)" }}>{b.author}</td>
                            <td><span className="tag tag-librarian">{b.department||"—"}</span></td>
                            <td><span style={{ color:"var(--teal2)",fontWeight:700 }}>{b.availableCopies}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        </>
      )}

      {/* ════ TAB: MY REQUESTS ════ */}
      {tab === "requests" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>My Borrow Requests</h3>
          {myRequests.length===0 ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:12 }}>📋</div><p>No borrow requests yet</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Books Requested</th><th>Count</th><th>Requested On</th><th>Due Date</th><th>Status</th></tr></thead>
                <tbody>
                  {myRequests.map((r,i)=>(
                    <tr key={i}>
                      <td style={{ fontWeight:600,maxWidth:280 }}>{r.bookTitles}</td>
                      <td style={{ textAlign:"center",color:"var(--amber)",fontWeight:700 }}>{r.bookCount}</td>
                      <td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td>
                      <td style={{ color:"var(--teal2)" }}>{r.dueDate?new Date(r.dueDate).toLocaleDateString():"—"}</td>
                      <td><StatusBadge status={r.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}

      {/* ════ TAB: MY BORROWINGS ════ */}
      {tab === "history" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>My Borrowings</h3>
          {totalFine > 0 && (
            <div className="msg-error" style={{ marginBottom:18 }}>
              ⚠️ Outstanding Fine: <strong>₹{totalFine.toFixed(0)}</strong>
              {totalFine >= FINE_BLOCK_LIMIT && " — Your account is BLOCKED. Pay the librarian to unblock."}
            </div>
          )}
          {myBorrowings.length===0 ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:12 }}>📚</div><p>No borrowings yet</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Book</th><th>Author</th><th>Borrowed</th><th>Due Date</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead>
                <tbody>
                  {myBorrowings.map((b,i)=>(
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{b.bookTitle}</td>
                      <td style={{ color:"var(--text2)" }}>{b.bookAuthor}</td>
                      <td style={{ color:"var(--text2)" }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString():"—"}</td>
                      <td style={{ color:b.status==="OVERDUE"?"#F87171":"var(--teal2)",fontWeight:600 }}>
                        {b.dueDate?new Date(b.dueDate).toLocaleDateString():"—"}
                      </td>
                      <td style={{ color:"var(--text2)" }}>{b.returnedAt?new Date(b.returnedAt).toLocaleDateString():"—"}</td>
                      <td style={{ color:b.fineAmount>0?"#F87171":"var(--teal2)",fontWeight:700 }}>
                        ₹{b.fineAmount?.toFixed(0)||0}
                        {b.finePaid&&<span style={{ color:"var(--teal2)",fontSize:10,marginLeft:4 }}>✓paid</span>}
                      </td>
                      <td><StatusBadge status={b.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5E. MANAGE BORROWINGS  (Admin ✓ | Librarian ✓)
//     Approve/reject borrow requests, mark books returned, manage fines.
//
// TABS:
//   Borrow Requests — PENDING requests to approve/reject + set due date
//   Active Borrows  — books currently out, with return button
//   All Borrowings  — complete history with search
//   Fines           — members with unpaid fines, mark paid + unblock
// ═══════════════════════════════════════════════════════════════════════════
function ManageBorrowings({ userRole }) {
  const [requests,   setRequests]   = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [tab,        setTab]        = useState("requests");
  const [msg,        setMsg]        = useState({ text:"", type:"" });
  const [dueDays,    setDueDays]    = useState(14);    // default: 2-week loan period
  const [approving,  setApproving]  = useState(null);  // id of request currently being approved
  const [search,     setSearch]     = useState("");

  const fetchAll = async () => {
    try {
      const [r, b] = await Promise.allSettled([
        fetch(`${API}/borrow/requests/all`,  { headers:authHeaders() }),
        fetch(`${API}/borrow/borrowings/all`,{ headers:authHeaders() }),
      ]);
      if (r.status==="fulfilled" && r.value.ok) setRequests(await r.value.json());
      if (b.status==="fulfilled" && b.value.ok) setBorrowings(await b.value.json());
    } catch {}
  };
  useEffect(() => { fetchAll(); }, []);

  const approveRequest = async (id) => {
    try {
      const r = await fetch(`${API}/borrow/requests/${id}/approve`, {
        method:"PUT", headers:authHeaders(),
        body:JSON.stringify({ dueDays, approvedBy:userRole }),
      });
      const txt = await r.text();
      setMsg({ text:r.ok?"✅ "+txt:"❌ "+txt, type:r.ok?"success":"error" });
      if (r.ok) { setApproving(null); fetchAll(); }
    } catch { setMsg({ text:"❌ Network error",type:"error" }); }
    setTimeout(()=>setMsg({text:"",type:""}),3000);
  };

  const rejectRequest = async (id) => {
    try {
      const r = await fetch(`${API}/borrow/requests/${id}/reject`,{method:"PUT",headers:authHeaders()});
      setMsg({text:r.ok?"✅ Request rejected":"❌ Failed",type:r.ok?"success":"error"});
      if(r.ok) fetchAll();
    } catch { setMsg({text:"❌ Network error",type:"error"}); }
    setTimeout(()=>setMsg({text:"",type:""}),3000);
  };

  const returnBook = async (id) => {
    try {
      const r = await fetch(`${API}/borrow/borrowings/${id}/return`,{method:"PUT",headers:authHeaders()});
      const txt = await r.text();
      setMsg({text:r.ok?"✅ "+txt:"❌ "+txt,type:r.ok?"success":"error"});
      if(r.ok) fetchAll();
    } catch { setMsg({text:"❌ Network error",type:"error"}); }
    setTimeout(()=>setMsg({text:"",type:""}),4000);
  };

  const payFine = async (memberId,memberName) => {
    try {
      const r = await fetch(`${API}/borrow/borrowings/${memberId}/pay-fine`,{method:"PUT",headers:authHeaders()});
      setMsg({text:r.ok?`✅ Fine cleared for ${memberName}. Account unblocked.`:"❌ Failed",type:r.ok?"success":"error"});
      if(r.ok) fetchAll();
    } catch { setMsg({text:"❌ Network error",type:"error"}); }
    setTimeout(()=>setMsg({text:"",type:""}),4000);
  };

  const pendingRequests  = requests.filter(r=>r.status==="PENDING");
  const activeBorrowings = borrowings.filter(b=>b.status==="BORROWED"||b.status==="OVERDUE");
  const filteredAll      = borrowings.filter(b=>!search||b.memberName?.toLowerCase().includes(search.toLowerCase())||b.bookTitle?.toLowerCase().includes(search.toLowerCase()));

  // Group unpaid fines by member for the Fines tab
  const memberFineMap = {};
  borrowings.forEach(b => {
    if (!b.finePaid && b.fineAmount>0) {
      if (!memberFineMap[b.memberId]) memberFineMap[b.memberId] = {name:b.memberName,email:b.memberEmail,memberId:b.memberId,total:0};
      memberFineMap[b.memberId].total += b.fineAmount;
    }
  });
  const fineMembers = Object.values(memberFineMap);

  return (
    <div>
      <div className="page-header"><h1>Manage Borrowings</h1><p>Handle borrow requests, returns, fines and member account status</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}

      {/* Summary stat strip */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14,marginBottom:24 }}>
        {[
          {icon:"⏳",label:"Pending Requests",value:pendingRequests.length,  c:"#FCD34D"},
          {icon:"📖",label:"Active Borrows",   value:activeBorrowings.length,c:"var(--teal2)"},
          {icon:"⚠️",label:"Overdue",          value:borrowings.filter(b=>b.status==="OVERDUE").length,c:"#F87171"},
          {icon:"💰",label:"Members w/ Fines", value:fineMembers.length,     c:"#F87171"},
        ].map((s,i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num" style={{ fontSize:32,color:s.c }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="filter-tabs">
        {[
          {id:"requests",  label:`⏳ Borrow Requests${pendingRequests.length>0?" ("+pendingRequests.length+")":""}`},
          {id:"active",    label:"📖 Active Borrows"},
          {id:"all",       label:"📋 All Borrowings"},
          {id:"fines",     label:`💰 Fines${fineMembers.length>0?" ("+fineMembers.length+")":""}`},
        ].map(t2 => (
          <button key={t2.id} className={`filter-tab ${tab===t2.id?"active":""}`} onClick={()=>setTab(t2.id)}>{t2.label}</button>
        ))}
      </div>

      {/* ════ TAB: BORROW REQUESTS ════ */}
      {tab==="requests" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Borrow Requests</h3>
          {requests.length===0 ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:12 }}>📭</div><p>No requests yet</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Member</th><th>Books Requested</th><th>Count</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {requests.map((r,i) => (
                    <tr key={i}>
                      <td><div style={{ fontWeight:600 }}>{r.memberName}</div><div style={{ fontSize:11,color:"var(--text3)" }}>{r.memberEmail}</div></td>
                      <td style={{ maxWidth:260,fontSize:13 }}>{r.bookTitles}</td>
                      <td style={{ textAlign:"center",fontWeight:700,color:"var(--amber)" }}>{r.bookCount}</td>
                      <td style={{ color:"var(--text2)" }}>{r.requestedAt?new Date(r.requestedAt).toLocaleDateString():"—"}</td>
                      <td><StatusBadge status={r.status}/></td>
                      <td>
                        {r.status==="PENDING" && (
                          approving===r.id ? (
                            // Inline due-date picker shown when "Approve" is clicked
                            <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                              <input type="number" value={dueDays} onChange={e=>setDueDays(parseInt(e.target.value))} style={{ width:60,padding:"6px 8px",fontSize:12 }} min={1} max={90}/>
                              <span style={{ fontSize:12,color:"var(--text2)" }}>days</span>
                              <button className="btn-success" style={{ padding:"6px 12px",fontSize:12 }} onClick={()=>approveRequest(r.id)}>✅ Confirm</button>
                              <button className="btn-ghost"   style={{ padding:"6px 10px",fontSize:12 }} onClick={()=>setApproving(null)}>✕</button>
                            </div>
                          ) : (
                            <div style={{ display:"flex",gap:6 }}>
                              <button className="btn-success" onClick={()=>setApproving(r.id)}>✅ Approve</button>
                              <button className="btn-danger"  onClick={()=>rejectRequest(r.id)}>❌ Reject</button>
                            </div>
                          )
                        )}
                        {r.status!=="PENDING" && <span style={{ color:"var(--text3)",fontSize:12 }}>{r.approvedBy||"—"}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}

      {/* ════ TAB: ACTIVE BORROWS ════ */}
      {tab==="active" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Active Borrows</h3>
          {activeBorrowings.length===0 ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:12 }}>📚</div><p>No active borrowings</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Member</th><th>Book</th><th>Borrowed</th><th>Due Date</th><th>Fine</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {activeBorrowings.map((b,i)=>(
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{b.memberName}</td>
                      <td style={{ fontWeight:600 }}>{b.bookTitle}</td>
                      <td style={{ color:"var(--text2)" }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString():"—"}</td>
                      <td style={{ color:b.status==="OVERDUE"?"#F87171":"var(--teal2)",fontWeight:600 }}>{b.dueDate?new Date(b.dueDate).toLocaleDateString():"—"}</td>
                      <td style={{ color:b.fineAmount>0?"#F87171":"var(--teal2)",fontWeight:700 }}>₹{b.fineAmount?.toFixed(0)||0}</td>
                      <td><StatusBadge status={b.status}/></td>
                      <td><button className="btn-teal" style={{ padding:"6px 14px",fontSize:12 }} onClick={()=>returnBook(b.id)}>📥 Return</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}

      {/* ════ TAB: ALL BORROWINGS HISTORY ════ */}
      {tab==="all" && (
        <div className="card">
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,gap:12 }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22 }}>All Borrowings</h3>
            <input placeholder="Search member or book…" value={search} onChange={e=>setSearch(e.target.value)} style={{ maxWidth:260 }}/>
          </div>
          <div className="table-wrap"><table>
            <thead><tr><th>Member</th><th>Book</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead>
            <tbody>
              {filteredAll.map((b,i)=>(
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{b.memberName}</td>
                  <td>{b.bookTitle}</td>
                  <td style={{ color:"var(--text2)" }}>{b.borrowedAt?new Date(b.borrowedAt).toLocaleDateString():"—"}</td>
                  <td style={{ color:b.status==="OVERDUE"?"#F87171":"var(--text2)" }}>{b.dueDate?new Date(b.dueDate).toLocaleDateString():"—"}</td>
                  <td style={{ color:"var(--text2)" }}>{b.returnedAt?new Date(b.returnedAt).toLocaleDateString():"—"}</td>
                  <td style={{ color:b.fineAmount>0?"#F87171":"var(--text2)",fontWeight:b.fineAmount>0?700:400 }}>
                    ₹{b.fineAmount?.toFixed(0)||0}{b.finePaid&&<span style={{ color:"var(--teal2)",fontSize:10,marginLeft:4 }}>✓paid</span>}
                  </td>
                  <td><StatusBadge status={b.status}/></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* ════ TAB: FINES MANAGEMENT ════ */}
      {tab==="fines" && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:6 }}>Fine Management</h3>
          <p style={{ fontSize:13,color:"var(--text2)",marginBottom:20 }}>₹{FINE_PER_DAY}/day overdue. Members with ≥₹{FINE_BLOCK_LIMIT} total fines are auto-blocked.</p>
          {fineMembers.length===0 ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:12 }}>✅</div><p>No outstanding fines</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Member</th><th>Email</th><th>Total Fine</th><th>Account Status</th><th>Action</th></tr></thead>
                <tbody>
                  {fineMembers.map((m,i)=>(
                    <tr key={i}>
                      <td style={{ fontWeight:600 }}>{m.name}</td>
                      <td style={{ color:"var(--text2)" }}>{m.email}</td>
                      <td style={{ color:"#F87171",fontWeight:800,fontSize:16 }}>₹{m.total.toFixed(0)}</td>
                      <td>
                        {m.total>=FINE_BLOCK_LIMIT
                          ? <span className="badge badge-blocked">🔒 BLOCKED</span>
                          : <span className="badge badge-pending">Active</span>}
                      </td>
                      <td>
                        <button className="btn-success" onClick={()=>payFine(m.memberId,m.name)}>
                          💳 Mark Paid & Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5F. MEMBER SUBSCRIPTION PAGE  (Member only)
//     Shows Standard and Pro plan cards.
//     Member clicks Subscribe → POST /api/subscriptions/subscribe.
//     Shows subscription history at the bottom.
// ═══════════════════════════════════════════════════════════════════════════
function MemberSubscriptionPage({ user }) {
  const [plans,   setPlans]   = useState([]);
  const [mySub,   setMySub]   = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg,     setMsg]     = useState({ text:"", type:"" });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [p,s,h] = await Promise.allSettled([
        fetch(`${API}/subscriptions/plans`,             { headers:authHeaders() }),
        fetch(`${API}/subscriptions/my/${user.id}`,     { headers:authHeaders() }),
        fetch(`${API}/subscriptions/history/${user.id}`,{ headers:authHeaders() }),
      ]);
      if(p.status==="fulfilled"&&p.value.ok) setPlans(await p.value.json());
      if(s.status==="fulfilled"&&s.value.ok) setMySub(await s.value.json());
      if(h.status==="fulfilled"&&h.value.ok) setHistory(await h.value.json());
    } catch {} finally { setLoading(false); }
  };
  useEffect(()=>{fetchAll();},[]);

  const subscribe = async (planId) => {
    try {
      const r = await fetch(`${API}/subscriptions/subscribe`,{method:"POST",headers:authHeaders(),body:JSON.stringify({memberId:user.id,planId})});
      const txt = await r.text();
      if(r.ok) { setMsg({text:"✅ "+txt,type:"success"}); fetchAll(); }
      else if(txt.startsWith("ALREADY_SUBSCRIBED")) setMsg({text:`❌ You already have an active ${txt.split(":")[1]} subscription.`,type:"error"});
      else setMsg({text:"❌ "+txt,type:"error"});
    } catch { setMsg({text:"❌ Network error",type:"error"}); }
    setTimeout(()=>setMsg({text:"",type:""}),4000);
  };

  const isSubActive = mySub && mySub.status !== "NONE" && mySub.status !== "EXPIRED";
  const daysLeft    = isSubActive ? Math.max(0,Math.ceil((new Date(mySub.expiresAt)-new Date())/(1000*60*60*24))) : 0;

  return (
    <div>
      <div className="page-header"><h1>Subscription</h1><p>Choose a plan to start borrowing books from the library</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:20 }}>{msg.text}</div>}

      {/* Active subscription banner */}
      {isSubActive && (
        <div className="card card-glow" style={{ marginBottom:28,background:"linear-gradient(135deg,rgba(13,148,136,0.10),rgba(232,160,32,0.08))" }}>
          <div style={{ display:"flex",alignItems:"center",gap:20 }}>
            <div style={{ fontSize:48 }}>🎫</div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,marginBottom:4 }}>{mySub.planName} — Active</div>
              <div style={{ display:"flex",gap:20,flexWrap:"wrap" }}>
                <span style={{ fontSize:13,color:"var(--text2)" }}>📚 Max books: <strong style={{ color:"var(--amber)" }}>{mySub.maxBooks>=999?"Unlimited":mySub.maxBooks}</strong></span>
                <span style={{ fontSize:13,color:"var(--text2)" }}>📅 Expires: <strong style={{ color:"var(--teal2)" }}>{new Date(mySub.expiresAt).toLocaleDateString()}</strong></span>
                <span style={{ fontSize:13,color:"var(--text2)" }}>⏳ Days left: <strong style={{ color:daysLeft<=5?"#F87171":"var(--amber)" }}>{daysLeft}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isSubActive && <div className="msg-warn" style={{ marginBottom:24 }}>⚠️ No active subscription — subscribe below to start borrowing books</div>}

      {/* Plan cards */}
      {loading ? <div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>
        : <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:32 }}>
          {plans.map((plan,i) => {
            const isPro    = plan.planType==="PRO";
            const isCurrent = isSubActive && mySub.planType===plan.planType;
            return (
              <div key={i} className="card" style={{ position:"relative",border:isPro?"2px solid var(--amber)":"1.5px solid var(--border)",background:isPro?"linear-gradient(135deg,rgba(232,160,32,0.08),rgba(13,148,136,0.05))":"var(--surface2)" }}>
                {isPro && <div style={{ position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,var(--amber),var(--amber2))",color:"#0D0E14",fontSize:11,fontWeight:800,padding:"3px 16px",borderRadius:20,whiteSpace:"nowrap" }}>⭐ MOST POPULAR</div>}
                <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,marginBottom:6 }}>{plan.planName}</div>
                <div style={{ fontSize:38,fontWeight:800,color:"var(--amber)",marginBottom:4 }}>₹{plan.price}<span style={{ fontSize:14,color:"var(--text2)",fontWeight:400 }}>/{plan.durationDays}d</span></div>
                <div style={{ fontSize:13,color:"var(--text2)",marginBottom:20,lineHeight:1.6 }}>{plan.description}</div>
                <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:24 }}>
                  {[
                    `Borrow up to ${plan.maxBooks>=999?"Unlimited":plan.maxBooks} books`,
                    `Valid for ${plan.durationDays} days`,
                    "Access to all library books",
                  ].map((f,j) => (
                    <div key={j} style={{ display:"flex",alignItems:"center",gap:8,fontSize:14 }}>
                      <span style={{ color:"var(--teal2)",fontWeight:700 }}>✓</span><span>{f}</span>
                    </div>
                  ))}
                </div>
                {isCurrent
                  ? <div style={{ textAlign:"center",padding:"12px",background:"rgba(13,148,136,0.12)",border:"1.5px solid rgba(13,148,136,0.25)",borderRadius:10,color:"var(--teal2)",fontWeight:700 }}>✅ Current Plan</div>
                  : <button className={isPro?"btn-primary":"btn-teal"} onClick={()=>subscribe(plan.id)} style={{ width:"100%",fontSize:15 }}>Subscribe for ₹{plan.price}</button>
                }
              </div>
            );
          })}
        </div>
      }

      {/* Subscription history table */}
      {history.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Subscription History</h3>
          <div className="table-wrap"><table>
            <thead><tr><th>Plan</th><th>Amount</th><th>Start Date</th><th>Expiry</th><th>Status</th></tr></thead>
            <tbody>
              {history.map((h,i)=>(
                <tr key={i}>
                  <td style={{ fontWeight:600 }}>{h.planName}</td>
                  <td style={{ color:"var(--amber)",fontWeight:700 }}>₹{h.amountPaid}</td>
                  <td style={{ color:"var(--text2)" }}>{h.subscribedAt?new Date(h.subscribedAt).toLocaleDateString():"—"}</td>
                  <td style={{ color:"var(--text2)" }}>{h.expiresAt?new Date(h.expiresAt).toLocaleDateString():"—"}</td>
                  <td><StatusBadge status={h.status}/></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5G. ADMIN SUBSCRIPTION MANAGER  (Admin only)
//     Admin edits plan settings (price, duration, max books).
//     Also shows a table of all member subscriptions.
// ═══════════════════════════════════════════════════════════════════════════
function AdminSubscriptionManager() {
  const [plans,    setPlans]   = useState([]);
  const [allSubs,  setAllSubs] = useState([]);
  const [editPlan, setEditPlan]= useState(null); // plan currently being edited
  const [msg,      setMsg]     = useState({ text:"", type:"" });

  const fetchAll = async () => {
    try {
      const [p,s] = await Promise.allSettled([
        fetch(`${API}/subscriptions/plans`,{ headers:authHeaders() }),
        fetch(`${API}/subscriptions/all`,  { headers:authHeaders() }),
      ]);
      if(p.status==="fulfilled"&&p.value.ok) setPlans(await p.value.json());
      if(s.status==="fulfilled"&&s.value.ok) setAllSubs(await s.value.json());
    } catch {}
  };
  useEffect(()=>{fetchAll();},[]);

  const savePlan = async () => {
    try {
      const r = await fetch(`${API}/subscriptions/plans/${editPlan.id}`,{method:"PUT",headers:authHeaders(),body:JSON.stringify(editPlan)});
      if(r.ok){setMsg({text:"✅ Plan updated!",type:"success"});setEditPlan(null);fetchAll();}
      else setMsg({text:"❌ Failed to update",type:"error"});
    } catch { setMsg({text:"❌ Network error",type:"error"}); }
    setTimeout(()=>setMsg({text:"",type:""}),3000);
  };

  return (
    <div>
      <div className="page-header"><h1>Subscription Management</h1><p>Configure Standard and Pro plan pricing and limits — only Admin can change these</p></div>
      {msg.text && <div className={msg.type==="success"?"msg-success":"msg-error"} style={{ marginBottom:16 }}>{msg.text}</div>}

      {/* Plan editor cards */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:32 }}>
        {plans.map((plan,i)=>(
          <div key={i} className="card card-glow">
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700 }}>{plan.planName}</div>
              <span className={`tag ${plan.planType==="PRO"?"tag-admin":"tag-librarian"}`}>{plan.planType}</span>
            </div>
            {editPlan?.id===plan.id ? (
              // ── Edit mode — shows inputs for each editable field ──
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div className="form-group"><label>Plan Name</label><input value={editPlan.planName} onChange={e=>setEditPlan({...editPlan,planName:e.target.value})}/></div>
                <div className="form-group"><label>Price (₹)</label><input type="number" value={editPlan.price} onChange={e=>setEditPlan({...editPlan,price:parseFloat(e.target.value)})}/></div>
                <div className="form-group"><label>Duration (Days)</label><input type="number" value={editPlan.durationDays} onChange={e=>setEditPlan({...editPlan,durationDays:parseInt(e.target.value)})}/></div>
                <div className="form-group"><label>Max Books (999 = Unlimited)</label><input type="number" value={editPlan.maxBooks} onChange={e=>setEditPlan({...editPlan,maxBooks:parseInt(e.target.value)})}/></div>
                <div className="form-group"><label>Description</label><input value={editPlan.description} onChange={e=>setEditPlan({...editPlan,description:e.target.value})}/></div>
                <div style={{ display:"flex",gap:8,marginTop:4 }}>
                  <button className="btn-primary" onClick={savePlan}>💾 Save Changes</button>
                  <button className="btn-ghost"   onClick={()=>setEditPlan(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              // ── View mode ──
              <div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
                  {[{l:"Price",v:`₹${plan.price}`},{l:"Duration",v:`${plan.durationDays} days`},{l:"Max Books",v:plan.maxBooks>=999?"Unlimited":plan.maxBooks}].map((r,j)=>(
                    <div key={j} style={{ background:"var(--surface)",borderRadius:8,padding:"10px 12px" }}>
                      <div style={{ fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:3,fontWeight:700 }}>{r.l}</div>
                      <div style={{ fontSize:15,fontWeight:600,color:"var(--amber)" }}>{r.v}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize:12,color:"var(--text2)",marginBottom:14 }}>{plan.description}</p>
                <button className="btn-ghost" onClick={()=>setEditPlan({...plan})} style={{ width:"100%" }}>✏️ Edit Plan Settings</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* All member subscriptions table */}
      <div className="card">
        <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>All Member Subscriptions</h3>
        {allSubs.length===0
          ? <div style={{ textAlign:"center",padding:48,color:"var(--text2)" }}><div style={{ fontSize:44,marginBottom:12 }}>🎫</div><p>No subscriptions yet</p></div>
          : <div className="table-wrap"><table>
              <thead><tr><th>Member</th><th>Plan</th><th>Amount</th><th>Start</th><th>Expiry</th><th>Status</th></tr></thead>
              <tbody>
                {allSubs.map((s,i)=>(
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{s.memberName}</td>
                    <td><span className={`tag ${s.planType==="PRO"?"tag-admin":"tag-librarian"}`}>{s.planType}</span></td>
                    <td style={{ color:"var(--amber)",fontWeight:700 }}>₹{s.amountPaid}</td>
                    <td style={{ color:"var(--text2)" }}>{s.subscribedAt?new Date(s.subscribedAt).toLocaleDateString():"—"}</td>
                    <td style={{ color:"var(--text2)" }}>{s.expiresAt?new Date(s.expiresAt).toLocaleDateString():"—"}</td>
                    <td><StatusBadge status={s.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6 — ROLE DASHBOARDS
// One dashboard component per user role.
// Each renders the Sidebar + main content area with role-appropriate tabs.
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// 6A. ADMIN DASHBOARD
//     The most powerful role. Can access:
//       - Book Management (add/edit/delete books)
//       - Reservations (approve/reject unavailable-book waitlist)
//       - Manage Borrowings (approve borrow requests, mark returns, fines)
//       - Subscription Management (set plan price, duration, limits)
//       - Pending Approvals (approve new Librarian accounts)
//       - All Users (view every registered account)
//       - My Profile (change password)
// ═══════════════════════════════════════════════════════════════════════════
function AdminDashboard({ user, onLogout }) {
  const [activeTab,      setActiveTab]      = useState("home");
  const [pendingUsers,   setPendingUsers]   = useState([]); // librarians awaiting approval
  const [allUsers,       setAllUsers]       = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingAll,     setLoadingAll]     = useState(false);
  const [actionMsg,      setActionMsg]      = useState("");

  // Live book stats from the custom hook (fetches /api/books)
  const bs = useBookStats();

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const r = await fetch(`${API}/admin/pending-users`);
      if (r.ok) setPendingUsers(await r.json());
    } catch {} finally { setLoadingPending(false); }
  };

  const fetchAllUsers = async () => {
    setLoadingAll(true);
    try {
      const r = await fetch(`${API}/admin/all-users`);
      if (r.ok) setAllUsers(await r.json());
    } catch {} finally { setLoadingAll(false); }
  };

  // Refetch relevant data whenever the active tab changes
  useEffect(() => {
    if (activeTab === "home")    { fetchPending(); fetchAllUsers(); }
    if (activeTab === "pending") fetchPending();
    if (activeTab === "users")   fetchAllUsers();
  }, [activeTab]);

  const approveUser = async (email) => {
    try {
      const r = await fetch(`${API}/admin/approve?email=${encodeURIComponent(email)}`, { method:"POST" });
      setActionMsg("✅ " + await r.text());
      fetchPending(); fetchAllUsers(); // refresh both lists
    } catch { setActionMsg("❌ Failed."); }
  };

  // navItems — the sidebar links for this role
  // badge: shows a red number on "Pending Approvals" when librarians are waiting
  const navItems = [
    { id:"home",          icon:"🏠", label:"Dashboard"          },
    { id:"books",         icon:"📖", label:"Book Management"    },
    { id:"reservations",  icon:"📌", label:"Reservations"       },  // unavailable book waitlist
    { id:"borrowings",    icon:"📦", label:"Manage Borrows"     },  // borrow requests, returns, fines
    { id:"subscriptions", icon:"🎫", label:"Subscriptions"      },  // ADMIN ONLY — plan editor
    { id:"pending",       icon:"⏳", label:"Pending Approvals", badge:pendingUsers.length },
    { id:"users",         icon:"👥", label:"All Users"          },
    { id:"profile",       icon:"👤", label:"My Profile"         },
  ];

  const STATS = [
    { icon:"📚", num:bs.total,                                          label:"Total Books",  c:"var(--amber)"  },
    { icon:"✅", num:bs.available,                                       label:"Available",    c:"var(--teal2)"  },
    { icon:"❌", num:bs.unavailable,                                     label:"Unavailable",  c:"#F87171"       },
    { icon:"👥", num:allUsers.length,                                    label:"Total Users",  c:"#818CF8"       },
    { icon:"⏳", num:pendingUsers.length,                                 label:"Pending",      c:"var(--amber2)" },
    { icon:"📖", num:allUsers.filter(u=>u.role==="LIBRARIAN").length,   label:"Librarians",   c:"var(--teal2)"  },
  ];

  return (
    <div className="app-layout">  {/* flex row: sidebar left, main right */}
      <Sidebar
        subtitle="Admin Panel"
        navItems={navItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        roleLabel="Admin"
        onLogout={onLogout}
      />

      <main className="main-content">
        {/* BookManagement takes its own full-width layout (no .main-padded) */}
        {activeTab === "books" && <BookManagement userRole="ADMIN"/>}

        {/* All other tabs get standard inner padding */}
        {activeTab !== "books" && (
          <div className="main-padded">

            {/* ── HOME TAB ── */}
            {activeTab === "home" && (
              <div className="fade-up">
                <div className="page-header">
                  <h1>Welcome back, {user.name?.split(" ")[0]}! 👋</h1>
                  <p>Here's your complete library system overview</p>
                </div>

                {/* Live stats grid */}
                <div className="stats-grid">
                  {STATS.map((s,i) => (
                    <div className="stat-card" key={i}>
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-num" style={{ color:s.c }}>{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Quick action tiles — clicking navigates to that tab */}
                <div className="card">
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Quick Actions</h3>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
                    {[
                      { icon:"📖", label:"Manage Books",    c:"rgba(232,160,32,0.15)", t:"books"         },
                      { icon:"📌", label:"Reservations",    c:"rgba(13,148,136,0.15)", t:"reservations"  },
                      { icon:"📦", label:"Manage Borrows",  c:"rgba(79,70,229,0.15)",  t:"borrowings"    },
                      { icon:"🎫", label:"Subscriptions",   c:"rgba(232,160,32,0.15)", t:"subscriptions" },
                      { icon:"⏳", label:"Pending Approvals",c:"rgba(245,158,11,0.15)",t:"pending"       },
                      { icon:"👥", label:"All Users",       c:"rgba(79,70,229,0.15)",  t:"users"         },
                    ].map((a,i) => (
                      <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}>
                        <div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div>
                        <div style={{ fontWeight:600,fontSize:14 }}>{a.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reservations"  && <ManageReservations/>}
            {activeTab === "borrowings"    && <ManageBorrowings userRole="ADMIN"/>}
            {activeTab === "subscriptions" && <AdminSubscriptionManager/>}

            {/* ── PENDING APPROVALS TAB ── */}
            {activeTab === "pending" && (
              <div className="fade-up">
                <div className="page-header"><h1>Pending Approvals</h1><p>Review and approve new Librarian accounts</p></div>
                {actionMsg && <div className="msg-success" style={{ marginBottom:16 }}>{actionMsg}</div>}
                <div className="card">
                  {loadingPending ? <div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>
                    : pendingUsers.length===0
                      ? <div style={{ textAlign:"center",padding:60,color:"var(--text2)" }}><div style={{ fontSize:48,marginBottom:14 }}>✅</div><p>No pending approvals</p></div>
                      : <div className="table-wrap"><table>
                          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                          <tbody>
                            {pendingUsers.map((u,i) => (
                              <tr key={i}>
                                <td style={{ fontWeight:600 }}>{u.name}</td>
                                <td style={{ color:"var(--text2)" }}>{u.email}</td>
                                <td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                                <td><button className="btn-success" onClick={()=>approveUser(u.email)}>✅ Approve</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  }
                </div>
              </div>
            )}

            {/* ── ALL USERS TAB ── */}
            {activeTab === "users" && (
              <div className="fade-up">
                <div className="page-header"><h1>All Users</h1><p>Every registered account in the system</p></div>
                <div className="card">
                  {loadingAll ? <div style={{ textAlign:"center",padding:48 }}><Spinner size={28}/></div>
                    : <div className="table-wrap"><table>
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Approved</th></tr></thead>
                        <tbody>
                          {allUsers.map((u,i) => (
                            <tr key={i}>
                              <td style={{ fontWeight:600 }}>{u.name}</td>
                              <td style={{ color:"var(--text2)" }}>{u.email}</td>
                              <td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                              <td><span className={`tag ${u.verified?"tag-verified":"tag-pending"}`}>{u.verified?"Yes":"No"}</span></td>
                              <td><span className={`tag ${u.approved?"tag-verified":"tag-pending"}`}>{u.approved?"Yes":"No"}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  }
                </div>
              </div>
            )}

            {activeTab === "profile" && <ProfilePanel user={user}/>}
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6B. LIBRARIAN DASHBOARD
//     Access:
//       - Book Management (add/edit/delete books)
//       - Reservations (approve/reject waitlist)
//       - Manage Borrowings (approve borrow requests, returns, fines, unblock)
//       - My Profile
//     Does NOT have: Subscription editor, User management
// ═══════════════════════════════════════════════════════════════════════════
function LibrarianDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const bs = useBookStats();

  const navItems = [
    { id:"home",         icon:"🏠", label:"Dashboard"      },
    { id:"books",        icon:"📖", label:"Manage Books"   },
    { id:"reservations", icon:"📌", label:"Reservations"   },
    { id:"borrowings",   icon:"📦", label:"Manage Borrows" },
    { id:"profile",      icon:"👤", label:"My Profile"     },
  ];

  const STATS = [
    { icon:"📚", num:bs.total,       label:"Total Books",  c:"var(--amber)"  },
    { icon:"✅", num:bs.available,   label:"Available",    c:"var(--teal2)"  },
    { icon:"❌", num:bs.unavailable, label:"Unavailable",  c:"#F87171"       },
  ];

  return (
    <div className="app-layout">
      <Sidebar subtitle="Librarian Panel" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Librarian" onLogout={onLogout}/>
      <main className="main-content">
        {activeTab === "books" && <BookManagement userRole="LIBRARIAN"/>}
        {activeTab !== "books" && (
          <div className="main-padded">
            {activeTab === "home" && (
              <div className="fade-up">
                <div className="page-header"><h1>Librarian Dashboard</h1><p>Manage the collection and handle member requests</p></div>
                <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
                <div className="card">
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Quick Actions</h3>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
                    {[
                      {icon:"📖",label:"Manage Books",   c:"rgba(232,160,32,0.15)",t:"books"},
                      {icon:"📌",label:"Reservations",   c:"rgba(13,148,136,0.15)",t:"reservations"},
                      {icon:"📦",label:"Manage Borrows", c:"rgba(79,70,229,0.15)", t:"borrowings"},
                    ].map((a,i)=>(
                      <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}>
                        <div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div>
                        <div style={{ fontWeight:600,fontSize:14 }}>{a.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "reservations" && <ManageReservations/>}
            {activeTab === "borrowings"   && <ManageBorrowings userRole="LIBRARIAN"/>}
            {activeTab === "profile"      && <ProfilePanel user={user}/>}
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 6C. MEMBER DASHBOARD
//     The most restricted role. Can access:
//       - Browse Books (read-only view of all books via BookManagement)
//       - Borrow Books (select 1-3 available books, submit request)
//       - Reserve Books (request unavailable books — waitlist)
//       - Subscription (buy Standard or Pro plan)
//       - My Profile (change password)
// ═══════════════════════════════════════════════════════════════════════════
function MemberDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const bs = useBookStats();

  const navItems = [
    { id:"home",         icon:"🏠", label:"Dashboard"     },
    { id:"browse",       icon:"🔍", label:"Browse Books"  },
    { id:"borrow",       icon:"📦", label:"Borrow Books"  },  // select + request available books
    { id:"reservations", icon:"📌", label:"Reserve Books" },  // waitlist for unavailable books
    { id:"subscription", icon:"🎫", label:"Subscription"  },  // Standard / Pro plans
    { id:"profile",      icon:"👤", label:"My Profile"    },
  ];

  const STATS = [
    { icon:"📚", num:bs.total,       label:"Total Books",   c:"var(--amber)"  },
    { icon:"✅", num:bs.available,   label:"Available Now", c:"var(--teal2)"  },
    { icon:"❌", num:bs.unavailable, label:"Unavailable",   c:"#F87171"       },
  ];

  return (
    <div className="app-layout">
      <Sidebar subtitle="Member Portal" navItems={navItems} activeTab={activeTab} setActiveTab={setActiveTab} user={user} roleLabel="Member" onLogout={onLogout}/>
      <main className="main-content">
        {activeTab === "browse" && <BookManagement userRole="MEMBER"/>}
        {activeTab !== "browse" && (
          <div className="main-padded">
            {activeTab === "home" && (
              <div className="fade-up">
                {/* Personalised welcome banner */}
                <div style={{ background:"linear-gradient(135deg,rgba(232,160,32,0.12) 0%,rgba(13,148,136,0.10) 50%,rgba(79,70,229,0.08) 100%)",border:"1.5px solid var(--border2)",borderRadius:20,padding:"28px 32px",marginBottom:28,display:"flex",alignItems:"center",gap:20 }}>
                  <div className="avatar" style={{ width:66,height:66,fontSize:26,borderRadius:18 }}>{user.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,marginBottom:4 }}>Hello, {user.name?.split(" ")[0]}! 📚</h2>
                    <p style={{ fontSize:13,color:"var(--text2)" }}>{user.email}</p>
                    <div style={{ marginTop:10,display:"flex",gap:8 }}>
                      <span className="tag tag-member">Member</span>
                      <span className="tag tag-verified">✓ Verified</span>
                    </div>
                  </div>
                </div>
                <div className="stats-grid">{STATS.map((s,i)=><div className="stat-card" key={i}><div className="stat-icon">{s.icon}</div><div className="stat-num" style={{ color:s.c }}>{s.num}</div><div className="stat-label">{s.label}</div></div>)}</div>
                <div className="card">
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,marginBottom:18 }}>Quick Actions</h3>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12 }}>
                    {[
                      {icon:"🔍",label:"Browse Books",   c:"rgba(232,160,32,0.15)",t:"browse"},
                      {icon:"📦",label:"Borrow Books",   c:"rgba(13,148,136,0.15)",t:"borrow"},
                      {icon:"📌",label:"Reserve a Book", c:"rgba(79,70,229,0.15)", t:"reservations"},
                      {icon:"🎫",label:"Subscription",   c:"rgba(232,160,32,0.15)",t:"subscription"},
                    ].map((a,i)=>(
                      <div key={i} className="action-card" onClick={()=>setActiveTab(a.t)}>
                        <div className="action-card-icon" style={{ background:a.c }}>{a.icon}</div>
                        <div style={{ fontWeight:600,fontSize:14 }}>{a.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "borrow"       && <BorrowBooks user={user}/>}
            {activeTab === "reservations" && <MemberReservations user={user}/>}
            {activeTab === "subscription" && <MemberSubscriptionPage user={user}/>}
            {activeTab === "profile"      && <ProfilePanel user={user}/>}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7 — ROOT APP COMPONENT
//
// This is the ONLY component exported. It:
//   1. Holds `page` state (which auth page to show when not logged in)
//   2. Holds `user` state (the logged-in user object, or null)
//   3. Holds `dark` state (theme toggle)
//   4. Provides ThemeContext to all children
//   5. Renders GlobalStyle (injects all CSS)
//   6. Routes to the right page/dashboard based on state
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {

  // Which public page to show (only when not logged in)
  const [page, setPage] = useState("landing");

  // The logged-in user object ({ id, name, email, role, token, ... })
  // Initialised from sessionStorage so browser refresh doesn't log the user out
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("libraryUser")); }
    catch { return null; }
  });

  // Dark mode state — initialised from localStorage
  const [dark, setDark] = useState(() => localStorage.getItem("theme") !== "light");
  const toggleTheme = () => setDark(d => {
    const next = !d;
    localStorage.setItem("theme", next ? "dark" : "light");
    return next;
  });

  // Called by LoginPage after successful /api/auth/login
  const onLogin = (u) => {
    setUser(u);
    sessionStorage.setItem("libraryUser", JSON.stringify(u)); // persist across refresh
  };

  // Called by Sidebar "Sign Out" button
  const onLogout = () => {
    setUser(null);
    localStorage.removeItem("token");          // clear JWT
    sessionStorage.removeItem("libraryUser");  // clear user cache
    setPage("landing");                        // return to landing page
  };

  return (
    // ThemeContext.Provider makes { dark, toggle } available to every component
    // via useTheme() — no prop drilling needed
    <ThemeContext.Provider value={{ dark, toggle:toggleTheme }}>

      {/* GlobalStyle receives `dark` to inject the correct CSS variables */}
      <GlobalStyle dark={dark}/>

      {/* ── ROUTING LOGIC ── */}
      {user ? (
        // ── Logged in: show the dashboard for the user's role ──
        user.role === "ADMIN"     ? <AdminDashboard     user={user} onLogout={onLogout}/> :
        user.role === "LIBRARIAN" ? <LibrarianDashboard user={user} onLogout={onLogout}/> :
                                    <MemberDashboard    user={user} onLogout={onLogout}/>
        // Any unknown role falls through to MemberDashboard (safe default)
      ) : (
        // ── Not logged in: show the auth page matching `page` state ──
        // navigate is just setPage — no router library needed
        <>
          {page === "landing"  && <LandingPage  navigate={setPage}/>}
          {page === "register" && <RegisterPage navigate={setPage}/>}
          {page === "login"    && <LoginPage    navigate={setPage} onLogin={onLogin}/>}
          {page === "otp"      && <OtpPage      navigate={setPage}/>}
        </>
      )}
    </ThemeContext.Provider>
  );
}