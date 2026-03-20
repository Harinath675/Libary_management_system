// // =============================================================================
// // FILE: src/LibraryApp.jsx  —  SINGLE FILE VERSION (all features)
// // =============================================================================
// // HOW TO USE:
// //   1. Place this file at: library-frontend/src/LibraryApp.jsx
// //   2. Keep BookManagement.jsx in: library-frontend/src/components/
// //   3. In main.jsx: import App from './LibraryApp'
// //   4. Start: npm run dev
// //
// // SECTIONS IN THIS FILE (use Ctrl+F to jump):
// //   SECTION 1 — Imports
// //   SECTION 2 — Constants & Helpers  (API, authHeaders, fine settings)
// //   SECTION 3 — Theme Context        (dark/light, ThemeProvider, useTheme)
// //   SECTION 4 — Global CSS           (all styles injected as <style>)
// //   SECTION 5 — Shared UI            (Spinner, StatusBadge, Sidebar, useBookStats)
// //   SECTION 6 — Auth Pages           (Landing, Register, OTP, Login)
// //   SECTION 7 — Shared Features      (Profile, Reservations, Borrowings, Subscriptions)
// //   SECTION 8 — Member Features      (BorrowBooks)
// //   SECTION 9 — Dashboards           (Admin, Librarian, Member)
// //   SECTION 10 — Root App            (routing logic)
// // =============================================================================

// // ── SECTION 1: IMPORTS ───────────────────────────────────────────────────────
// // These are the ONLY external imports needed.
// // Everything else in this file is self-contained.
// import { useState, useEffect, createContext, useContext } from 'react';
// // useState    — local component state (form values, loading flags, data arrays)
// // useEffect   — run code when component mounts or when dependencies change
// // createContext — creates a 'pipe' to share data without prop drilling
// // useContext  — reads from a context pipe
// import BookManagement from './components/BookManagement';
// // BookManagement — existing component, handles book CRUD with image/PDF upload


// // ═══════════════════════════════════════════════════════════════════════════
// // CONSTANTS
// // ═══════════════════════════════════════════════════════════════════════════

// // =============================================================================
// // FILE: src/constants.js
// // PURPOSE: Single source of truth for ALL constants used across the app.
// //
// // WHY THIS FILE EXISTS:
// //   Instead of writing "http://localhost:8080/api" in 20 different files,
// //   we write it once here. If the backend URL ever changes, we change
// //   exactly ONE line and every file updates automatically.
// //
// // HOW TO USE IN OTHER FILES:
// //   import { API, authHeaders, FINE_PER_DAY } from '../constants'
// // =============================================================================

// // ── BACKEND API BASE URL ──────────────────────────────────────────────────────
// // This is where ALL API calls are sent.
// // Change this if backend runs on a different port or server.
// export const API = "http://localhost:8080/api";

// // ── FINE SYSTEM SETTINGS ─────────────────────────────────────────────────────
// // Fine charged per day when a book is returned AFTER its due date
// export const FINE_PER_DAY = 10;         // ₹10 per overdue day

// // When a member's total UNPAID fines reach this amount, their account is blocked
// // Backend enforces this automatically when a book is returned
// export const FINE_BLOCK_LIMIT = 500;    // ₹500 = account blocked

// // ── BORROW LIMITS ─────────────────────────────────────────────────────────────
// // A member can select AT MOST this many books in a single borrow request
// export const MAX_BORROW_AT_ONCE = 3;

// // ── SUBSCRIPTION PLAN IDENTIFIERS ────────────────────────────────────────────
// // These must match exactly what the backend enum says
// export const PLAN_STANDARD = "STANDARD";   // max 6 books
// export const PLAN_PRO      = "PRO";        // unlimited books

// // ── AUTH HEADERS HELPER ───────────────────────────────────────────────────────
// // WHAT THIS DOES:
// //   Reads the JWT token from localStorage and builds the Authorization header.
// //   Every protected API call needs this header, otherwise backend returns 403.
// //
// // HOW JWT WORKS IN THIS APP:
// //   1. User logs in → backend gives us a token string
// //   2. We store it: localStorage.setItem("token", token)
// //   3. Every API call includes: { Authorization: "Bearer <token>" }
// //   4. Backend reads the token, verifies it, knows who is calling
// //
// // USAGE:
// //   fetch(`${API}/books`, { headers: authHeaders() })
// //   fetch(`${API}/admin/users`, { method: "POST", headers: authHeaders(), body: ... })
// function authHeaders() {
//   const token = localStorage.getItem("token");  // get saved JWT from browser storage
//   return {
//     "Content-Type": "application/json",          // always tell backend we're sending JSON
//     ...(token ? { Authorization: `Bearer ${token}` } : {})  // add auth if token exists
//     // The spread (...) means: if token exists, add the Authorization key; otherwise add nothing
//   };
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // THEMECONTEXT
// // ═══════════════════════════════════════════════════════════════════════════

// // =============================================================================
// // FILE: src/context/ThemeContext.jsx
// // PURPOSE: Manages dark/light theme state for the ENTIRE application.
// //
// // WHY "CONTEXT" INSTEAD OF PROPS?
// //   Without context, every component that needs dark/toggle would need it
// //   passed as a prop through every parent:
// //     App → AdminDashboard → Sidebar → ThemeToggle  (3 levels of props)
// //
// //   With context, ANY component at ANY depth can just call useTheme()
// //   and get dark + toggle directly. No prop drilling needed.
// //
// // HOW REACT CONTEXT WORKS:
// //   1. createContext() creates the "pipe"
// //   2. <ThemeContext.Provider value={...}> fills the pipe with data
// //   3. useContext(ThemeContext) reads from the pipe anywhere in the tree
// //   4. useTheme() is just a convenience wrapper around useContext()
// // =============================================================================


// // ── STEP 1: Create the context ────────────────────────────────────────────────
// // createContext() sets up the "pipe" with default values.
// // These defaults only apply if a component uses ThemeContext OUTSIDE a Provider
// // (which shouldn't happen in normal usage — just a safety net).
// export const ThemeContext = createContext({
//   dark:   true,       // default: start in dark mode
//   toggle: () => {},   // default: empty function (will be replaced by Provider)
// });

// // ── STEP 2: Custom hook for easy consumption ──────────────────────────────────
// // This lets any component do:
// //   const { dark, toggle } = useTheme()
// // Instead of the more verbose:
// //   const { dark, toggle } = useContext(ThemeContext)
// function useTheme() {
//   return useContext(ThemeContext);
// }

// // ── STEP 3: The Provider component ───────────────────────────────────────────
// // This wraps the entire app (in App.jsx).
// // All children inside it can access { dark, toggle } via useTheme().
// //
// // Props:
// //   children — everything inside <ThemeProvider>...</ThemeProvider>
// function ThemeProvider({ children }) {

//   // Read theme from localStorage on FIRST LOAD so the user's choice persists
//   // after a page refresh.
//   //
//   // localStorage.getItem("theme") returns:
//   //   "light" → user previously chose light mode → dark = false
//   //   "dark"  → user previously chose dark mode  → dark = true
//   //   null    → first time visiting               → dark = true (default)
//   const [dark, setDark] = useState(
//     () => localStorage.getItem("theme") !== "light"
//     //     ↑ This is a "lazy initializer" — runs once on first render only
//     //       Returns true for any value that is NOT "light"
//   );

//   // Toggle function: flips dark ↔ light AND saves choice to localStorage
//   const toggle = () => {
//     setDark(prev => {
//       const next = !prev;                                           // flip the boolean
//       localStorage.setItem("theme", next ? "dark" : "light");      // save to browser storage
//       return next;                                                  // update state
//     });
//   };

//   // Provide { dark, toggle } to all child components
//   return (
//     <ThemeContext.Provider value={{ dark, toggle }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // GLOBALSTYLE
// // ═══════════════════════════════════════════════════════════════════════════

// // =============================================================================
// // FILE: src/context/GlobalStyle.jsx
// // PURPOSE: Injects ALL CSS into the page via a <style> tag.
// //
// // WHY NOT A REGULAR .css FILE?
// //   Because the `dark` prop lets us inject DIFFERENT CSS variable values
// //   depending on the theme. A static .css file can't do conditional values
// //   like this — we'd need a CSS-in-JS solution or class switching.
// //
// //   This approach is simple: one component, one style tag, everything in it.
// //
// // CSS SECTIONS (in order):
// //   A. Google Fonts import
// //   B. CSS Custom Properties / Variables (the heart of the theme system)
// //   C. CSS Reset + base element styles
// //   D. Form elements (input, select, textarea)
// //   E. Button variants (.btn-primary, .btn-teal, .btn-ghost, .btn-danger, .btn-success)
// //   F. Card styles (.card, .card-glow)
// //   G. Alert messages (.msg-error, .msg-success, .msg-warn)
// //   H. Page layout helpers (.page-center, .app-layout)
// //   I. Sidebar (.sidebar, .nav-item, .user-chip, .avatar)
// //   J. Main content area (.main-content, .main-padded, .page-header)
// //   K. Stats cards (.stats-grid, .stat-card)
// //   L. Tables (.table-wrap, table, thead, tbody)
// //   M. OTP input boxes (.otp-inputs, .otp-box)
// //   N. Tags (.tag-admin, .tag-librarian, .tag-member, etc.)
// //   O. Status badges (.badge-pending, .badge-approved, etc.)
// //   P. Filter tabs (.filter-tabs, .filter-tab)
// //   Q. Action cards (.action-card)
// //   R. Landing page (.landing, .orb, .hero, .features)
// //   S. Auth card (.auth-card, .auth-icon)
// //   T. Animations (@keyframes)
// // =============================================================================

// function GlobalStyle({ dark }) {
//   // The entire CSS is a JavaScript template literal so we can inject `dark`
//   // as a condition inside the CSS variable block
//   return (
//     <style>{`

//       /* ── A. FONTS ──────────────────────────────────────────────────────────
//          We import two Google Fonts:
//          - Cormorant Garamond: elegant serif used for large headings, hero text,
//            section titles, and large numbers (stat cards)
//          - Outfit: clean modern sans-serif used for everything else (body text,
//            buttons, labels, nav items)
//       ──────────────────────────────────────────────────────────────────────── */
//       @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

//       /* ── B. CSS VARIABLES ──────────────────────────────────────────────────
//          This is the CORE of the theming system.
//          ALL colours throughout the app are defined here as variables.

//          Components NEVER hardcode colours like "color: #F0EDE8".
//          They always use "color: var(--text)" instead.

//          This means: when dark changes, we only need to redefine these
//          variables and EVERY component re-themes instantly.

//          Variables prefixed with --:
//            --bg, --bg2, --bg3          Page background layers
//            --surface, --surface2       Card / panel backgrounds
//            --border, --border2         Border colours
//            --text, --text2, --text3    Text hierarchy (main / muted / placeholder)
//            --glow, --glow2             Ambient glow for focus states and hover
//            --sidebar                   Sidebar background colour

//          Brand colours don't change between themes (they're always the same):
//            --amber, --amber2  Gold/yellow brand colour
//            --teal, --teal2    Teal secondary colour
//            --indigo, --violet Purple for avatar gradients
//            --rose             Red for danger / error states
//       ──────────────────────────────────────────────────────────────────────── */
//       :root {
//         /* Brand accent colours — identical in both dark and light themes */
//         --amber:   #E8A020;
//         --amber2:  #F5C842;
//         --teal:    #0D9488;
//         --teal2:   #14B8A6;
//         --indigo:  #4F46E5;
//         --violet:  #7C3AED;
//         --rose:    #E11D48;

//         /* Theme-dependent variables — injected based on the `dark` prop */
//         ${dark ? `
//         /* ── DARK THEME ── */
//         --bg:       #080B14;                   /* near-black page background */
//         --bg2:      #0E1220;                   /* slightly lighter — used for hover backgrounds */
//         --bg3:      #141928;                   /* even lighter — nested card backgrounds */
//         --surface:  rgba(255,255,255,0.04);    /* very faint white overlay for subtle panels */
//         --surface2: rgba(255,255,255,0.07);    /* slightly stronger — card backgrounds */
//         --border:   rgba(255,255,255,0.09);    /* subtle white border */
//         --border2:  rgba(232,160,32,0.28);     /* amber-tinted border for highlighted cards */
//         --text:     #F0EDE8;                   /* warm off-white — main text */
//         --text2:    #A0A8B8;                   /* medium grey — secondary/supporting text */
//         --text3:    #606880;                   /* dark grey — labels, placeholders */
//         --glow:     rgba(232,160,32,0.16);     /* amber glow for focus rings and hover effects */
//         --glow2:    rgba(13,148,136,0.12);     /* teal glow for teal-accented elements */
//         --sidebar:  #0C0F1C;                   /* sidebar panel — slightly different from --bg */
//         ` : `
//         /* ── LIGHT THEME ── */
//         --bg:       #F0F2F8;
//         --bg2:      #E6E9F2;
//         --bg3:      #DDE2EE;
//         --surface:  rgba(255,255,255,0.75);
//         --surface2: rgba(255,255,255,0.95);
//         --border:   rgba(79,70,229,0.12);
//         --border2:  rgba(232,160,32,0.32);
//         --text:     #12152A;
//         --text2:    #4A5075;
//         --text3:    #8892A8;
//         --glow:     rgba(232,160,32,0.10);
//         --glow2:    rgba(13,148,136,0.08);
//         --sidebar:  #FFFFFF;
//         `}
//       }

//       /* ── C. RESET + BASE ───────────────────────────────────────────────────
//          box-sizing: border-box means padding/border are INCLUDED in width/height
//          (prevents the common CSS box-model confusion)

//          transition on background/color gives a smooth fade when theme toggles
//       ──────────────────────────────────────────────────────────────────────── */
//       *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//       html, body, #root {
//         height: 100%;
//         font-family: 'Outfit', sans-serif;
//         background: var(--bg);
//         color: var(--text);
//         transition: background 0.3s, color 0.3s; /* smooth theme transition */
//       }

//       /* Helper class: apply Cormorant Garamond to any element */
//       .serif { font-family: 'Cormorant Garamond', serif; }

//       /* ── D. FORM ELEMENTS ──────────────────────────────────────────────────
//          All inputs share the same base style so the app looks consistent.
//          Focus state adds amber border + soft amber glow ring.
//       ──────────────────────────────────────────────────────────────────────── */
//       input, select, textarea {
//         font-family: 'Outfit', sans-serif;
//         background: var(--surface2);
//         border: 1.5px solid var(--border);
//         color: var(--text);
//         padding: 13px 16px;
//         border-radius: 10px;
//         width: 100%;
//         font-size: 14px;
//         outline: none;                          /* remove ugly default blue outline */
//         transition: border-color 0.2s, box-shadow 0.2s;
//       }
//       input:focus, select:focus {
//         border-color: var(--amber);             /* amber border when focused */
//         box-shadow: 0 0 0 4px var(--glow);      /* soft outer glow ring */
//       }
//       input::placeholder { color: var(--text3); }
//       select option { background: var(--bg2); color: var(--text); }

//       /* ── E. BUTTON VARIANTS ────────────────────────────────────────────────
//          Each button class has a specific visual purpose:

//          .btn-primary  → main CTA (amber gradient) — "Submit", "Create Account"
//          .btn-teal     → positive secondary action (teal gradient) — "Subscribe"
//          .btn-ghost    → neutral/cancel (transparent, subtle border) — "Cancel"
//          .btn-danger   → destructive/negative (red tint) — "Reject", "Delete"
//          .btn-success  → approval/confirmation (green tint) — "Approve", "Mark Returned"

//          ALL buttons get:
//            transition: all 0.22s     → smooth hover animations
//            cursor: pointer           → shows hand cursor
//            font-family: 'Outfit'     → consistent font

//          Disabled state:
//            opacity: 0.45             → faded appearance
//            cursor: not-allowed       → shows "no" cursor
//       ──────────────────────────────────────────────────────────────────────── */
//       button {
//         font-family: 'Outfit', sans-serif;
//         cursor: pointer;
//         border: none;
//         border-radius: 10px;
//         font-weight: 600;
//         font-size: 14px;
//         transition: all 0.22s;
//       }
//       button:disabled { opacity: 0.45; cursor: not-allowed; }

//       .btn-primary {
//         background: linear-gradient(135deg, var(--amber), var(--amber2));
//         color: #0D0E14;                                     /* dark text on gold bg */
//         padding: 13px 28px;
//         box-shadow: 0 4px 18px rgba(232,160,32,0.35);
//       }
//       .btn-primary:hover:not(:disabled) {
//         transform: translateY(-2px);                        /* lift effect */
//         box-shadow: 0 8px 28px rgba(232,160,32,0.50);      /* stronger shadow */
//       }

//       .btn-teal {
//         background: linear-gradient(135deg, var(--teal), var(--teal2));
//         color: #fff;
//         padding: 13px 28px;
//         box-shadow: 0 4px 18px rgba(13,148,136,0.35);
//       }
//       .btn-teal:hover:not(:disabled) {
//         transform: translateY(-2px);
//         box-shadow: 0 8px 28px rgba(13,148,136,0.50);
//       }

//       .btn-ghost {
//         background: var(--surface);
//         border: 1.5px solid var(--border);
//         color: var(--text2);
//         padding: 12px 24px;
//       }
//       .btn-ghost:hover:not(:disabled) {
//         border-color: var(--amber);
//         color: var(--amber);
//         background: var(--glow);
//       }

//       .btn-danger {
//         background: rgba(225,29,72,0.10);
//         border: 1.5px solid rgba(225,29,72,0.30);
//         color: #F87171;
//         padding: 8px 16px;
//       }
//       .btn-danger:hover { background: rgba(225,29,72,0.18); }

//       .btn-success {
//         background: rgba(5,150,105,0.10);
//         border: 1.5px solid rgba(5,150,105,0.30);
//         color: #34D399;
//         padding: 8px 16px;
//       }
//       .btn-success:hover { background: rgba(5,150,105,0.18); }

//       /* ── F. CARDS ──────────────────────────────────────────────────────────
//          .card      — standard content container with subtle shadow
//          .card-glow — highlighted card, amber-tinted border + outer glow
//                       Used for: subscription banner, important info boxes
//       ──────────────────────────────────────────────────────────────────────── */
//       .card {
//         background: var(--surface2);
//         border: 1.5px solid var(--border);
//         border-radius: 18px;
//         padding: 28px;
//         ${dark
//           ? "box-shadow: 0 4px 24px rgba(0,0,0,0.30);"
//           : "box-shadow: 0 2px 16px rgba(79,70,229,0.07);"}
//       }
//       .card-glow {
//         border-color: var(--border2);                       /* amber-tinted border */
//         ${dark
//           ? "box-shadow: 0 0 40px var(--glow), 0 4px 24px rgba(0,0,0,0.3);"
//           : "box-shadow: 0 0 30px var(--glow), 0 2px 16px rgba(79,70,229,0.07);"}
//       }

//       /* ── G. ALERT MESSAGES ─────────────────────────────────────────────────
//          Three variants: error (red), success (green), warn (yellow)
//          Each has a matching background tint, border, and text colour
//       ──────────────────────────────────────────────────────────────────────── */
//       .msg-error   { background: rgba(225,29,72,0.10);  border: 1.5px solid rgba(225,29,72,0.28);  color: #FB7185; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
//       .msg-success { background: rgba(5,150,105,0.10);  border: 1.5px solid rgba(5,150,105,0.28);  color: #34D399; padding: 12px 16px; border-radius: 10px; font-size: 13px; }
//       .msg-warn    { background: rgba(245,158,11,0.10); border: 1.5px solid rgba(245,158,11,0.28); color: #FCD34D; padding: 12px 16px; border-radius: 10px; font-size: 13px; }

//       /* ── H. PAGE LAYOUT ────────────────────────────────────────────────────
//          .page-center — used by auth pages (Login, Register, OTP)
//                         Centers the card vertically and horizontally
//                         Decorative radial gradient backgrounds add depth

//          .app-layout  — dashboard layout: sidebar (left) + main content (right)
//                         Uses flexbox — sidebar has fixed width, main fills rest

//          .form-group  — label + input stacked vertically with consistent gap
//       ──────────────────────────────────────────────────────────────────────── */
//       .page-center {
//         min-height: 100vh;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         padding: 24px;
//         /* Decorative background: 3 overlapping radial gradients */
//         background:
//           radial-gradient(ellipse 60% 50% at 10% 20%, rgba(232,160,32,0.09) 0%, transparent 70%),
//           radial-gradient(ellipse 50% 40% at 90% 80%, rgba(13,148,136,0.09) 0%, transparent 70%),
//           radial-gradient(ellipse 40% 60% at 50% 50%, rgba(79,70,229,0.05) 0%, transparent 70%),
//           var(--bg);
//       }

//       .app-layout {
//         display: flex;        /* sidebar and main content side by side */
//         min-height: 100vh;    /* always full screen height */
//       }

//       .form-group { display: flex; flex-direction: column; gap: 8px; }
//       .form-group label {
//         font-size: 11px;
//         font-weight: 700;
//         color: var(--text2);
//         text-transform: uppercase;
//         letter-spacing: 1px;
//       }

//       /* ── I. SIDEBAR ────────────────────────────────────────────────────────
//          The left panel shown in all dashboard pages.

//          .sidebar      — the panel itself (sticky, full height)
//          .sidebar-logo — top area with LibraryMS logo + subtitle
//          .logo-mark    — flex row: icon + text
//          .logo-icon    — the 📚 square with amber/teal gradient
//          .sidebar-nav  — the navigation links container
//          .nav-item     — a single navigation link
//          .nav-item::before — the amber left accent bar (slides in when active)
//          .nav-badge    — red number bubble on nav items (e.g. pending count)
//          .sidebar-footer — bottom area: user chip + theme toggle + sign out
//          .user-chip    — the user info box in sidebar footer
//          .avatar       — the letter avatar circle (first letter of name)
//          .theme-btn    — the dark/light toggle button
//       ──────────────────────────────────────────────────────────────────────── */
//       .sidebar {
//         width: 268px;
//         background: var(--sidebar);
//         ${dark
//           ? "border-right: 1.5px solid rgba(255,255,255,0.07); box-shadow: 4px 0 32px rgba(0,0,0,0.35);"
//           : "border-right: 1.5px solid rgba(79,70,229,0.10); box-shadow: 4px 0 24px rgba(79,70,229,0.07);"}
//         display: flex;
//         flex-direction: column;
//         position: sticky;   /* sidebar sticks while main content scrolls */
//         top: 0;
//         height: 100vh;      /* full viewport height */
//         overflow-y: auto;   /* scroll if nav items overflow */
//       }

//       .sidebar-logo { padding: 28px 22px 20px; border-bottom: 1.5px solid var(--border); }
//       .logo-mark    { display: flex; align-items: center; gap: 12px; }
//       .logo-icon    { width: 42px; height: 42px; border-radius: 13px; background: linear-gradient(135deg,var(--amber),var(--teal2)); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 4px 16px rgba(232,160,32,0.4); flex-shrink: 0; }
//       .logo-text    { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 700; color: var(--text); }
//       .logo-sub     { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 1.2px; margin-top: 1px; }

//       .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 3px; }

//       .nav-item {
//         display: flex;
//         align-items: center;
//         gap: 12px;
//         padding: 11px 14px;
//         border-radius: 12px;
//         font-size: 14px;
//         font-weight: 500;
//         color: var(--text2);
//         cursor: pointer;
//         transition: all 0.18s;
//         border: 1.5px solid transparent;   /* transparent border prevents layout shift on active */
//         position: relative;
//         overflow: hidden;                   /* clip the ::before bar */
//       }
//       /* Left accent bar — amber/teal gradient stripe that slides down when active */
//       .nav-item::before {
//         content: '';
//         position: absolute;
//         left: 0; top: 0; bottom: 0;
//         width: 3px;
//         background: linear-gradient(180deg, var(--amber), var(--teal2));
//         border-radius: 0 4px 4px 0;
//         transform: scaleY(0);               /* hidden by default */
//         transition: transform 0.18s;
//       }
//       .nav-item:hover  { background: var(--surface2); color: var(--text); border-color: var(--border); }
//       .nav-item.active {
//         background: linear-gradient(135deg, rgba(232,160,32,0.12), rgba(13,148,136,0.08));
//         border-color: rgba(232,160,32,0.25);
//         color: var(--amber);
//       }
//       .nav-item.active::before { transform: scaleY(1); }   /* show bar when active */

//       .nav-icon  { font-size: 17px; width: 22px; text-align: center; flex-shrink: 0; }
//       .nav-badge {
//         margin-left: auto;                  /* push to right edge */
//         background: var(--rose);
//         color: #fff;
//         font-size: 10px;
//         font-weight: 700;
//         border-radius: 10px;
//         padding: 2px 7px;
//       }

//       .sidebar-footer { padding: 14px 12px; border-top: 1.5px solid var(--border); }
//       .user-chip {
//         display: flex; align-items: center; gap: 12px;
//         padding: 12px 14px;
//         border-radius: 14px;
//         background: var(--surface);
//         border: 1.5px solid var(--border);
//         margin-bottom: 10px;
//       }
//       .avatar {
//         width: 38px; height: 38px;
//         border-radius: 12px;
//         flex-shrink: 0;
//         background: linear-gradient(135deg, var(--indigo), var(--violet));
//         display: flex; align-items: center; justify-content: center;
//         font-weight: 700; font-size: 15px; color: #fff;
//         box-shadow: 0 2px 10px rgba(124,58,237,0.4);
//       }
//       .user-chip-name { font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
//       .user-chip-role { font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.7px; margin-top: 1px; }

//       .theme-btn {
//         width: 100%;
//         display: flex; align-items: center; justify-content: center; gap: 8px;
//         padding: 9px 14px;
//         border-radius: 10px;
//         background: var(--surface);
//         border: 1.5px solid var(--border);
//         color: var(--text2);
//         font-size: 12px; font-weight: 700;
//         margin-bottom: 8px;
//         cursor: pointer;
//         text-transform: uppercase; letter-spacing: 0.5px;
//       }
//       .theme-btn:hover { border-color: var(--amber); color: var(--amber); background: var(--glow); }

//       /* ── J. MAIN CONTENT ───────────────────────────────────────────────────
//          .main-content — the right panel, fills remaining width, scrollable
//          .main-padded  — inner padding wrapper for page content
//          .page-header  — the h1 + subtitle block at top of each page
//       ──────────────────────────────────────────────────────────────────────── */
//       .main-content {
//         flex: 1;                /* take all remaining width after sidebar */
//         overflow-y: auto;       /* scroll this area independently of sidebar */
//         background: var(--bg);
//         background-image:
//           radial-gradient(ellipse 50% 40% at 80% 10%, rgba(13,148,136,0.06) 0%, transparent 60%),
//           radial-gradient(ellipse 40% 30% at 20% 80%, rgba(232,160,32,0.06) 0%, transparent 60%);
//       }
//       .main-padded { padding: 36px 44px; }

//       .page-header            { margin-bottom: 32px; }
//       .page-header h1         { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: var(--text); line-height: 1.1; }
//       .page-header p          { color: var(--text2); margin-top: 7px; font-size: 14px; }

//       /* ── K. STATS CARDS ────────────────────────────────────────────────────
//          The big numbered cards on dashboard home pages.

//          .stats-grid — auto-filling grid, min 170px per card
//          .stat-card  — individual card with a 3px coloured top bar
//          ::after     — the coloured top bar (amber → teal gradient)
//          .stat-icon  — the emoji at the top
//          .stat-num   — the large serif number
//          .stat-label — the small uppercase label below the number
//       ──────────────────────────────────────────────────────────────────────── */
//       .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px,1fr)); gap: 16px; margin-bottom: 28px; }
//       .stat-card {
//         background: var(--surface2);
//         border: 1.5px solid var(--border);
//         border-radius: 16px;
//         padding: 22px 20px;
//         ${dark ? "box-shadow: 0 2px 16px rgba(0,0,0,0.25);" : "box-shadow: 0 2px 12px rgba(79,70,229,0.06);"}
//         transition: transform 0.2s, box-shadow 0.2s;
//         position: relative;     /* needed for ::after pseudo-element */
//         overflow: hidden;       /* clip the ::after bar */
//       }
//       .stat-card::after {       /* 3px gradient bar across top of card */
//         content: '';
//         position: absolute;
//         top: 0; left: 0; right: 0;
//         height: 3px;
//         background: linear-gradient(90deg, var(--amber), var(--teal2));
//       }
//       .stat-card:hover {
//         transform: translateY(-3px);
//         ${dark ? "box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px var(--glow);" : "box-shadow: 0 8px 24px rgba(79,70,229,0.12);"}
//       }
//       .stat-icon  { font-size: 26px; margin-bottom: 12px; }
//       .stat-num   { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 700; line-height: 1; }
//       .stat-label { font-size: 11px; font-weight: 600; color: var(--text2); margin-top: 5px; text-transform: uppercase; letter-spacing: 0.8px; }

//       /* ── L. TABLES ─────────────────────────────────────────────────────────
//          .table-wrap — scrollable container (handles overflow on small screens)
//          thead th    — bold uppercase column headers
//          tbody tr    — subtle hover highlight
//          tbody td    — consistent padding and font size
//       ──────────────────────────────────────────────────────────────────────── */
//       .table-wrap { overflow-x: auto; border-radius: 12px; }
//       table { width: 100%; border-collapse: collapse; }
//       thead th {
//         text-align: left;
//         font-size: 10px;
//         font-weight: 700;
//         letter-spacing: 1px;
//         text-transform: uppercase;
//         color: var(--text3);
//         padding: 13px 18px;
//         border-bottom: 1.5px solid var(--border);
//       }
//       tbody tr {
//         border-bottom: 1px solid ${dark ? "rgba(255,255,255,0.04)" : "rgba(79,70,229,0.05)"};
//         transition: background 0.15s;
//       }
//       tbody tr:hover { background: var(--surface); }
//       tbody td { padding: 14px 18px; font-size: 13px; color: var(--text); }

//       /* ── M. OTP INPUT BOXES ────────────────────────────────────────────────
//          6 individual digit boxes for email OTP verification.
//          Each is a fixed-size square with large centered text.
//          Focus adds amber border + glow (same as regular inputs).
//       ──────────────────────────────────────────────────────────────────────── */
//       .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 24px 0; }
//       .otp-box {
//         width: 54px; height: 62px;
//         text-align: center;
//         font-size: 26px; font-weight: 700;
//         border-radius: 12px;
//         background: var(--surface2);
//         border: 2px solid var(--border);
//         color: var(--text);
//         caret-color: var(--amber);
//         transition: border-color 0.2s, box-shadow 0.2s;
//       }
//       .otp-box:focus { border-color: var(--amber); box-shadow: 0 0 0 4px var(--glow); }

//       /* Horizontal gradient line used as visual separator */
//       .divider { height: 1px; margin: 24px 0; background: linear-gradient(90deg, transparent, var(--border2), transparent); }

//       /* ── N. TAGS ───────────────────────────────────────────────────────────
//          Small coloured pill labels showing roles and verification status.
//          Used in user tables and profile pages.
//       ──────────────────────────────────────────────────────────────────────── */
//       .tag           { display: inline-block; padding: 3px 11px; border-radius: 20px; font-size: 10px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; }
//       .tag-admin     { background: rgba(232,160,32,0.15); color: var(--amber); border: 1px solid rgba(232,160,32,0.30); }
//       .tag-librarian { background: rgba(13,148,136,0.15); color: var(--teal2); border: 1px solid rgba(13,148,136,0.30); }
//       .tag-member    { background: rgba(79,70,229,0.12);  color: #818CF8;      border: 1px solid rgba(79,70,229,0.25); }
//       .tag-verified  { background: rgba(5,150,105,0.12);  color: #34D399;      border: 1px solid rgba(5,150,105,0.25); }
//       .tag-pending   { background: rgba(245,158,11,0.12); color: #FCD34D;      border: 1px solid rgba(245,158,11,0.25); }

//       /* ── O. STATUS BADGES ──────────────────────────────────────────────────
//          Larger coloured pill labels showing request/borrow status.
//          Different from tags — these are for dynamic status values.
//       ──────────────────────────────────────────────────────────────────────── */
//       .badge          { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
//       .badge-pending  { background: rgba(245,158,11,0.15); color: #FCD34D; border: 1px solid rgba(245,158,11,0.3); }
//       .badge-approved { background: rgba(5,150,105,0.15);  color: #34D399; border: 1px solid rgba(5,150,105,0.3); }
//       .badge-rejected { background: rgba(225,29,72,0.15);  color: #FB7185; border: 1px solid rgba(225,29,72,0.3); }
//       .badge-returned { background: rgba(100,116,139,0.15);color: #94A3B8; border: 1px solid rgba(100,116,139,0.3); }
//       .badge-overdue  { background: rgba(225,29,72,0.15);  color: #FB7185; border: 1px solid rgba(225,29,72,0.3); }
//       .badge-blocked  { background: rgba(220,38,38,0.15);  color: #F87171; border: 1px solid rgba(220,38,38,0.3); }
//       .badge-active   { background: rgba(5,150,105,0.15);  color: #34D399; border: 1px solid rgba(5,150,105,0.3); }
//       .badge-expired  { background: rgba(225,29,72,0.15);  color: #FB7185; border: 1px solid rgba(225,29,72,0.3); }
//       .badge-borrowed { background: rgba(5,150,105,0.15);  color: #34D399; border: 1px solid rgba(5,150,105,0.3); }

//       /* ── P. FILTER TABS ────────────────────────────────────────────────────
//          Pill-shaped buttons used to switch between views.
//          e.g. PENDING | APPROVED | REJECTED | ALL
//          Active tab gets the amber gradient fill.
//       ──────────────────────────────────────────────────────────────────────── */
//       .filter-tabs { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
//       .filter-tab {
//         padding: 7px 18px;
//         border-radius: 22px;
//         font-size: 12px; font-weight: 700;
//         border: 1.5px solid var(--border);
//         background: transparent;
//         color: var(--text2);
//         cursor: pointer;
//         transition: all 0.18s;
//         letter-spacing: 0.3px;
//       }
//       .filter-tab.active {
//         background: linear-gradient(135deg, var(--amber), var(--amber2));
//         color: #0D0E14;
//         border-color: transparent;
//         box-shadow: 0 3px 14px rgba(232,160,32,0.4);
//       }
//       .filter-tab:hover:not(.active) { border-color: var(--amber); color: var(--amber); }

//       /* ── Q. ACTION CARDS ───────────────────────────────────────────────────
//          Clickable tile cards on home dashboard pages.
//          Used in the "Quick Actions" grid.
//          Hover: amber border, subtle lift, glow shadow.
//       ──────────────────────────────────────────────────────────────────────── */
//       .action-card {
//         background: var(--surface2);
//         border: 1.5px solid var(--border);
//         border-radius: 14px;
//         padding: 18px 20px;
//         cursor: pointer;
//         transition: all 0.2s;
//         display: flex; align-items: center; gap: 14px;
//       }
//       .action-card:hover {
//         border-color: var(--amber);
//         transform: translateY(-2px);
//         ${dark ? "box-shadow: 0 8px 28px rgba(0,0,0,0.3), 0 0 20px var(--glow);" : "box-shadow: 0 6px 20px rgba(232,160,32,0.15);"}
//       }
//       .action-card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }

//       /* ── R. LANDING PAGE ───────────────────────────────────────────────────
//          The public homepage shown to unauthenticated visitors.

//          .landing     — full page container with radial gradient bg
//          .orb         — floating blurred colour blobs (pure decoration)
//          .orb-1/2/3   — three orbs with different sizes, positions, animations
//          .landing-nav — frosted glass top navigation bar
//          .hero        — the centered headline section
//          .hero-title  — 3-line large heading with animation delays
//          .features    — 4-column strip at bottom of page
//       ──────────────────────────────────────────────────────────────────────── */
//       .landing {
//         min-height: 100vh;
//         display: flex;
//         flex-direction: column;
//         background: var(--bg);
//         position: relative;
//         overflow: hidden;
//         background-image:
//           radial-gradient(ellipse 70% 60% at 15% 30%, rgba(232,160,32,0.08) 0%, transparent 65%),
//           radial-gradient(ellipse 60% 50% at 85% 70%, rgba(13,148,136,0.08) 0%, transparent 65%),
//           radial-gradient(ellipse 40% 40% at 60% 15%, rgba(79,70,229,0.06) 0%, transparent 60%);
//       }
//       .orb   { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
//       .orb-1 { width: 500px; height: 500px; background: rgba(232,160,32,0.11); top: -140px; left: -120px; animation: float 9s ease-in-out infinite; }
//       .orb-2 { width: 420px; height: 420px; background: rgba(13,148,136,0.10); bottom: -100px; right: -100px; animation: float 11s ease-in-out infinite 3s; }
//       .orb-3 { width: 320px; height: 320px; background: rgba(79,70,229,0.07); top: 38%; left: 52%; animation: float 8s ease-in-out infinite 1.5s; }

//       .landing-nav {
//         display: flex; align-items: center; justify-content: space-between;
//         padding: 22px 64px;
//         position: relative; z-index: 10;
//         border-bottom: 1px solid var(--border);
//         backdrop-filter: blur(10px);                        /* frosted glass effect */
//         background: ${dark ? "rgba(8,11,20,0.55)" : "rgba(240,242,248,0.65)"};
//       }
//       .landing-nav-actions { display: flex; gap: 12px; align-items: center; }

//       .hero { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px 32px 60px; position: relative; z-index: 5; }
//       .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px 6px 8px; background: ${dark ? "rgba(232,160,32,0.08)" : "rgba(232,160,32,0.10)"}; border: 1.5px solid rgba(232,160,32,0.28); border-radius: 100px; font-size: 12px; font-weight: 600; color: var(--amber); margin-bottom: 32px; letter-spacing: 0.4px; animation: fadeUp 0.6s 0.1s both; }
//       .eyebrow-dot  { width: 8px; height: 8px; background: var(--amber); border-radius: 50%; animation: shimmer 2s infinite; }

//       .hero-title       { font-family: 'Cormorant Garamond', serif; font-size: clamp(52px,8vw,96px); font-weight: 700; line-height: 1.0; letter-spacing: -2px; margin-bottom: 26px; }
//       .hero-title .l1   { display: block; color: var(--text); animation: fadeUp 0.6s 0.2s both; }
//       .hero-title .l2   { display: block; background: linear-gradient(135deg,var(--amber) 0%,var(--amber2) 40%,var(--teal2) 100%); background-size: 200% 200%; animation: gradMove 4s ease infinite, fadeUp 0.6s 0.3s both; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
//       .hero-title .l3   { display: block; color: var(--text); opacity: 0.75; font-style: italic; animation: fadeUp 0.6s 0.4s both; }
//       .hero-sub         { font-size: 18px; color: var(--text2); line-height: 1.7; max-width: 540px; margin: 0 auto 44px; animation: fadeUp 0.6s 0.5s both; }
//       .hero-cta         { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.6s 0.6s both; }
//       .hero-stats       { display: flex; gap: 48px; justify-content: center; margin-top: 56px; padding-top: 40px; border-top: 1px solid var(--border); animation: fadeUp 0.6s 0.8s both; }
//       .hero-stat-num    { font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: 700; color: var(--amber); }
//       .hero-stat-label  { font-size: 11px; color: var(--text3); text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; }

//       .features   { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); border-top: 1px solid var(--border); position: relative; z-index: 5; }
//       .feat       { background: var(--bg); padding: 36px 32px; transition: background 0.22s; }
//       .feat:hover { background: var(--bg2); }
//       .feat:hover .feat-num { color: var(--amber); }
//       .feat-num   { font-family: 'Cormorant Garamond', serif; font-size: 54px; font-weight: 700; color: var(--border); line-height: 1; margin-bottom: 12px; transition: color 0.3s; }
//       .feat-title { font-weight: 700; font-size: 15px; color: var(--text); margin-bottom: 7px; }
//       .feat-desc  { font-size: 13px; color: var(--text2); line-height: 1.6; }

//       /* ── S. AUTH CARD ──────────────────────────────────────────────────────
//          The frosted glass card shown on Login, Register, and OTP pages.
//          .auth-icon — the animated emoji icon at the top of the card
//          .auth-title — large serif heading
//          .auth-sub   — supporting subtitle text
//       ──────────────────────────────────────────────────────────────────────── */
//       .auth-card {
//         background: var(--surface2);
//         border: 1.5px solid var(--border);
//         border-radius: 22px;
//         padding: 44px;
//         ${dark ? "box-shadow: 0 24px 80px rgba(0,0,0,0.5), 0 0 60px var(--glow);" : "box-shadow: 0 16px 60px rgba(79,70,229,0.12), 0 0 40px var(--glow);"}
//         backdrop-filter: blur(20px);
//         width: 100%; max-width: 460px;
//         animation: fadeUp 0.5s 0.1s both;
//       }
//       .auth-icon  { width: 64px; height: 64px; border-radius: 18px; margin: 0 auto 16px; background: linear-gradient(135deg,var(--amber),var(--teal2)); display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 6px 24px rgba(232,160,32,0.45); animation: glowPulse 3s ease-in-out infinite; }
//       .auth-title { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 700; color: var(--text); text-align: center; }
//       .auth-sub   { font-size: 14px; color: var(--text2); margin-top: 6px; text-align: center; }

//       /* ── T. ANIMATIONS ─────────────────────────────────────────────────────
//          fadeUp    — elements slide up + fade in (used on page load)
//          spin      — continuous rotation (loading spinner)
//          shimmer   — pulsing opacity (eyebrow dot, loading states)
//          float     — gentle floating up and down (landing page orbs)
//          gradMove  — animated gradient background position (hero title)
//          glowPulse — breathing glow effect (auth icon)

//          .fade-up  — utility class to apply fadeUp animation
//       ──────────────────────────────────────────────────────────────────────── */
//       @keyframes fadeUp    { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
//       @keyframes spin      { to   { transform: rotate(360deg); } }
//       @keyframes shimmer   { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
//       @keyframes float     { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
//       @keyframes gradMove  { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
//       @keyframes glowPulse { 0%,100% { box-shadow: 0 0 20px var(--glow); } 50% { box-shadow: 0 0 50px var(--glow), 0 0 90px rgba(232,160,32,0.10); } }

//       .fade-up { animation: fadeUp 0.45s cubic-bezier(.22,.68,0,1.2) forwards; }
//     `}</style>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // UI
// // ═══════════════════════════════════════════════════════════════════════════

// // =============================================================================
// // FILE: src/components/UI.jsx
// // PURPOSE: Shared reusable UI building blocks used across the whole app.
// //
// // EXPORTS:
// //   Spinner       — animated loading circle
// //   StatusBadge   — coloured pill for status strings (PENDING, APPROVED, etc.)
// //   ThemeToggle   — dark/light mode button
// //   Sidebar       — the left navigation panel for all dashboards
// //   useBookStats  — custom hook that fetches and computes book counts
// //
// // These are "dumb" components — they receive data as props and render UI.
// // They contain NO business logic and NO API calls (except useBookStats).
// // =============================================================================


// // =============================================================================
// // COMPONENT: Spinner
// // PURPOSE: Shows an animated loading circle while async operations are running.
// //
// // WHEN TO USE: Inside buttons (while form is submitting), or as a page-level
// //              loader (while data is being fetched from the API).
// //
// // PROPS:
// //   size — width/height in pixels (default 16 = fits nicely inside a button)
// //
// // HOW THE ANIMATION WORKS:
// //   The element is a circle (border-radius: 50%).
// //   It has a border with 3 transparent sides and 1 amber side (border-top).
// //   The CSS @keyframes spin rotates it 360° continuously.
// //   This creates the "spinning arc" loading effect.
// // =============================================================================
// function Spinner({ size = 16 }) {
//   return (
//     <span
//       style={{
//         display:       "inline-block",
//         width:         size,
//         height:        size,
//         border:        "2px solid rgba(255,255,255,0.2)",  // faint full ring
//         borderTopColor: "var(--amber)",                    // amber top arc that spins
//         borderRadius:  "50%",                              // make it a circle
//         animation:     "spin 0.7s linear infinite",        // spin indefinitely
//       }}
//     />
//   );
// }

// // =============================================================================
// // COMPONENT: StatusBadge
// // PURPOSE: Renders the correct coloured pill badge for any status string.
// //
// // WHEN TO USE: In tables whenever a row has a status column.
// //   e.g. borrow request status, reservation status, subscription status
// //
// // PROPS:
// //   status — string like "PENDING", "APPROVED", "REJECTED", "OVERDUE", etc.
// //
// // HOW IT WORKS:
// //   Maps the status string to a CSS class from GlobalStyle.jsx.
// //   The CSS classes define the background colour, text colour, and border.
// //   If status is unknown → falls back to badge-pending (yellow).
// // =============================================================================
// function StatusBadge({ status }) {
//   // Map each known status to its CSS class
//   const classMap = {
//     PENDING:  "badge-pending",
//     APPROVED: "badge-approved",
//     REJECTED: "badge-rejected",
//     BORROWED: "badge-borrowed",   // same green as approved
//     RETURNED: "badge-returned",   // grey
//     OVERDUE:  "badge-overdue",    // red
//     BLOCKED:  "badge-blocked",    // red (more intense)
//     ACTIVE:   "badge-active",     // green (subscription active)
//     EXPIRED:  "badge-expired",    // red (subscription expired)
//   };

//   // className combines the base "badge" class with the status-specific class
//   return (
//     <span className={`badge ${classMap[status] || "badge-pending"}`}>
//       {status}
//     </span>
//   );
// }

// // =============================================================================
// // COMPONENT: ThemeToggle
// // PURPOSE: Button that switches between dark ↔ light mode.
// //
// // WHEN TO USE: Placed in the sidebar footer of all dashboard pages.
// //              Also used in the landing page nav bar.
// //
// // HOW IT WORKS:
// //   1. useTheme() reads { dark, toggle } from ThemeContext
// //   2. Button shows "☀️ Light Mode" if currently dark (clicking = go light)
// //   3. Button shows "🌙 Dark Mode" if currently light (clicking = go dark)
// //   4. Clicking calls toggle() which updates state and saves to localStorage
// // =============================================================================
// function ThemeToggle() {
//   const { dark, toggle } = useTheme();    // read current theme + toggle function
//   return (
//     <button className="theme-btn" onClick={toggle}>
//       {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
//     </button>
//   );
// }

// // =============================================================================
// // COMPONENT: Sidebar
// // PURPOSE: The left navigation panel shown in ALL three dashboards.
// //
// // WHEN TO USE: Inside AdminDashboard, LibrarianDashboard, MemberDashboard.
// //
// // PROPS:
// //   subtitle    — text under the "LibraryMS" logo
// //                 e.g. "Admin Panel", "Librarian Panel", "Member Portal"
// //   navItems    — array of navigation items, each shaped like:
// //                 { id: "home", icon: "🏠", label: "Dashboard", badge: 3 }
// //                 - id: unique string, matched against activeTab
// //                 - icon: emoji shown left of label
// //                 - label: text to display
// //                 - badge: (optional) red number bubble (e.g. pending count)
// //   activeTab   — the id of the currently selected nav item
// //   setActiveTab — function to change the active tab (passed from dashboard)
// //   user        — the logged-in user object { name, role, ... }
// //   roleLabel   — string shown below user's name ("Admin", "Librarian", "Member")
// //   onLogout    — function called when "Sign Out" is clicked
// //
// // LAYOUT:
// //   [Logo area]
// //   [Nav links]
// //   ...
// //   [User chip]    ← shows avatar, name, role
// //   [Theme toggle]
// //   [Sign Out]
// // =============================================================================
// function Sidebar({ subtitle, navItems, activeTab, setActiveTab, user, roleLabel, onLogout }) {
//   return (
//     <aside className="sidebar">

//       {/* ── Logo section ── */}
//       <div className="sidebar-logo">
//         <div className="logo-mark">
//           <div className="logo-icon">📚</div>
//           <div>
//             <div className="logo-text">LibraryMS</div>
//             <div className="logo-sub">{subtitle}</div>
//           </div>
//         </div>
//       </div>

//       {/* ── Navigation links ── */}
//       <nav className="sidebar-nav">
//         {navItems.map(n => (
//           <div
//             key={n.id}
//             // Add "active" class if this item's id matches the current tab
//             className={`nav-item ${activeTab === n.id ? "active" : ""}`}
//             onClick={() => setActiveTab(n.id)}   // click to switch tab
//           >
//             <span className="nav-icon">{n.icon}</span>
//             <span>{n.label}</span>
//             {/* Red badge number — only rendered if badge prop exists and > 0 */}
//             {n.badge > 0 && (
//               <span className="nav-badge">{n.badge}</span>
//             )}
//           </div>
//         ))}
//       </nav>

//       {/* ── Footer: user info + controls ── */}
//       <div className="sidebar-footer">

//         {/* User identity chip */}
//         <div className="user-chip">
//           {/* Avatar: shows the first letter of the user's name */}
//           <div className="avatar">
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div style={{ flex: 1, minWidth: 0 }}>   {/* minWidth:0 enables text-overflow:ellipsis */}
//             <div className="user-chip-name">{user.name}</div>
//             <div className="user-chip-role">{roleLabel}</div>
//           </div>
//         </div>

//         {/* Theme toggle button */}
//         <ThemeToggle />

//         {/* Sign out — calls onLogout from App.jsx which clears user state */}
//         <button className="btn-ghost" onClick={onLogout} style={{ width: "100%" }}>
//           Sign Out
//         </button>
//       </div>
//     </aside>
//   );
// }

// // =============================================================================
// // HOOK: useBookStats
// // PURPOSE: Fetches all books from the API and returns computed counts.
// //          Used on the home dashboard of all three roles.
// //
// // RETURNS: { total, available, unavailable }
// //   total       — total number of books in the system
// //   available   — books with availableCopies > 0
// //   unavailable — books with availableCopies === 0
// //
// // HOW IT WORKS:
// //   1. On mount, calls GET /api/books with auth header
// //   2. Gets back an array of book objects
// //   3. Filters the array to compute the 3 counts
// //   4. Returns the counts — components just display them
// //
// // WHY A CUSTOM HOOK?
// //   All 3 dashboards need the same stats. Without this hook, we'd copy-paste
// //   the same fetch logic 3 times. The hook runs once per dashboard that uses it.
// // =============================================================================
// function useBookStats() {
//   // Initialize with zeros — will be updated when fetch completes
//   const [stats, setStats] = useState({ total: 0, available: 0, unavailable: 0 });

//   useEffect(() => {
//     // useEffect with empty [] runs once when the component first mounts
//     fetch(`${API}/books`, { headers: authHeaders() })
//       .then(r => r.ok ? r.json() : [])         // if request failed, use empty array
//       .then(books => {
//         if (!Array.isArray(books)) return;       // guard: ensure we got an array

//         setStats({
//           total:       books.length,
//           // count books that have at least 1 copy available
//           available:   books.filter(b => (b.availableCopies ?? 0) > 0).length,
//           // count books with zero available copies
//           unavailable: books.filter(b => (b.availableCopies ?? 0) === 0).length,
//         });
//       })
//       .catch(() => {});                          // silently ignore network errors
//   }, []);                                        // [] = run once on mount, not on every render

//   return stats;
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // LANDINGPAGE
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/auth/LandingPage.jsx
// // PURPOSE: The public homepage shown to ALL visitors who are
// //          not logged in yet.
// //
// // WHAT THE USER SEES:
// //   1. Frosted-glass top nav bar  (logo + Sign In + Get Started)
// //   2. Three floating glowing background orbs (pure decoration)
// //   3. Hero section  (big heading + subtitle + CTA buttons + stats)
// //   4. Feature strip at bottom (4 tiles describing the system)
// //
// // NAVIGATION:
// //   This page has NO backend calls.
// //   All navigation is done by calling navigate(pageName) which
// //   calls setPage() in App.jsx to switch which page is rendered.
// //
// // PROPS:
// //   navigate — function(pageName) — switches the current page
// //              e.g. navigate("login") shows LoginPage
// // ============================================================

// // useTheme() gives us { dark, toggle }
// // We need `toggle` for the theme button in the nav bar
// // We need `dark` to conditionally change the nav background

// function LandingPage({ navigate }) {

//   // Read current theme state + the toggle function
//   const { dark, toggle } = useTheme();

//   return (
//     <div className="landing">
//       {/* ── BACKGROUND ORBS ──────────────────────────────────
//           These are large blurred circles that float slowly
//           in the background using the CSS `float` animation.
//           They are PURELY decorative — pointer-events:none
//           means they don't interfere with clicks.

//           orb-1 = amber/gold,  top-left
//           orb-2 = teal/green,  bottom-right
//           orb-3 = indigo/blue, center-right
//       ────────────────────────────────────────────────────── */}
//       <div className="orb orb-1" />
//       <div className="orb orb-2" />
//       <div className="orb orb-3" />

//       {/* ── TOP NAVIGATION BAR ──────────────────────────────
//           Frosted-glass bar pinned to the top of the page.
//           Contains:  Logo | [Theme toggle] [Sign In] [Get Started]
//       ────────────────────────────────────────────────────── */}
//       <nav className="landing-nav">
//         {/* Left: logo mark */}
//         <div className="logo-mark">
//           <div className="logo-icon" style={{ width: 38, height: 38, fontSize: 18 }}>📚</div>
//           <div className="logo-text" style={{ fontSize: 20 }}>LibraryMS</div>
//         </div>

//         {/* Right: action buttons */}
//         <div className="landing-nav-actions">
//           {/* Theme toggle — smaller version without label text */}
//           <button
//             className="theme-btn"
//             onClick={toggle}
//             style={{ marginBottom: 0, width: "auto", padding: "8px 14px", fontSize: 12 }}
//           >
//             {dark ? "☀️" : "🌙"}
//           </button>

//           {/* Sign In → navigates to LoginPage */}
//           <button
//             className="btn-ghost"
//             style={{ padding: "10px 22px" }}
//             onClick={() => navigate("login")}
//           >
//             Sign In
//           </button>

//           {/* Get Started → navigates to RegisterPage */}
//           <button
//             className="btn-primary"
//             style={{ padding: "10px 22px" }}
//             onClick={() => navigate("register")}
//           >
//             Get Started →
//           </button>
//         </div>
//       </nav>

//       {/* ── HERO SECTION ────────────────────────────────────
//           The main centered content area.
//           Layout (top to bottom):
//             - Eyebrow pill label  (pulsing dot + "Library Management System")
//             - 3-line headline     (animated, last line has moving gradient)
//             - Subtitle paragraph
//             - Two CTA buttons
//             - Stats row (50+ books, 3 roles, ∞ possibilities)
//       ────────────────────────────────────────────────────── */}
//       <section className="hero">

//         {/* Eyebrow: small pill above headline */}
//         <div className="hero-eyebrow">
//           {/* Pulsing amber dot — CSS @keyframes shimmer */}
//           <div className="eyebrow-dot" />
//           <span>Library Management System</span>
//         </div>

//         {/* 3-line animated headline
//             l1 = plain text, slides up with 0.2s delay
//             l2 = animated colour gradient that moves back and forth
//             l3 = italic, slightly faded, slides up with 0.4s delay */}
//         <h1 className="hero-title">
//           <span className="l1">Knowledge Begins</span>
//           <span className="l2">In Organisation</span>
//           <span className="l3">At Your Fingertips</span>
//         </h1>

//         {/* Subtitle — describes what the system does */}
//         <p className="hero-sub">
//           A complete platform for admins, librarians, and members.
//           Manage books, memberships, reservations, borrows and fines — beautifully.
//         </p>

//         {/* CTA Buttons */}
//         <div className="hero-cta">
//           <button
//             className="btn-primary"
//             style={{ padding: "15px 38px", fontSize: 15, borderRadius: 12 }}
//             onClick={() => navigate("register")}
//           >
//             Create Free Account
//           </button>
//           <button
//             className="btn-ghost"
//             style={{ padding: "14px 32px", fontSize: 15, borderRadius: 12 }}
//             onClick={() => navigate("login")}
//           >
//             Sign In →
//           </button>
//         </div>

//         {/* Stats row — 3 numbers that appear below the CTAs */}
//         <div className="hero-stats">
//           {[
//             { num: "50+", label: "Books Seeded"  },
//             { num: "3",   label: "Role Types"    },
//             { num: "∞",   label: "Possibilities" },
//           ].map((s, i) => (
//             <div key={i} style={{ textAlign: "center" }}>
//               <div className="hero-stat-num">{s.num}</div>
//               <div className="hero-stat-label">{s.label}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* ── FEATURE STRIP ───────────────────────────────────
//           4-column grid at the very bottom of the page.
//           Each tile has a large number (01–04), title, description.
//           Hover: background lightens + the large number turns amber.
//       ────────────────────────────────────────────────────── */}
//       <div className="features">
//         {[
//           {
//             n: "01",
//             t: "Role-Based Access",
//             d: "Admin, Librarian & Member dashboards, each precisely tailored to their workflow.",
//           },
//           {
//             n: "02",
//             t: "OTP Verification",
//             d: "Secure email OTP ensures only verified users can access your library system.",
//           },
//           {
//             n: "03",
//             t: "Smart Reservations",
//             d: "Members request unavailable books; librarians approve with one click.",
//           },
//           {
//             n: "04",
//             t: "Borrow & Fine System",
//             d: "Borrow up to 3 books. ₹10/day overdue fine. Auto-block at ₹500. Subscription plans included.",
//           },
//         ].map((f, i) => (
//           <div className="feat" key={i}>
//             <div className="feat-num">{f.n}</div>
//             <div className="feat-title">{f.t}</div>
//             <div className="feat-desc">{f.d}</div>
//           </div>
//         ))}
//       </div>

//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // REGISTERPAGE
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/auth/RegisterPage.jsx
// // PURPOSE: New user registration form.
// //
// // WHAT THE USER SEES:
// //   - Name, Email, Password fields
// //   - Role selector: MEMBER or LIBRARIAN
// //   - Context hint below role (different message per role)
// //   - "Create Account" submit button
// //   - Link to Login for existing users
// //
// // WHAT HAPPENS ON SUBMIT:
// //   1. POST /api/auth/register  with { name, email, password, role }
// //   2. If successful:
// //        - Save email to sessionStorage (OtpPage needs it)
// //        - Navigate to "otp" page for email verification
// //   3. If error: show error message below the icon
// //
// // ROLE NOTES:
// //   MEMBER    → OTP sent to email, verified immediately
// //   LIBRARIAN → No OTP, but account requires Admin approval before login
// //
// // PROPS:
// //   navigate — function(pageName) — switches the current page
// // ============================================================


// function RegisterPage({ navigate }) {

//   // ── STATE ────────────────────────────────────────────────
//   // One object holds all form field values.
//   // We use spread syntax {...form, field: value} to update one field
//   // without losing the others.
//   const [form, setForm] = useState({
//     name:     "",
//     email:    "",
//     password: "",
//     role:     "MEMBER",   // default to MEMBER
//   });

//   const [loading, setLoading] = useState(false);  // true while API call is running
//   const [error,   setError]   = useState("");      // error message to display

//   // ── SUBMIT HANDLER ───────────────────────────────────────
//   const handleRegister = async (e) => {
//     e.preventDefault();     // stop browser from reloading the page
//     setError("");            // clear any previous error
//     setLoading(true);        // show spinner in button

//     try {
//       const res = await fetch(`${API}/auth/register`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify(form),   // send all form fields as JSON
//       });

//       // If backend returned an error status (4xx/5xx), throw with its message
//       if (!res.ok) throw new Error(await res.text() || "Registration failed");

//       // Save email so OtpPage knows which address to verify
//       sessionStorage.setItem("otpEmail", form.email);

//       // Go to OTP verification step
//       navigate("otp");

//     } catch (err) {
//       setError(err.message);   // show whatever error the backend sent
//     } finally {
//       setLoading(false);       // always stop the spinner
//     }
//   };

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div className="page-center">   {/* centers card on screen */}
//       <div className="auth-card">

//         {/* Icon at the top of the card */}
//         <div className="auth-icon">📚</div>
//         <h2 className="auth-title">Create Account</h2>
//         <p  className="auth-sub">Join the Library Management System</p>

//         {/* Error message — only shown when error state is non-empty */}
//         {error && (
//           <div className="msg-error" style={{ margin: "20px 0 0" }}>{error}</div>
//         )}

//         {/* Form — onSubmit handles both button click AND pressing Enter */}
//         <form onSubmit={handleRegister} style={{ display:"flex", flexDirection:"column", gap:16, marginTop:24 }}>

//           {/* Full Name */}
//           <div className="form-group">
//             <label>Full Name</label>
//             <input
//               placeholder="Enter your full name"
//               value={form.name}
//               onChange={e => setForm({ ...form, name: e.target.value })}
//               required
//             />
//           </div>

//           {/* Email */}
//           <div className="form-group">
//             <label>Email Address</label>
//             <input
//               type="email"
//               placeholder="you@example.com"
//               value={form.email}
//               onChange={e => setForm({ ...form, email: e.target.value })}
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="form-group">
//             <label>Password</label>
//             <input
//               type="password"
//               placeholder="Create a strong password"
//               value={form.password}
//               onChange={e => setForm({ ...form, password: e.target.value })}
//               required
//             />
//           </div>

//           {/* Role selector */}
//           <div className="form-group">
//             <label>Register As</label>
//             <select
//               value={form.role}
//               onChange={e => setForm({ ...form, role: e.target.value })}
//             >
//               <option value="MEMBER">Member</option>
//               <option value="LIBRARIAN">Librarian</option>
//             </select>
//           </div>

//           {/* Context hint — changes based on which role is selected */}
//           {form.role === "MEMBER" && (
//             <p style={{ fontSize:12, color:"var(--text3)", lineHeight:1.6 }}>
//               📧 An OTP will be sent to your email to verify your account.
//             </p>
//           )}
//           {form.role === "LIBRARIAN" && (
//             <p style={{ fontSize:12, color:"var(--text3)", lineHeight:1.6 }}>
//               ⏳ Librarian accounts require Admin approval before you can log in.
//             </p>
//           )}

//           {/* Submit button — shows spinner while loading */}
//           <button
//             className="btn-primary"
//             type="submit"
//             disabled={loading}
//             style={{ marginTop:6, width:"100%", fontSize:15 }}
//           >
//             {loading ? <Spinner /> : "Create Account →"}
//           </button>

//         </form>

//         {/* Visual divider line */}
//         <div className="divider" />

//         {/* Link to login */}
//         <p style={{ textAlign:"center", fontSize:13, color:"var(--text2)" }}>
//           Already have an account?{" "}
//           <span
//             style={{ color:"var(--amber)", cursor:"pointer", fontWeight:700 }}
//             onClick={() => navigate("login")}
//           >
//             Sign In
//           </span>
//         </p>

//         {/* Back to landing page */}
//         <p
//           style={{ textAlign:"center", fontSize:12, color:"var(--text3)", marginTop:10, cursor:"pointer" }}
//           onClick={() => navigate("landing")}
//         >
//           ← Back to Home
//         </p>

//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // OTPPAGE
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/auth/OtpPage.jsx
// // PURPOSE: Email OTP verification after registration.
// //
// // WHAT THE USER SEES:
// //   - 6 individual digit input boxes side by side
// //   - "Verify Code" button
// //   - After success: green message + "Go to Sign In" button
// //
// // HOW THE OTP BOXES WORK:
// //   - otp state = array of 6 strings: ["","","","","",""]
// //   - Each box is bound to otp[index]
// //   - Typing a digit → auto-focus NEXT box (handleChange)
// //   - Pressing Backspace in empty box → go BACK one box (handleKeyDown)
// //   - This gives a smooth "type and jump" experience
// //
// // API CALL:
// //   POST /api/auth/verify?email=...&otp=123456
// //   Response is a plain text message (not JSON)
// //
// // PROPS:
// //   navigate — function(pageName) — switches current page
// // ============================================================


// function OtpPage({ navigate }) {

//   // ── STATE ────────────────────────────────────────────────
//   // Array of 6 strings, one per digit box
//   const [otp,     setOtp]     = useState(["", "", "", "", "", ""]);
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState("");
//   const [success, setSuccess] = useState("");

//   // Email that was saved by RegisterPage before navigating here
//   const email = sessionStorage.getItem("otpEmail") || "";

//   // ── HANDLE DIGIT INPUT ───────────────────────────────────
//   // Called every time a digit box changes.
//   // idx = which box (0-5), val = new value typed
//   const handleChange = (idx, val) => {
//     // Only allow numeric characters (0-9)
//     if (!/^\d*$/.test(val)) return;

//     // Update the digit at this index
//     const next = [...otp];           // copy array (don't mutate state directly)
//     next[idx] = val.slice(-1);       // keep only the LAST character typed (in case of paste)
//     setOtp(next);

//     // Auto-jump to next box if a digit was entered and we're not at the last box
//     if (val && idx < 5) {
//       document.getElementById(`otp-${idx + 1}`)?.focus();
//     }
//   };

//   // ── HANDLE BACKSPACE ─────────────────────────────────────
//   // When Backspace is pressed in an already-empty box,
//   // move focus back to the previous box.
//   const handleKeyDown = (idx, e) => {
//     if (e.key === "Backspace" && !otp[idx] && idx > 0) {
//       document.getElementById(`otp-${idx - 1}`)?.focus();
//     }
//   };

//   // ── SUBMIT OTP ───────────────────────────────────────────
//   const handleVerify = async () => {
//     const code = otp.join("");   // combine array → "123456"

//     if (code.length < 6) {
//       setError("Please enter all 6 digits");
//       return;
//     }

//     setError("");
//     setLoading(true);

//     try {
//       // Backend expects query params (not JSON body)
//       const r = await fetch(
//         `${API}/auth/verify?email=${encodeURIComponent(email)}&otp=${code}`,
//         { method: "POST" }
//       );

//       const txt = await r.text();   // response is plain text, not JSON

//       // Check if the response text indicates success
//       if (txt.includes("successfully") || txt.toLowerCase().includes("verified")) {
//         setSuccess("✅ Email verified! You can now sign in.");
//         sessionStorage.removeItem("otpEmail");   // clean up — no longer needed
//       } else {
//         setError(txt || "Verification failed. Please try again.");
//       }

//     } catch {
//       setError("Network error. Please check your connection.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div className="page-center">
//       <div className="auth-card" style={{ textAlign: "center" }}>

//         <div className="auth-icon">✉️</div>
//         <h2 className="auth-title">Verify Email</h2>
//         <p className="auth-sub">
//           Enter the 6-digit code sent to{" "}
//           <strong style={{ color: "var(--amber)" }}>{email}</strong>
//         </p>

//         {/* Error message */}
//         {error   && <div className="msg-error"   style={{ marginTop: 14 }}>{error}</div>}

//         {/* Success message */}
//         {success && <div className="msg-success" style={{ marginTop: 14 }}>{success}</div>}

//         {/* Show digit boxes + button only BEFORE successful verification */}
//         {!success && (
//           <>
//             {/* 6 individual digit input boxes */}
//             <div className="otp-inputs">
//               {otp.map((digit, i) => (
//                 <input
//                   key={i}
//                   id={`otp-${i}`}            // used by focus() calls above
//                   className="otp-box"
//                   maxLength={1}              // only 1 character allowed per box
//                   value={digit}
//                   onChange={e => handleChange(i, e.target.value)}
//                   onKeyDown={e => handleKeyDown(i, e)}
//                 />
//               ))}
//             </div>

//             {/* Verify button */}
//             <button
//               className="btn-primary"
//               onClick={handleVerify}
//               disabled={loading}
//               style={{ width: "100%", padding: 14 }}
//             >
//               {loading ? <Spinner /> : "Verify Code →"}
//             </button>
//           </>
//         )}

//         {/* Show "Go to Sign In" button AFTER successful verification */}
//         {success && (
//           <button
//             className="btn-teal"
//             onClick={() => navigate("login")}
//             style={{ width: "100%", padding: 14, marginTop: 16 }}
//           >
//             Go to Sign In →
//           </button>
//         )}

//         <p style={{ marginTop: 16, fontSize: 12, color: "var(--text3)" }}>
//           Code is valid for 5 minutes
//         </p>

//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // LOGINPAGE
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/auth/LoginPage.jsx
// // PURPOSE: User login with email and password.
// //
// // WHAT HAPPENS ON SUCCESS:
// //   1. Backend returns: { id, name, email, role, token, approved, verified }
// //   2. JWT token saved to localStorage as "token"
// //      → Used in Authorization headers for ALL future API calls
// //   3. User object passed to onLogin(user) in App.jsx
// //      → App.jsx saves it to sessionStorage and sets the user state
// //      → React re-renders — user is now logged in
// //      → App.jsx routes to the correct dashboard by user.role
// //
// // PROPS:
// //   navigate — function(pageName) — switches current page
// //   onLogin  — function(user)     — called by App.jsx on successful login
// // ============================================================


// function LoginPage({ navigate, onLogin }) {

//   // ── STATE ────────────────────────────────────────────────
//   const [form,    setForm]    = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState("");

//   // ── SUBMIT HANDLER ───────────────────────────────────────
//   const handleLogin = async (e) => {
//     e.preventDefault();    // prevent browser page reload
//     setError("");
//     setLoading(true);

//     try {
//       const res = await fetch(`${API}/auth/login`, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify(form),
//       });

//       // Backend sends a plain error message on failure (not JSON)
//       if (!res.ok) throw new Error(await res.text() || "Login failed");

//       // Parse the user object from JSON
//       const user = await res.json();
//       // user = { id, name, email, role, token, approved, verified, ... }

//       // Save JWT so every future API call can include it
//       if (user.token) {
//         localStorage.setItem("token", user.token);
//       }

//       // Hand the user object up to App.jsx
//       // App.jsx will save it to sessionStorage + update state → triggers re-render
//       onLogin(user);

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div className="page-center">
//       <div className="auth-card">

//         <div className="auth-icon">🔐</div>
//         <h2 className="auth-title">Welcome Back</h2>
//         <p  className="auth-sub">Sign in to your library account</p>

//         {/* Error message — only shown when non-empty */}
//         {error && (
//           <div className="msg-error" style={{ margin: "20px 0 0" }}>{error}</div>
//         )}

//         {/* Login form */}
//         <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16, marginTop:24 }}>

//           <div className="form-group">
//             <label>Email Address</label>
//             <input
//               type="email"
//               placeholder="you@example.com"
//               value={form.email}
//               onChange={e => setForm({ ...form, email: e.target.value })}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Password</label>
//             <input
//               type="password"
//               placeholder="Your password"
//               value={form.password}
//               onChange={e => setForm({ ...form, password: e.target.value })}
//               required
//             />
//           </div>

//           <button
//             className="btn-primary"
//             type="submit"
//             disabled={loading}
//             style={{ marginTop:6, width:"100%", fontSize:15 }}
//           >
//             {loading ? <Spinner /> : "Sign In →"}
//           </button>

//         </form>

//         <div className="divider" />

//         {/* Link to register */}
//         <p style={{ textAlign:"center", fontSize:13, color:"var(--text2)" }}>
//           Don't have an account?{" "}
//           <span
//             style={{ color:"var(--amber)", cursor:"pointer", fontWeight:700 }}
//             onClick={() => navigate("register")}
//           >
//             Create Account
//           </span>
//         </p>

//         <p
//           style={{ textAlign:"center", fontSize:12, color:"var(--text3)", marginTop:10, cursor:"pointer" }}
//           onClick={() => navigate("landing")}
//         >
//           ← Back to Home
//         </p>

//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // PROFILEPANEL
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/shared/ProfilePanel.jsx
// // PURPOSE: Shows user info and allows password change.
// //          Used by ALL three roles: Admin, Librarian, Member.
// //
// // WHAT THE USER SEES:
// //   1. Profile card — avatar, name, role tags, info grid
// //   2. Change Password form — current + new + confirm
// //
// // WHY SHARED?
// //   All three dashboards show the same profile page. Instead of
// //   copy-pasting this into each dashboard, we put it here once
// //   and import it in all three.
// //
// // PROPS:
// //   user — the logged-in user object { name, email, role, verified, approved }
// // ============================================================


// function ProfilePanel({ user }) {

//   // ── STATE ────────────────────────────────────────────────
//   // Three password fields in one state object
//   const [pwForm, setPwForm] = useState({
//     currentPassword: "",
//     newPassword:     "",
//     confirm:         "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [error,   setError]   = useState("");
//   const [success, setSuccess] = useState("");

//   // ── PASSWORD CHANGE HANDLER ──────────────────────────────
//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     // Client-side check: new passwords must match before calling API
//     if (pwForm.newPassword !== pwForm.confirm) {
//       setError("Passwords don't match");
//       return;
//     }

//     setLoading(true);
//     try {
//       const r = await fetch(`${API}/auth/change-password`, {
//         method:  "POST",
//         headers: authHeaders(),   // includes JWT token
//         body: JSON.stringify({
//           email:           user.email,
//           currentPassword: pwForm.currentPassword,
//           newPassword:     pwForm.newPassword,
//         }),
//       });
//       if (!r.ok) throw new Error(await r.text());
//       setSuccess("✅ Password updated successfully!");
//       // Clear the form after success
//       setPwForm({ currentPassword: "", newPassword: "", confirm: "" });

//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div style={{ maxWidth: 580 }}>

//       {/* Page header */}
//       <div className="page-header">
//         <h1>My Profile</h1>
//         <p>Manage your account details and security settings</p>
//       </div>

//       {/* ── Profile info card ── */}
//       <div className="card card-glow" style={{ marginBottom: 20 }}>

//         {/* Avatar + name + tags row */}
//         <div style={{
//           display:"flex", alignItems:"center", gap:20,
//           marginBottom:26, paddingBottom:22,
//           borderBottom:"1.5px solid var(--border)"
//         }}>
//           {/* Large letter avatar */}
//           <div className="avatar" style={{ width:72, height:72, fontSize:28, borderRadius:20 }}>
//             {user.name?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, marginBottom:8 }}>
//               {user.name}
//             </h3>
//             <div style={{ display:"flex", gap:8 }}>
//               {/* Role tag — class picks colour based on role string */}
//               <span className={`tag tag-${user.role?.toLowerCase()}`}>{user.role}</span>
//               {/* Verification status tag */}
//               <span className={`tag ${user.verified ? "tag-verified" : "tag-pending"}`}>
//                 {user.verified ? "✓ Verified" : "Unverified"}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Info grid: Name, Email, Role, Status in 2-column grid */}
//         <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
//           {[
//             { label: "Full Name", value: user.name                          },
//             { label: "Email",     value: user.email                         },
//             { label: "Role",      value: user.role                          },
//             { label: "Status",    value: user.approved ? "Approved" : "Pending" },
//           ].map((row, i) => (
//             <div key={i} style={{ background:"var(--surface)", borderRadius:10, padding:"14px 16px" }}>
//               <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:5, fontWeight:700 }}>
//                 {row.label}
//               </div>
//               <div style={{ fontSize:14, fontWeight:500 }}>{row.value}</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── Change Password card ── */}
//       <div className="card">
//         <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:4 }}>
//           Change Password
//         </h3>
//         <p style={{ fontSize:13, color:"var(--text2)", marginBottom:22 }}>
//           Update your account password securely
//         </p>

//         {error   && <div className="msg-error"   style={{ marginBottom:16 }}>{error}</div>}
//         {success && <div className="msg-success" style={{ marginBottom:16 }}>{success}</div>}

//         <form onSubmit={handlePasswordChange} style={{ display:"flex", flexDirection:"column", gap:14 }}>

//           <div className="form-group">
//             <label>Current Password</label>
//             <input
//               type="password"
//               placeholder="Enter your current password"
//               value={pwForm.currentPassword}
//               onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>New Password</label>
//             <input
//               type="password"
//               placeholder="Enter your new password"
//               value={pwForm.newPassword}
//               onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <label>Confirm New Password</label>
//             <input
//               type="password"
//               placeholder="Re-enter your new password"
//               value={pwForm.confirm}
//               onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
//               required
//             />
//           </div>

//           <button
//             className="btn-primary"
//             type="submit"
//             disabled={loading}
//             style={{ alignSelf:"flex-start", minWidth:180 }}
//           >
//             {loading ? <Spinner /> : "Update Password"}
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // MANAGERESERVATIONS
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/shared/ManageReservations.jsx
// // PURPOSE: Admin and Librarian view + manage all book reservations.
// //
// // WHAT IS A RESERVATION?
// //   A reservation is when a member wants a book that has ZERO
// //   available copies. They join a waitlist by "reserving" it.
// //   This is DIFFERENT from a borrow request (which is for available books).
// //
// // WHAT ADMIN/LIBRARIAN CAN DO:
// //   - See all reservations filtered by status
// //   - Approve a PENDING reservation (marks it APPROVED)
// //   - Reject a PENDING reservation (marks it REJECTED)
// //
// // TABS:
// //   PENDING | APPROVED | REJECTED | ALL
// //   Each tab filters the table. Count badges show how many are in each.
// //
// // API CALLS:
// //   GET  /api/reservations/all                        → fetch all reservations
// //   PUT  /api/reservations/{id}/status?status=APPROVED → approve one
// //   PUT  /api/reservations/{id}/status?status=REJECTED → reject one
// //
// // NO PROPS NEEDED — reads auth token from localStorage directly
// // ============================================================


// function ManageReservations() {

//   // ── STATE ────────────────────────────────────────────────
//   const [reservations, setReservations] = useState([]);  // all reservations from API
//   const [loading,      setLoading]      = useState(true);
//   const [msg,          setMsg]          = useState({ text: "", type: "" });
//   const [filter,       setFilter]       = useState("PENDING");  // active filter tab

//   // ── FETCH ALL RESERVATIONS ───────────────────────────────
//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const r = await fetch(`${API}/reservations/all`, { headers: authHeaders() });
//       setReservations(r.ok ? await r.json() : []);
//     } catch {
//       setReservations([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch on first mount
//   useEffect(() => { fetchAll(); }, []);

//   // ── APPROVE OR REJECT ─────────────────────────────────────
//   // status = "APPROVED" or "REJECTED"
//   const updateStatus = async (id, status) => {
//     try {
//       const r = await fetch(
//         `${API}/reservations/${id}/status?status=${status}`,
//         { method: "PUT", headers: authHeaders() }
//       );
//       setMsg({
//         text: r.ok ? `✅ Reservation ${status.toLowerCase()}!` : "❌ Update failed",
//         type: r.ok ? "success" : "error",
//       });
//       if (r.ok) fetchAll();  // refresh list after change
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     // Auto-clear message after 3 seconds
//     setTimeout(() => setMsg({ text: "", type: "" }), 3000);
//   };

//   // ── DERIVED DATA ─────────────────────────────────────────
//   // Count each status for the tab badges
//   const counts = {
//     PENDING:  reservations.filter(r => r.status === "PENDING").length,
//     APPROVED: reservations.filter(r => r.status === "APPROVED").length,
//     REJECTED: reservations.filter(r => r.status === "REJECTED").length,
//   };

//   // Filter the list based on which tab is active
//   const filtered = filter === "ALL"
//     ? reservations
//     : reservations.filter(r => r.status === filter);

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div>
//       <div className="page-header">
//         <h1>Book Reservations</h1>
//         <p>Manage member waitlist requests for currently unavailable books</p>
//       </div>

//       {/* Feedback message */}
//       {msg.text && (
//         <div className={msg.type === "success" ? "msg-success" : "msg-error"}
//              style={{ marginBottom: 16 }}>
//           {msg.text}
//         </div>
//       )}

//       {/* ── Filter tabs with count badges ── */}
//       <div className="filter-tabs">
//         {["PENDING", "APPROVED", "REJECTED", "ALL"].map(f => (
//           <button
//             key={f}
//             className={`filter-tab ${filter === f ? "active" : ""}`}
//             onClick={() => setFilter(f)}
//           >
//             {f}
//             {/* Show count badge for tabs that have a count (not ALL) */}
//             {f !== "ALL" && counts[f] !== undefined && (
//               <span style={{ marginLeft:5, background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"1px 7px", fontSize:10 }}>
//                 {counts[f]}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* ── Reservations table ── */}
//       <div className="card">
//         {loading ? (
//           // Loading state
//           <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>

//         ) : filtered.length === 0 ? (
//           // Empty state
//           <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}>
//             <div style={{ fontSize:48, marginBottom:14 }}>📭</div>
//             <p>No {filter.toLowerCase()} reservations</p>
//           </div>

//         ) : (
//           // Data table
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Member</th>
//                   <th>Book Title</th>
//                   <th>Department</th>
//                   <th>Requested On</th>
//                   <th>Status</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((r, i) => (
//                   <tr key={i}>
//                     {/* Member name — fallback to memberId if name missing */}
//                     <td style={{ fontWeight:600 }}>{r.memberName || r.memberId}</td>
//                     <td style={{ fontWeight:600 }}>{r.bookTitle}</td>
//                     <td>
//                       <span className="tag tag-librarian">{r.bookDepartment || "—"}</span>
//                     </td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td>
//                       <StatusBadge status={r.status} />
//                     </td>
//                     <td>
//                       {/* Only show action buttons for PENDING reservations */}
//                       {r.status === "PENDING" ? (
//                         <div style={{ display:"flex", gap:6 }}>
//                           <button className="btn-success" onClick={() => updateStatus(r.id, "APPROVED")}>
//                             ✅ Approve
//                           </button>
//                           <button className="btn-danger" onClick={() => updateStatus(r.id, "REJECTED")}>
//                             ❌ Reject
//                           </button>
//                         </div>
//                       ) : (
//                         // Already actioned — no buttons
//                         <span style={{ color:"var(--text3)", fontSize:12 }}>—</span>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // MEMBERRESERVATIONS
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/shared/MemberReservations.jsx
// // PURPOSE: Member-facing page to reserve UNAVAILABLE books.
// //
// // DIFFERENCE: Reservation vs Borrow
// //   Reservation = book has 0 copies available → join waitlist
// //   Borrow      = book has ≥1 copy available  → request to borrow now
// //
// // WHAT THE MEMBER SEES:
// //   Top section: Their existing reservation requests (if any)
// //   Bottom section: All unavailable books with a "Reserve" button
// //                   (disabled if already reserved that book)
// //
// // API CALLS:
// //   GET  /api/books                           → all books (filter to unavailable)
// //   GET  /api/reservations/my/{memberId}      → this member's reservations
// //   POST /api/reservations/request            → submit a new reservation
// //
// // PROPS:
// //   user — the logged-in member object { id, name, ... }
// // ============================================================


// function MemberReservations({ user }) {

//   // ── STATE ────────────────────────────────────────────────
//   const [books,        setBooks]        = useState([]);  // all books from API
//   const [reservations, setReservations] = useState([]);  // this member's reservations
//   const [loading,      setLoading]      = useState(true);
//   const [msg,          setMsg]          = useState({ text: "", type: "" });
//   const [search,       setSearch]       = useState("");  // search filter for book list

//   // ── FETCH DATA ───────────────────────────────────────────
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // Fetch books and reservations in parallel using Promise.allSettled
//       // allSettled won't fail if one request errors — it just returns a result for each
//       const [booksResult, resResult] = await Promise.allSettled([
//         fetch(`${API}/books`,                        { headers: authHeaders() }),
//         fetch(`${API}/reservations/my/${user.id}`,   { headers: authHeaders() }),
//       ]);

//       if (booksResult.status === "fulfilled" && booksResult.value.ok)
//         setBooks(await booksResult.value.json());

//       if (resResult.status === "fulfilled" && resResult.value.ok)
//         setReservations(await resResult.value.json());

//     } catch {} finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []);

//   // ── SUBMIT RESERVATION ───────────────────────────────────
//   const reserve = async (bookId) => {
//     try {
//       const r = await fetch(`${API}/reservations/request`, {
//         method:  "POST",
//         headers: authHeaders(),
//         body:    JSON.stringify({ bookId, memberId: user.id }),
//       });
//       const txt = await r.text();
//       setMsg({
//         text: r.ok ? "✅ Reservation sent! A librarian will review your request." : `❌ ${txt}`,
//         type: r.ok ? "success" : "error",
//       });
//       if (r.ok) fetchData();  // refresh to show the new reservation in the top table
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 4000);
//   };

//   // ── DERIVED DATA ─────────────────────────────────────────
//   // Only show books with 0 available copies
//   const unavailableBooks = books.filter(b => (b.availableCopies ?? 0) === 0);

//   // Apply search filter (by title or author)
//   const filteredBooks = unavailableBooks.filter(b =>
//     !search ||
//     b.title?.toLowerCase().includes(search.toLowerCase()) ||
//     b.author?.toLowerCase().includes(search.toLowerCase())
//   );

//   // Set of book IDs this member has already reserved — used to disable button
//   const alreadyReservedIds = new Set(reservations.map(r => r.bookId));

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div>
//       <div className="page-header">
//         <h1>Reserve a Book</h1>
//         <p>
//           These books are currently unavailable. Submit a request and a librarian
//           will notify you when the book becomes available.
//         </p>
//       </div>

//       {msg.text && (
//         <div className={msg.type === "success" ? "msg-success" : "msg-error"}
//              style={{ marginBottom: 16 }}>
//           {msg.text}
//         </div>
//       )}

//       {/* ── MY EXISTING RESERVATIONS ── (only shown if member has any) */}
//       {reservations.length > 0 && (
//         <div className="card card-glow" style={{ marginBottom: 24 }}>
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//             My Reservation Requests
//           </h3>
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Book Title</th><th>Author</th><th>Requested On</th><th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {reservations.map((r, i) => (
//                   <tr key={i}>
//                     <td style={{ fontWeight:600 }}>{r.bookTitle}</td>
//                     <td style={{ color:"var(--text2)" }}>{r.bookAuthor}</td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td><StatusBadge status={r.status} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ── UNAVAILABLE BOOKS LIST ── */}
//       <div className="card">
//         <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//           Unavailable Books ({unavailableBooks.length})
//         </h3>

//         <input
//           placeholder="Search by title or author…"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           style={{ marginBottom: 18 }}
//         />

//         {loading ? (
//           <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
//         ) : filteredBooks.length === 0 ? (
//           <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//             <div style={{ fontSize:44, marginBottom:14 }}>🎉</div>
//             <p>{search ? "No results for that search" : "All books are currently available!"}</p>
//           </div>
//         ) : (
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr><th>Title</th><th>Author</th><th>Department</th><th>Action</th></tr>
//               </thead>
//               <tbody>
//                 {filteredBooks.map((b, i) => (
//                   <tr key={i}>
//                     <td style={{ fontWeight:600 }}>{b.title}</td>
//                     <td style={{ color:"var(--text2)" }}>{b.author}</td>
//                     <td><span className="tag tag-librarian">{b.department || "—"}</span></td>
//                     <td>
//                       {alreadyReservedIds.has(b.id) ? (
//                         // Already reserved → show badge instead of button
//                         <span className="badge badge-pending">Already Requested</span>
//                       ) : (
//                         <button
//                           className="btn-primary"
//                           style={{ padding:"7px 16px", fontSize:12 }}
//                           onClick={() => reserve(b.id)}
//                         >
//                           📌 Reserve
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // MANAGEBORROWINGS
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/shared/ManageBorrowings.jsx
// // PURPOSE: Admin and Librarian tool for the COMPLETE borrowing lifecycle.
// //
// // WHAT THIS PAGE DOES (4 inner tabs):
// //
// //   Tab 1 — "Borrow Requests":
// //     Shows all borrow requests (PENDING, APPROVED, REJECTED).
// //     For PENDING: show Approve button → opens due-days picker → Confirm.
// //     For PENDING: show Reject button → immediately rejects.
// //
// //   Tab 2 — "Active Borrows":
// //     Books currently out (status = BORROWED or OVERDUE).
// //     "Return" button marks a book as returned, calculates fine if late.
// //
// //   Tab 3 — "All Borrowings":
// //     Full history with search by member name or book title.
// //
// //   Tab 4 — "Fines":
// //     Members who have unpaid fines.
// //     Shows total fine per member + BLOCKED status if ≥ ₹500.
// //     "Mark Paid & Unblock" button clears fines and unblocks account.
// //
// // FINE LOGIC (enforced by backend, displayed here):
// //   - ₹10 per day overdue (FINE_PER_DAY = 10)
// //   - When total unpaid fines ≥ ₹500, user.approved = false (BLOCKED)
// //   - Librarian/Admin clicks "Mark Paid" → fines cleared, approved = true
// //
// // API CALLS:
// //   GET /api/borrow/requests/all          → all borrow requests
// //   GET /api/borrow/borrowings/all        → all borrowings
// //   PUT /api/borrow/requests/{id}/approve → approve + set due date
// //   PUT /api/borrow/requests/{id}/reject  → reject request
// //   PUT /api/borrow/borrowings/{id}/return         → mark returned + calc fine
// //   PUT /api/borrow/borrowings/{memberId}/pay-fine → clear fines + unblock
// //
// // PROPS:
// //   userRole — "ADMIN" or "LIBRARIAN" (used when approving, as approvedBy)
// // ============================================================


// function ManageBorrowings({ userRole }) {

//   // ── STATE ────────────────────────────────────────────────
//   const [requests,   setRequests]   = useState([]);   // all borrow requests
//   const [borrowings, setBorrowings] = useState([]);   // all borrowing records
//   const [tab,        setTab]        = useState("requests");  // active inner tab
//   const [msg,        setMsg]        = useState({ text: "", type: "" });

//   // Due days input: shown inline when approving a request (default 14 days)
//   const [dueDays,   setDueDays]   = useState(14);
//   // Track which request is currently in "approve mode" (shows due-days picker)
//   const [approving, setApproving] = useState(null);

//   // Search text for "All Borrowings" tab
//   const [search, setSearch] = useState("");

//   // ── FETCH ALL DATA ───────────────────────────────────────
//   const fetchAll = async () => {
//     try {
//       // Fetch requests and borrowings in parallel
//       const [rRes, bRes] = await Promise.allSettled([
//         fetch(`${API}/borrow/requests/all`,   { headers: authHeaders() }),
//         fetch(`${API}/borrow/borrowings/all`, { headers: authHeaders() }),
//       ]);
//       if (rRes.status === "fulfilled" && rRes.value.ok) setRequests(await rRes.value.json());
//       if (bRes.status === "fulfilled" && bRes.value.ok) setBorrowings(await bRes.value.json());
//     } catch {}
//   };

//   useEffect(() => { fetchAll(); }, []);

//   // ── APPROVE REQUEST ──────────────────────────────────────
//   // Creates borrowing records + decreases availableCopies for each book
//   const approveRequest = async (id) => {
//     try {
//       const r = await fetch(`${API}/borrow/requests/${id}/approve`, {
//         method:  "PUT",
//         headers: authHeaders(),
//         body: JSON.stringify({ dueDays, approvedBy: userRole }),
//       });
//       const txt = await r.text();
//       setMsg({ text: r.ok ? `✅ ${txt}` : `❌ ${txt}`, type: r.ok ? "success" : "error" });
//       if (r.ok) { setApproving(null); fetchAll(); }
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 3000);
//   };

//   // ── REJECT REQUEST ───────────────────────────────────────
//   const rejectRequest = async (id) => {
//     try {
//       const r = await fetch(`${API}/borrow/requests/${id}/reject`, {
//         method: "PUT", headers: authHeaders(),
//       });
//       setMsg({ text: r.ok ? "✅ Request rejected" : "❌ Failed", type: r.ok ? "success" : "error" });
//       if (r.ok) fetchAll();
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 3000);
//   };

//   // ── MARK BOOK RETURNED ───────────────────────────────────
//   // Backend calculates fine automatically based on due date vs return date
//   const returnBook = async (id) => {
//     try {
//       const r = await fetch(`${API}/borrow/borrowings/${id}/return`, {
//         method: "PUT", headers: authHeaders(),
//       });
//       const txt = await r.text();
//       setMsg({ text: r.ok ? `✅ ${txt}` : `❌ ${txt}`, type: r.ok ? "success" : "error" });
//       if (r.ok) fetchAll();
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 4000);
//   };

//   // ── PAY FINE + UNBLOCK ───────────────────────────────────
//   // Clears all unpaid fines for a member AND sets user.approved = true
//   const payFine = async (memberId, memberName) => {
//     try {
//       const r = await fetch(`${API}/borrow/borrowings/${memberId}/pay-fine`, {
//         method: "PUT", headers: authHeaders(),
//       });
//       setMsg({
//         text: r.ok ? `✅ Fine cleared for ${memberName}. Account unblocked.` : "❌ Failed",
//         type: r.ok ? "success" : "error",
//       });
//       if (r.ok) fetchAll();
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 4000);
//   };

//   // ── DERIVED DATA ─────────────────────────────────────────
//   const pendingRequests  = requests.filter(r => r.status === "PENDING");
//   const activeBorrowings = borrowings.filter(b => b.status === "BORROWED" || b.status === "OVERDUE");
//   const overdueBorrowings = borrowings.filter(b => b.status === "OVERDUE");

//   // Filter for search in "All Borrowings" tab
//   const filteredAll = borrowings.filter(b =>
//     !search ||
//     b.memberName?.toLowerCase().includes(search.toLowerCase()) ||
//     b.bookTitle?.toLowerCase().includes(search.toLowerCase())
//   );

//   // Group unpaid fines by member for the "Fines" tab
//   // Result: { memberId: { name, email, memberId, total } }
//   const memberFineMap = {};
//   borrowings.forEach(b => {
//     if (!b.finePaid && b.fineAmount > 0) {
//       if (!memberFineMap[b.memberId]) {
//         memberFineMap[b.memberId] = {
//           name:     b.memberName,
//           email:    b.memberEmail,
//           memberId: b.memberId,
//           total:    0,
//         };
//       }
//       memberFineMap[b.memberId].total += b.fineAmount;
//     }
//   });
//   const fineMembers = Object.values(memberFineMap);

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div>
//       <div className="page-header">
//         <h1>Manage Borrowings</h1>
//         <p>Handle borrow requests, returns, fines, and member account status</p>
//       </div>

//       {msg.text && (
//         <div className={msg.type === "success" ? "msg-success" : "msg-error"}
//              style={{ marginBottom: 16 }}>
//           {msg.text}
//         </div>
//       )}

//       {/* ── Summary stat strip ── */}
//       <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:24 }}>
//         {[
//           { icon:"⏳", label:"Pending Requests",  value: pendingRequests.length,    c:"#FCD34D"        },
//           { icon:"📖", label:"Active Borrows",    value: activeBorrowings.length,   c:"var(--teal2)"   },
//           { icon:"⚠️", label:"Overdue",           value: overdueBorrowings.length,  c:"#F87171"        },
//           { icon:"💰", label:"Members with Fines",value: fineMembers.length,        c:"#F87171"        },
//         ].map((s, i) => (
//           <div className="stat-card" key={i}>
//             <div className="stat-icon">{s.icon}</div>
//             <div className="stat-num" style={{ fontSize:32, color:s.c }}>{s.value}</div>
//             <div className="stat-label">{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* ── Inner tabs ── */}
//       <div className="filter-tabs">
//         {[
//           { id:"requests",  label:`⏳ Borrow Requests${pendingRequests.length > 0 ? ` (${pendingRequests.length})` : ""}` },
//           { id:"active",    label:"📖 Active Borrows"  },
//           { id:"all",       label:"📋 All Borrowings"  },
//           { id:"fines",     label:`💰 Fines${fineMembers.length > 0 ? ` (${fineMembers.length})` : ""}` },
//         ].map(t => (
//           <button key={t.id} className={`filter-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {/* ════════════════════════════════════════════════════
//           TAB 1: BORROW REQUESTS
//           Shows all requests. PENDING ones can be Approved or Rejected.
//           Approve: click button → inline due-days input appears → Confirm.
//       ════════════════════════════════════════════════════ */}
//       {tab === "requests" && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//             Borrow Requests
//           </h3>
//           {requests.length === 0 ? (
//             <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//               <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
//               <p>No borrow requests yet</p>
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Member</th><th>Books Requested</th><th>Count</th>
//                     <th>Date</th><th>Status</th><th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {requests.map((r, i) => (
//                     <tr key={i}>
//                       <td>
//                         <div style={{ fontWeight:600 }}>{r.memberName}</div>
//                         <div style={{ fontSize:11, color:"var(--text3)" }}>{r.memberEmail}</div>
//                       </td>
//                       {/* bookTitles is a comma-separated string from backend */}
//                       <td style={{ maxWidth:260, fontSize:13 }}>{r.bookTitles}</td>
//                       <td style={{ textAlign:"center", fontWeight:700, color:"var(--amber)" }}>{r.bookCount}</td>
//                       <td style={{ color:"var(--text2)" }}>
//                         {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : "—"}
//                       </td>
//                       <td><StatusBadge status={r.status} /></td>
//                       <td>
//                         {r.status === "PENDING" && (
//                           approving === r.id ? (
//                             // ── Inline due-date picker (visible after clicking Approve) ──
//                             <div style={{ display:"flex", alignItems:"center", gap:8 }}>
//                               <input
//                                 type="number"
//                                 value={dueDays}
//                                 min={1} max={90}
//                                 onChange={e => setDueDays(parseInt(e.target.value))}
//                                 style={{ width:60, padding:"6px 8px", fontSize:12 }}
//                               />
//                               <span style={{ fontSize:12, color:"var(--text2)" }}>days</span>
//                               <button className="btn-success" style={{ padding:"6px 12px", fontSize:12 }}
//                                       onClick={() => approveRequest(r.id)}>✅ Confirm</button>
//                               <button className="btn-ghost" style={{ padding:"6px 10px", fontSize:12 }}
//                                       onClick={() => setApproving(null)}>✕</button>
//                             </div>
//                           ) : (
//                             <div style={{ display:"flex", gap:6 }}>
//                               {/* Click Approve → shows due-days picker */}
//                               <button className="btn-success" onClick={() => setApproving(r.id)}>✅ Approve</button>
//                               <button className="btn-danger"  onClick={() => rejectRequest(r.id)}>❌ Reject</button>
//                             </div>
//                           )
//                         )}
//                         {r.status !== "PENDING" && (
//                           <span style={{ color:"var(--text3)", fontSize:12 }}>
//                             {r.approvedBy || "—"}
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ════════════════════════════════════════════════════
//           TAB 2: ACTIVE BORROWS
//           Books currently checked out. "Return" button marks them returned.
//       ════════════════════════════════════════════════════ */}
//       {tab === "active" && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//             Active Borrows
//           </h3>
//           {activeBorrowings.length === 0 ? (
//             <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//               <div style={{ fontSize:44, marginBottom:12 }}>📚</div>
//               <p>No books currently borrowed</p>
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Member</th><th>Book</th><th>Borrowed On</th>
//                     <th>Due Date</th><th>Fine (₹)</th><th>Status</th><th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {activeBorrowings.map((b, i) => (
//                     <tr key={i}>
//                       <td style={{ fontWeight:600 }}>{b.memberName}</td>
//                       <td style={{ fontWeight:600 }}>{b.bookTitle}</td>
//                       <td style={{ color:"var(--text2)" }}>
//                         {b.borrowedAt ? new Date(b.borrowedAt).toLocaleDateString() : "—"}
//                       </td>
//                       {/* Red due date if overdue */}
//                       <td style={{ color: b.status === "OVERDUE" ? "#F87171" : "var(--teal2)", fontWeight:600 }}>
//                         {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}
//                       </td>
//                       <td style={{ color: b.fineAmount > 0 ? "#F87171" : "var(--teal2)", fontWeight:700 }}>
//                         ₹{b.fineAmount?.toFixed(0) || 0}
//                       </td>
//                       <td><StatusBadge status={b.status} /></td>
//                       <td>
//                         <button className="btn-teal" style={{ padding:"6px 14px", fontSize:12 }}
//                                 onClick={() => returnBook(b.id)}>
//                           📥 Return
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ════════════════════════════════════════════════════
//           TAB 3: ALL BORROWINGS HISTORY
//           Complete history with search filter.
//       ════════════════════════════════════════════════════ */}
//       {tab === "all" && (
//         <div className="card">
//           <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, gap:12 }}>
//             <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22 }}>All Borrowings</h3>
//             <input
//               placeholder="Search member or book…"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               style={{ maxWidth:260 }}
//             />
//           </div>
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr>
//                   <th>Member</th><th>Book</th><th>Borrowed</th>
//                   <th>Due</th><th>Returned</th><th>Fine</th><th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredAll.map((b, i) => (
//                   <tr key={i}>
//                     <td style={{ fontWeight:600 }}>{b.memberName}</td>
//                     <td>{b.bookTitle}</td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {b.borrowedAt ? new Date(b.borrowedAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td style={{ color: b.status === "OVERDUE" ? "#F87171" : "var(--text2)" }}>
//                       {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}
//                     </td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {b.returnedAt ? new Date(b.returnedAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td style={{ color: b.fineAmount > 0 ? "#F87171" : "var(--text2)", fontWeight: b.fineAmount > 0 ? 700 : 400 }}>
//                       ₹{b.fineAmount?.toFixed(0) || 0}
//                       {b.finePaid && <span style={{ color:"var(--teal2)", fontSize:10, marginLeft:4 }}>✓ paid</span>}
//                     </td>
//                     <td><StatusBadge status={b.status} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* ════════════════════════════════════════════════════
//           TAB 4: FINES MANAGEMENT
//           Shows members who have outstanding (unpaid) fines.
//           If total fine ≥ ₹500 → account is BLOCKED (shown with red badge).
//           "Mark Paid & Unblock" clears all fines + restores account access.
//       ════════════════════════════════════════════════════ */}
//       {tab === "fines" && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:6 }}>
//             Fine Management
//           </h3>
//           <p style={{ fontSize:13, color:"var(--text2)", marginBottom:20 }}>
//             ₹{FINE_PER_DAY}/day overdue. Accounts with ≥ ₹{FINE_BLOCK_LIMIT} in unpaid fines are auto-blocked.
//           </p>

//           {fineMembers.length === 0 ? (
//             <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//               <div style={{ fontSize:44, marginBottom:12 }}>✅</div>
//               <p>No outstanding fines — all clear!</p>
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Member</th><th>Email</th><th>Total Fine</th>
//                     <th>Account Status</th><th>Action</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {fineMembers.map((m, i) => (
//                     <tr key={i}>
//                       <td style={{ fontWeight:600 }}>{m.name}</td>
//                       <td style={{ color:"var(--text2)" }}>{m.email}</td>
//                       <td style={{ color:"#F87171", fontWeight:800, fontSize:16 }}>
//                         ₹{m.total.toFixed(0)}
//                       </td>
//                       <td>
//                         {/* Show BLOCKED badge if fine ≥ FINE_BLOCK_LIMIT */}
//                         {m.total >= FINE_BLOCK_LIMIT
//                           ? <span className="badge badge-blocked">🔒 BLOCKED</span>
//                           : <span className="badge badge-pending">Active</span>
//                         }
//                       </td>
//                       <td>
//                         <button className="btn-success" onClick={() => payFine(m.memberId, m.name)}>
//                           💳 Mark Paid & Unblock
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // SUBSCRIPTIONPAGES
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/shared/SubscriptionPages.jsx
// // PURPOSE: Contains two separate components for subscriptions:
// //
// //   1. MemberSubscriptionPage  — exported as named export
// //      Member sees plan cards, buys a plan, views history.
// //
// //   2. AdminSubscriptionManager — exported as named export
// //      Admin edits plan settings (price, duration, max books).
// //      Admin sees all member subscriptions.
// //
// // PLANS (seeded by backend on startup):
// //   Standard: ₹99 / 30 days / max 6 books
// //   Pro:      ₹299 / 30 days / unlimited books (maxBooks = 999)
// //
// // SUBSCRIPTION REQUIRED TO BORROW:
// //   A member with NO active subscription cannot submit a borrow request.
// //   Backend returns "NO_SUBSCRIPTION" error in that case.
// //   Expired subscription returns "SUBSCRIPTION_EXPIRED".
// // ============================================================


// // =============================================================
// // COMPONENT 1: MemberSubscriptionPage
// // =============================================================
// // PROPS:
// //   user — the logged-in member object { id, name, ... }
// // =============================================================
// function MemberSubscriptionPage({ user }) {

//   // ── STATE ────────────────────────────────────────────────
//   const [plans,   setPlans]   = useState([]);   // available subscription plans
//   const [mySub,   setMySub]   = useState(null); // this member's active subscription
//   const [history, setHistory] = useState([]);   // this member's past subscriptions
//   const [loading, setLoading] = useState(true);
//   const [msg,     setMsg]     = useState({ text: "", type: "" });

//   // ── FETCH DATA ───────────────────────────────────────────
//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       // Three API calls at once: plans, current subscription, history
//       const [plansRes, subRes, histRes] = await Promise.allSettled([
//         fetch(`${API}/subscriptions/plans`,              { headers: authHeaders() }),
//         fetch(`${API}/subscriptions/my/${user.id}`,      { headers: authHeaders() }),
//         fetch(`${API}/subscriptions/history/${user.id}`, { headers: authHeaders() }),
//       ]);
//       if (plansRes.status === "fulfilled" && plansRes.value.ok) setPlans(await plansRes.value.json());
//       if (subRes.status   === "fulfilled" && subRes.value.ok)   setMySub(await subRes.value.json());
//       if (histRes.status  === "fulfilled" && histRes.value.ok)  setHistory(await histRes.value.json());
//     } catch {} finally { setLoading(false); }
//   };

//   useEffect(() => { fetchAll(); }, []);

//   // ── SUBSCRIBE TO A PLAN ──────────────────────────────────
//   const subscribe = async (planId) => {
//     try {
//       const r = await fetch(`${API}/subscriptions/subscribe`, {
//         method:  "POST",
//         headers: authHeaders(),
//         body:    JSON.stringify({ memberId: user.id, planId }),
//       });
//       const txt = await r.text();
//       if (r.ok) {
//         setMsg({ text: `✅ ${txt}`, type: "success" });
//         fetchAll();   // refresh to show active subscription banner
//       } else if (txt.startsWith("ALREADY_SUBSCRIBED")) {
//         // Backend returns "ALREADY_SUBSCRIBED:PlanName" if already subscribed
//         const planName = txt.split(":")[1];
//         setMsg({ text: `❌ You already have an active ${planName} subscription.`, type: "error" });
//       } else {
//         setMsg({ text: `❌ ${txt}`, type: "error" });
//       }
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 4000);
//   };

//   // ── DERIVED DATA ─────────────────────────────────────────
//   // Is the current subscription active (not null, not NONE, not EXPIRED)?
//   const isSubActive = mySub && mySub.status !== "NONE" && mySub.status !== "EXPIRED";

//   // Days remaining in the active subscription
//   const daysLeft = isSubActive
//     ? Math.max(0, Math.ceil((new Date(mySub.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)))
//     : 0;

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div>
//       <div className="page-header">
//         <h1>Subscription</h1>
//         <p>Choose a plan to unlock borrowing. Active plan lets you borrow books up to your plan's limit.</p>
//       </div>

//       {msg.text && (
//         <div className={msg.type === "success" ? "msg-success" : "msg-error"} style={{ marginBottom: 20 }}>
//           {msg.text}
//         </div>
//       )}

//       {/* ── ACTIVE SUBSCRIPTION BANNER ── (shown only when subscribed) */}
//       {isSubActive && (
//         <div className="card card-glow" style={{ marginBottom: 28, background:"linear-gradient(135deg,rgba(13,148,136,0.10),rgba(232,160,32,0.08))" }}>
//           <div style={{ display:"flex", alignItems:"center", gap:20 }}>
//             <div style={{ fontSize: 48 }}>🎫</div>
//             <div style={{ flex: 1 }}>
//               <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:24, fontWeight:700, marginBottom:4 }}>
//                 {mySub.planName} — Active
//               </div>
//               <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
//                 <span style={{ fontSize:13, color:"var(--text2)" }}>
//                   📚 Max books:{" "}
//                   <strong style={{ color:"var(--amber)" }}>
//                     {mySub.maxBooks >= 999 ? "Unlimited" : mySub.maxBooks}
//                   </strong>
//                 </span>
//                 <span style={{ fontSize:13, color:"var(--text2)" }}>
//                   📅 Expires:{" "}
//                   <strong style={{ color:"var(--teal2)" }}>
//                     {new Date(mySub.expiresAt).toLocaleDateString()}
//                   </strong>
//                 </span>
//                 <span style={{ fontSize:13, color:"var(--text2)" }}>
//                   ⏳ Days left:{" "}
//                   <strong style={{ color: daysLeft <= 5 ? "#F87171" : "var(--amber)" }}>
//                     {daysLeft}
//                   </strong>
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* No subscription warning */}
//       {!isSubActive && (
//         <div className="msg-warn" style={{ marginBottom: 24 }}>
//           ⚠️ You don't have an active subscription. Subscribe below to start borrowing books.
//         </div>
//       )}

//       {/* ── PLAN CARDS ── */}
//       {loading ? (
//         <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
//       ) : (
//         <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, marginBottom:32 }}>
//           {plans.map((plan, i) => {
//             const isPro       = plan.planType === "PRO";
//             const isCurrent   = isSubActive && mySub.planType === plan.planType;
//             return (
//               <div
//                 key={i}
//                 className="card"
//                 style={{
//                   position: "relative",
//                   border: isPro ? "2px solid var(--amber)" : "1.5px solid var(--border)",
//                   background: isPro
//                     ? "linear-gradient(135deg,rgba(232,160,32,0.08),rgba(13,148,136,0.05))"
//                     : "var(--surface2)",
//                 }}
//               >
//                 {/* "Most Popular" ribbon for Pro plan */}
//                 {isPro && (
//                   <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,var(--amber),var(--amber2))", color:"#0D0E14", fontSize:11, fontWeight:800, padding:"3px 16px", borderRadius:20, whiteSpace:"nowrap" }}>
//                     ⭐ MOST POPULAR
//                   </div>
//                 )}

//                 {/* Plan name */}
//                 <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, marginBottom:6 }}>
//                   {plan.planName}
//                 </div>

//                 {/* Price */}
//                 <div style={{ fontSize:38, fontWeight:800, color:"var(--amber)", marginBottom:4 }}>
//                   ₹{plan.price}
//                   <span style={{ fontSize:14, color:"var(--text2)", fontWeight:400 }}>
//                     /{plan.durationDays} days
//                   </span>
//                 </div>

//                 {/* Description */}
//                 <div style={{ fontSize:13, color:"var(--text2)", marginBottom:20, lineHeight:1.6 }}>
//                   {plan.description}
//                 </div>

//                 {/* Feature list */}
//                 <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
//                   {[
//                     `Borrow up to ${plan.maxBooks >= 999 ? "Unlimited" : plan.maxBooks} books`,
//                     `Valid for ${plan.durationDays} days`,
//                     "Access to all departments",
//                   ].map((f, j) => (
//                     <div key={j} style={{ display:"flex", alignItems:"center", gap:8, fontSize:14 }}>
//                       <span style={{ color:"var(--teal2)", fontWeight:700 }}>✓</span>
//                       <span>{f}</span>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Action: show "Current Plan" if subscribed, else show Subscribe button */}
//                 {isCurrent ? (
//                   <div style={{ textAlign:"center", padding:"12px", background:"rgba(13,148,136,0.12)", border:"1.5px solid rgba(13,148,136,0.25)", borderRadius:10, color:"var(--teal2)", fontWeight:700 }}>
//                     ✅ Current Plan
//                   </div>
//                 ) : (
//                   <button
//                     className={isPro ? "btn-primary" : "btn-teal"}
//                     onClick={() => subscribe(plan.id)}
//                     style={{ width:"100%", fontSize:15 }}
//                   >
//                     Subscribe for ₹{plan.price}
//                   </button>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ── SUBSCRIPTION HISTORY TABLE ── (only shown if history exists) */}
//       {history.length > 0 && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//             Subscription History
//           </h3>
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr><th>Plan</th><th>Amount Paid</th><th>Start Date</th><th>Expiry</th><th>Status</th></tr>
//               </thead>
//               <tbody>
//                 {history.map((h, i) => (
//                   <tr key={i}>
//                     <td style={{ fontWeight:600 }}>{h.planName}</td>
//                     <td style={{ color:"var(--amber)", fontWeight:700 }}>₹{h.amountPaid}</td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {h.subscribedAt ? new Date(h.subscribedAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {h.expiresAt ? new Date(h.expiresAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td><StatusBadge status={h.status} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // =============================================================
// // COMPONENT 2: AdminSubscriptionManager
// // =============================================================
// // ONLY visible to Admin. Librarian does NOT have this tab.
// //
// // WHAT ADMIN CAN DO:
// //   1. Edit plan price, duration, max books, description
// //      (changes apply immediately to all future subscriptions)
// //   2. View all member subscriptions in a table
// // =============================================================
// function AdminSubscriptionManager() {

//   // ── STATE ────────────────────────────────────────────────
//   const [plans,    setPlans]    = useState([]);    // the two subscription plans
//   const [allSubs,  setAllSubs]  = useState([]);    // all member subscriptions
//   const [editPlan, setEditPlan] = useState(null);  // the plan currently being edited (or null)
//   const [msg,      setMsg]      = useState({ text: "", type: "" });

//   // ── FETCH ────────────────────────────────────────────────
//   const fetchAll = async () => {
//     try {
//       const [plansRes, subsRes] = await Promise.allSettled([
//         fetch(`${API}/subscriptions/plans`, { headers: authHeaders() }),
//         fetch(`${API}/subscriptions/all`,   { headers: authHeaders() }),
//       ]);
//       if (plansRes.status === "fulfilled" && plansRes.value.ok) setPlans(await plansRes.value.json());
//       if (subsRes.status  === "fulfilled" && subsRes.value.ok)  setAllSubs(await subsRes.value.json());
//     } catch {}
//   };

//   useEffect(() => { fetchAll(); }, []);

//   // ── SAVE PLAN CHANGES ────────────────────────────────────
//   const savePlan = async () => {
//     try {
//       const r = await fetch(`${API}/subscriptions/plans/${editPlan.id}`, {
//         method:  "PUT",
//         headers: authHeaders(),
//         body:    JSON.stringify(editPlan),
//       });
//       if (r.ok) {
//         setMsg({ text: "✅ Plan updated successfully!", type: "success" });
//         setEditPlan(null);  // close edit mode
//         fetchAll();         // refresh to show new values
//       } else {
//         setMsg({ text: "❌ Failed to update plan", type: "error" });
//       }
//     } catch {
//       setMsg({ text: "❌ Network error", type: "error" });
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 3000);
//   };

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div>
//       <div className="page-header">
//         <h1>Subscription Management</h1>
//         <p>Configure Standard and Pro plan pricing and limits. Only Admin can change these settings.</p>
//       </div>

//       {msg.text && (
//         <div className={msg.type === "success" ? "msg-success" : "msg-error"} style={{ marginBottom: 16 }}>
//           {msg.text}
//         </div>
//       )}

//       {/* ── Plan editor cards ── */}
//       <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, marginBottom:32 }}>
//         {plans.map((plan, i) => (
//           <div key={i} className="card card-glow">

//             {/* Plan header */}
//             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
//               <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700 }}>
//                 {plan.planName}
//               </div>
//               <span className={`tag ${plan.planType === "PRO" ? "tag-admin" : "tag-librarian"}`}>
//                 {plan.planType}
//               </span>
//             </div>

//             {/* ── EDIT MODE: show input fields for each property ── */}
//             {editPlan?.id === plan.id ? (
//               <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
//                 <div className="form-group">
//                   <label>Plan Name</label>
//                   <input value={editPlan.planName}
//                     onChange={e => setEditPlan({ ...editPlan, planName: e.target.value })} />
//                 </div>
//                 <div className="form-group">
//                   <label>Price (₹)</label>
//                   <input type="number" value={editPlan.price}
//                     onChange={e => setEditPlan({ ...editPlan, price: parseFloat(e.target.value) })} />
//                 </div>
//                 <div className="form-group">
//                   <label>Duration (Days)</label>
//                   <input type="number" value={editPlan.durationDays}
//                     onChange={e => setEditPlan({ ...editPlan, durationDays: parseInt(e.target.value) })} />
//                 </div>
//                 <div className="form-group">
//                   <label>Max Books (use 999 for Unlimited)</label>
//                   <input type="number" value={editPlan.maxBooks}
//                     onChange={e => setEditPlan({ ...editPlan, maxBooks: parseInt(e.target.value) })} />
//                 </div>
//                 <div className="form-group">
//                   <label>Description</label>
//                   <input value={editPlan.description}
//                     onChange={e => setEditPlan({ ...editPlan, description: e.target.value })} />
//                 </div>
//                 <div style={{ display:"flex", gap:8, marginTop:4 }}>
//                   <button className="btn-primary" onClick={savePlan}>💾 Save Changes</button>
//                   <button className="btn-ghost"   onClick={() => setEditPlan(null)}>Cancel</button>
//                 </div>
//               </div>

//             ) : (
//               // ── VIEW MODE: show current plan values ──
//               <div>
//                 <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
//                   {[
//                     { l:"Price",     v:`₹${plan.price}`                                     },
//                     { l:"Duration",  v:`${plan.durationDays} days`                          },
//                     { l:"Max Books", v: plan.maxBooks >= 999 ? "Unlimited" : plan.maxBooks  },
//                   ].map((row, j) => (
//                     <div key={j} style={{ background:"var(--surface)", borderRadius:8, padding:"10px 12px" }}>
//                       <div style={{ fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:3, fontWeight:700 }}>
//                         {row.l}
//                       </div>
//                       <div style={{ fontSize:15, fontWeight:600, color:"var(--amber)" }}>{row.v}</div>
//                     </div>
//                   ))}
//                 </div>
//                 <p style={{ fontSize:12, color:"var(--text2)", marginBottom:14 }}>{plan.description}</p>
//                 <button
//                   className="btn-ghost"
//                   onClick={() => setEditPlan({ ...plan })}   // copy plan into editPlan state
//                   style={{ width:"100%" }}
//                 >
//                   ✏️ Edit Plan Settings
//                 </button>
//               </div>
//             )}

//           </div>
//         ))}
//       </div>

//       {/* ── All Member Subscriptions table ── */}
//       <div className="card">
//         <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//           All Member Subscriptions
//         </h3>
//         {allSubs.length === 0 ? (
//           <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//             <div style={{ fontSize:44, marginBottom:12 }}>🎫</div>
//             <p>No member subscriptions yet</p>
//           </div>
//         ) : (
//           <div className="table-wrap">
//             <table>
//               <thead>
//                 <tr><th>Member</th><th>Plan</th><th>Amount</th><th>Start</th><th>Expiry</th><th>Status</th></tr>
//               </thead>
//               <tbody>
//                 {allSubs.map((s, i) => (
//                   <tr key={i}>
//                     <td style={{ fontWeight:600 }}>{s.memberName}</td>
//                     <td>
//                       <span className={`tag ${s.planType === "PRO" ? "tag-admin" : "tag-librarian"}`}>
//                         {s.planType}
//                       </span>
//                     </td>
//                     <td style={{ color:"var(--amber)", fontWeight:700 }}>₹{s.amountPaid}</td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td style={{ color:"var(--text2)" }}>
//                       {s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}
//                     </td>
//                     <td><StatusBadge status={s.status} /></td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // BORROWBOOKS
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/member/BorrowBooks.jsx
// // PURPOSE: Member selects up to 3 available books and submits
// //          a borrow request to the librarian/admin.
// //
// // THREE INNER TABS:
// //   📚 Borrow Books  — table of available books, select up to 3
// //   📋 My Requests   — member's own past borrow requests
// //   📖 My Borrowings — individual book records (due dates, fines)
// //
// // FULL BORROW FLOW:
// //   1. Member needs active subscription (Standard or Pro)
// //   2. Member clicks rows to select books (amber checkbox appears)
// //   3. Confirmation bar shows selected books + "Submit" button
// //   4. POST /api/borrow/request → { memberId, bookIds: [1,2,3] }
// //   5. Backend validates: subscription, limit, no pending request, availability
// //   6. On success: request created with status PENDING
// //   7. Librarian/Admin approves via ManageBorrowings → due date set
// //   8. Member sees their borrowings in "My Borrowings" tab
// //   9. Member returns book physically to librarian
// //   10. Librarian marks returned → fine calculated if overdue
// //   11. Total fine ≥ ₹500 → member auto-blocked
// //   12. Member pays fine → librarian unblocks
// //
// // BACKEND ERROR CODES (returned as plain text):
// //   NO_SUBSCRIPTION     — member has no active subscription
// //   SUBSCRIPTION_EXPIRED — subscription exists but expired
// //   LIMIT_EXCEEDED:max:current — plan limit exceeded
// //   BLOCKED             — member account is blocked due to fines
// //
// // PROPS:
// //   user — the logged-in member object { id, name, ... }
// // ============================================================


// function BorrowBooks({ user }) {

//   // ── STATE ────────────────────────────────────────────────
//   const [books,        setBooks]        = useState([]);   // all books from API
//   const [selected,     setSelected]     = useState([]);   // currently selected books (max 3)
//   const [myRequests,   setMyRequests]   = useState([]);   // this member's borrow requests
//   const [myBorrowings, setMyBorrowings] = useState([]);   // individual borrowing records
//   const [subscription, setSubscription] = useState(null); // this member's active subscription
//   const [loading,      setLoading]      = useState(true);
//   const [submitting,   setSubmitting]   = useState(false);
//   const [msg,          setMsg]          = useState({ text: "", type: "" });
//   const [search,       setSearch]       = useState("");
//   const [tab,          setTab]          = useState("borrow");  // active inner tab

//   // ── FETCH ALL DATA ───────────────────────────────────────
//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       // 4 API calls simultaneously
//       const [booksRes, reqRes, borRes, subRes] = await Promise.allSettled([
//         fetch(`${API}/books`,                            { headers: authHeaders() }),
//         fetch(`${API}/borrow/requests/my/${user.id}`,    { headers: authHeaders() }),
//         fetch(`${API}/borrow/borrowings/my/${user.id}`,  { headers: authHeaders() }),
//         fetch(`${API}/subscriptions/my/${user.id}`,      { headers: authHeaders() }),
//       ]);
//       if (booksRes.status === "fulfilled" && booksRes.value.ok) setBooks(await booksRes.value.json());
//       if (reqRes.status   === "fulfilled" && reqRes.value.ok)   setMyRequests(await reqRes.value.json());
//       if (borRes.status   === "fulfilled" && borRes.value.ok)   setMyBorrowings(await borRes.value.json());
//       if (subRes.status   === "fulfilled" && subRes.value.ok)   setSubscription(await subRes.value.json());
//     } catch {} finally { setLoading(false); }
//   };

//   useEffect(() => { fetchAll(); }, []);

//   // ── TOGGLE BOOK SELECTION ────────────────────────────────
//   // Click a row to add/remove it from the selection
//   const toggleSelect = (book) => {
//     if (selected.find(b => b.id === book.id)) {
//       // Already selected → deselect (remove from array)
//       setSelected(selected.filter(b => b.id !== book.id));
//     } else {
//       // Not selected → check if at limit
//       if (selected.length >= MAX_BORROW_AT_ONCE) {
//         setMsg({ text: `⚠️ You can select at most ${MAX_BORROW_AT_ONCE} books per request`, type: "error" });
//         setTimeout(() => setMsg({ text: "", type: "" }), 3000);
//         return;
//       }
//       // Add to selection
//       setSelected([...selected, book]);
//     }
//   };

//   // ── SUBMIT BORROW REQUEST ────────────────────────────────
//   const submitRequest = async () => {
//     if (selected.length === 0) {
//       setMsg({ text: "Please select at least 1 book", type: "error" });
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const res = await fetch(`${API}/borrow/request`, {
//         method:  "POST",
//         headers: authHeaders(),
//         body:    JSON.stringify({
//           memberId: user.id,
//           bookIds:  selected.map(b => b.id),   // send array of selected book IDs
//         }),
//       });
//       const txt = await res.text();

//       if (res.ok) {
//         setMsg({ text: "✅ Borrow request submitted! Waiting for librarian approval.", type: "success" });
//         setSelected([]);   // clear selection
//         fetchAll();        // refresh all data

//       } else if (txt === "NO_SUBSCRIPTION") {
//         setMsg({ text: "❌ You need an active subscription to borrow books. Go to the Subscription tab.", type: "error" });

//       } else if (txt === "SUBSCRIPTION_EXPIRED") {
//         setMsg({ text: "❌ Your subscription has expired. Please renew it.", type: "error" });

//       } else if (txt.startsWith("LIMIT_EXCEEDED")) {
//         // Format: "LIMIT_EXCEEDED:maxAllowed:currentCount"
//         const [, max, cur] = txt.split(":");
//         setMsg({ text: `❌ Book limit exceeded! Your plan allows ${max} books total. You currently have ${cur} borrowed.`, type: "error" });

//       } else {
//         setMsg({ text: `❌ ${txt}`, type: "error" });
//       }
//     } catch {
//       setMsg({ text: "❌ Network error. Please try again.", type: "error" });
//     } finally {
//       setSubmitting(false);
//     }
//     setTimeout(() => setMsg({ text: "", type: "" }), 6000);
//   };

//   // ── DERIVED DATA ─────────────────────────────────────────
//   // Only books with at least 1 available copy
//   const availableBooks = books.filter(b => (b.availableCopies ?? 0) > 0);

//   // Apply search filter
//   const filteredBooks = availableBooks.filter(b =>
//     !search ||
//     b.title?.toLowerCase().includes(search.toLowerCase()) ||
//     b.author?.toLowerCase().includes(search.toLowerCase())
//   );

//   // Does this member already have a PENDING request? (block new request if yes)
//   const hasPendingRequest = myRequests.some(r => r.status === "PENDING");

//   // Books currently out (BORROWED or OVERDUE)
//   const currentlyBorrowed = myBorrowings.filter(b => b.status === "BORROWED" || b.status === "OVERDUE");

//   // Total unpaid fine amount across all borrowings
//   const totalFine = myBorrowings
//     .filter(b => !b.finePaid && b.fineAmount > 0)
//     .reduce((sum, b) => sum + b.fineAmount, 0);

//   // Is subscription active?
//   const subActive = subscription && subscription.status !== "NONE" && subscription.status !== "EXPIRED";
//   const maxBooks  = subscription?.maxBooks ?? 0;

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div>
//       <div className="page-header">
//         <h1>Borrow Books</h1>
//         <p>Select up to {MAX_BORROW_AT_ONCE} books and submit a request — librarian will approve within 24 hours</p>
//       </div>

//       {/* ── Summary cards: subscription, limit, borrowed count, fine ── */}
//       <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
//         {[
//           { icon:"🎫", label:"Subscription",       value: subActive ? subscription.planName : "None",              color: subActive ? "var(--teal2)" : "#F87171" },
//           { icon:"📚", label:"Max Books Allowed",  value: subActive ? (maxBooks >= 999 ? "Unlimited" : maxBooks) : "—", color:"var(--amber)" },
//           { icon:"📖", label:"Currently Borrowed", value: currentlyBorrowed.length,                                 color:"#818CF8" },
//           { icon:"💰", label:"Outstanding Fine",   value: `₹${totalFine.toFixed(0)}`,                              color: totalFine > 0 ? "#F87171" : "var(--teal2)" },
//         ].map((s, i) => (
//           <div className="stat-card" key={i}>
//             <div className="stat-icon">{s.icon}</div>
//             <div className="stat-num" style={{ fontSize:22, color:s.color }}>{s.value}</div>
//             <div className="stat-label">{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* ── Inner tabs ── */}
//       <div className="filter-tabs">
//         {[
//           { id:"borrow",   label:"📚 Borrow Books"   },
//           { id:"requests", label:"📋 My Requests"     },
//           { id:"history",  label:"📖 My Borrowings"   },
//         ].map(t => (
//           <button key={t.id} className={`filter-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {/* Feedback message */}
//       {msg.text && (
//         <div className={msg.type === "success" ? "msg-success" : "msg-error"} style={{ marginBottom: 16 }}>
//           {msg.text}
//         </div>
//       )}

//       {/* ════════════════════════════════════════════════════
//           TAB 1: SELECT BOOKS TO BORROW
//       ════════════════════════════════════════════════════ */}
//       {tab === "borrow" && (
//         <>
//           {/* Warning: no active subscription */}
//           {!subActive && (
//             <div className="msg-warn" style={{ marginBottom:20, display:"flex", alignItems:"center", gap:12 }}>
//               <span style={{ fontSize:22 }}>⚠️</span>
//               <span>You need an active <strong>Subscription</strong> to borrow books. Go to the Subscription tab.</span>
//             </div>
//           )}

//           {/* Warning: already has a pending request */}
//           {hasPendingRequest && (
//             <div style={{ background:"rgba(79,70,229,0.10)", border:"1.5px solid rgba(79,70,229,0.30)", borderRadius:14, padding:"16px 20px", marginBottom:20 }}>
//               <span style={{ fontWeight:700, color:"#818CF8" }}>⏳ You already have a pending borrow request.</span>
//               <span style={{ fontSize:13, color:"var(--text2)", marginLeft:8 }}>
//                 Wait for librarian approval before submitting a new request.
//               </span>
//             </div>
//           )}

//           {/* Selected books confirmation bar — shown when 1+ books are selected */}
//           {selected.length > 0 && (
//             <div className="card card-glow" style={{ marginBottom:20, background:"linear-gradient(135deg,rgba(232,160,32,0.08),rgba(13,148,136,0.06))" }}>
//               <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
//                 <div>
//                   <div style={{ fontWeight:700, marginBottom:8 }}>
//                     📦 Selected ({selected.length}/{MAX_BORROW_AT_ONCE})
//                   </div>
//                   {/* Show chips for each selected book with × to deselect */}
//                   <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
//                     {selected.map(b => (
//                       <div key={b.id} style={{ background:"var(--surface)", border:"1.5px solid var(--border2)", borderRadius:10, padding:"6px 14px", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
//                         {b.title}
//                         {/* × button to remove this book from selection */}
//                         <span
//                           style={{ cursor:"pointer", color:"var(--text3)", fontSize:16 }}
//                           onClick={() => toggleSelect(b)}
//                         >×</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//                 {/* Submit button — disabled if pending request exists or no subscription */}
//                 <button
//                   className="btn-primary"
//                   onClick={submitRequest}
//                   disabled={submitting || hasPendingRequest || !subActive}
//                 >
//                   {submitting ? "Submitting…" : "📨 Submit Borrow Request"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Available books table */}
//           <div className="card">
//             <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, gap:12 }}>
//               <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22 }}>
//                 Available Books ({availableBooks.length})
//               </h3>
//               <input
//                 placeholder="Search title or author…"
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 style={{ maxWidth:280 }}
//               />
//             </div>

//             {loading ? (
//               <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
//             ) : filteredBooks.length === 0 ? (
//               <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//                 <div style={{ fontSize:44, marginBottom:12 }}>📭</div>
//                 <p>{search ? "No results for that search" : "No available books right now"}</p>
//               </div>
//             ) : (
//               <div className="table-wrap">
//                 <table>
//                   <thead>
//                     <tr><th>Select</th><th style={{minWidth:220}}>Book</th><th>Author</th><th>Department</th><th>Copies</th></tr>
//                   </thead>
//                   <tbody>
//                     {filteredBooks.map((b, i) => {
//                       const isSelected = !!selected.find(s => s.id === b.id);
//                       // Pre-compute gradient for this book to avoid complex template literal in JSX
//                       const GRAD_START = ["#667eea","#f093fb","#4facfe","#43e97b","#fa709a","#a18cd1","#fd7043","#2196f3"];
//                       const GRAD_END   = ["#764ba2","#f5576c","#00f2fe","#38f9d7","#fee140","#fbc2eb","#ff8a65","#21cbf3"];
//                       const gIdx       = (b.title?.charCodeAt(0) || 0) % 8;
//                       const bookGrad   = `linear-gradient(135deg, ${GRAD_START[gIdx]}, ${GRAD_END[gIdx]})`;
//                       const cleanCover = b.coverImageUrl
//                         ? b.coverImageUrl.replace(/^uploads\/books\/covers\//, "").replace(/^covers\//, "")
//                         : null;

//                       return (
//                         // Clicking anywhere on the row toggles selection
//                         <tr
//                           key={i}
//                           style={{ cursor:"pointer", background: isSelected ? "rgba(232,160,32,0.06)" : "" }}
//                           onClick={() => toggleSelect(b)}
//                         >
//                           <td>
//                             {/* Visual amber checkbox */}
//                             <div style={{
//                               width: 22, height: 22,
//                               borderRadius: 6,
//                               border: `2px solid ${isSelected ? "var(--amber)" : "var(--border)"}`,
//                               background: isSelected ? "var(--amber)" : "transparent",
//                               display:"flex", alignItems:"center", justifyContent:"center",
//                               transition:"all 0.15s",
//                             }}>
//                               {isSelected && (
//                                 <span style={{ color:"#0D0E14", fontSize:13, fontWeight:900 }}>✓</span>
//                               )}
//                             </div>
//                           </td>
//                           {/* Title cell — shows mini cover + title + genre tag */}
//                           <td>
//                             <div style={{ display:"flex", alignItems:"center", gap:12 }}>
//                               {/* Mini book cover — 40×54px */}
//                               <div style={{
//                                 width: 40, height: 54, borderRadius: 6, overflow:"hidden",
//                                 flexShrink: 0, background: bookGrad,
//                                 display:"flex", alignItems:"center", justifyContent:"center",
//                                 fontSize: 18, fontWeight: 800,
//                                 color: "rgba(255,255,255,0.8)",
//                                 boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
//                                 position: "relative",
//                               }}>
//                                 {/* Show uploaded cover if available, else show letter */}
//                                 {cleanCover ? (
//                                   <img
//                                     src={`http://localhost:8080/images/covers/${cleanCover}`}
//                                     alt={b.title}
//                                     style={{ width:"100%", height:"100%", objectFit:"cover" }}
//                                     onError={(e) => { e.target.style.display="none"; }}
//                                   />
//                                 ) : (
//                                   <span>{b.title?.[0]?.toUpperCase()}</span>
//                                 )}
//                               </div>
//                               {/* Title + genre */}
//                               <div>
//                                 <div style={{ fontWeight:600, fontSize:13 }}>{b.title}</div>
//                                 {b.genre && (
//                                   <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{b.genre}</div>
//                                 )}
//                               </div>
//                             </div>
//                           </td>
//                           <td style={{ color:"var(--text2)" }}>{b.author}</td>
//                           <td><span className="tag tag-librarian">{b.department || "—"}</span></td>
//                           <td>
//                             <span style={{ color:"var(--teal2)", fontWeight:700 }}>{b.availableCopies}</span>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </>
//       )}

//       {/* ════════════════════════════════════════════════════
//           TAB 2: MY BORROW REQUESTS
//           Shows all requests this member has submitted.
//       ════════════════════════════════════════════════════ */}
//       {tab === "requests" && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//             My Borrow Requests
//           </h3>
//           {myRequests.length === 0 ? (
//             <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//               <div style={{ fontSize:44, marginBottom:12 }}>📋</div>
//               <p>You haven't submitted any borrow requests yet</p>
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr><th>Books Requested</th><th>Count</th><th>Requested On</th><th>Due Date</th><th>Status</th></tr>
//                 </thead>
//                 <tbody>
//                   {myRequests.map((r, i) => (
//                     <tr key={i}>
//                       {/* bookTitles = comma-separated string */}
//                       <td style={{ fontWeight:600, maxWidth:280 }}>{r.bookTitles}</td>
//                       <td style={{ textAlign:"center", color:"var(--amber)", fontWeight:700 }}>{r.bookCount}</td>
//                       <td style={{ color:"var(--text2)" }}>
//                         {r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : "—"}
//                       </td>
//                       <td style={{ color:"var(--teal2)" }}>
//                         {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}
//                       </td>
//                       <td><StatusBadge status={r.status} /></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ════════════════════════════════════════════════════
//           TAB 3: MY BORROWINGS (individual book records)
//           Shows each book the member borrowed with due date, fine, status.
//       ════════════════════════════════════════════════════ */}
//       {tab === "history" && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//             My Borrowings
//           </h3>

//           {/* Fine warning banner — shown when there are outstanding fines */}
//           {totalFine > 0 && (
//             <div className="msg-error" style={{ marginBottom:18 }}>
//               ⚠️ Outstanding Fine: <strong>₹{totalFine.toFixed(0)}</strong>
//               {totalFine >= FINE_BLOCK_LIMIT && (
//                 " — Your account is BLOCKED. Please pay the fine to the librarian to restore access."
//               )}
//             </div>
//           )}

//           {myBorrowings.length === 0 ? (
//             <div style={{ textAlign:"center", padding:48, color:"var(--text2)" }}>
//               <div style={{ fontSize:44, marginBottom:12 }}>📚</div>
//               <p>No borrowings yet</p>
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Book</th><th>Author</th><th>Borrowed On</th>
//                     <th>Due Date</th><th>Returned</th><th>Fine</th><th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {myBorrowings.map((b, i) => (
//                     <tr key={i}>
//                       <td style={{ fontWeight:600 }}>{b.bookTitle}</td>
//                       <td style={{ color:"var(--text2)" }}>{b.bookAuthor}</td>
//                       <td style={{ color:"var(--text2)" }}>
//                         {b.borrowedAt ? new Date(b.borrowedAt).toLocaleDateString() : "—"}
//                       </td>
//                       {/* Red due date if overdue */}
//                       <td style={{ color: b.status === "OVERDUE" ? "#F87171" : "var(--teal2)", fontWeight:600 }}>
//                         {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}
//                       </td>
//                       <td style={{ color:"var(--text2)" }}>
//                         {b.returnedAt ? new Date(b.returnedAt).toLocaleDateString() : "—"}
//                       </td>
//                       <td style={{ color: b.fineAmount > 0 ? "#F87171" : "var(--teal2)", fontWeight:700 }}>
//                         ₹{b.fineAmount?.toFixed(0) || 0}
//                         {b.finePaid && (
//                           <span style={{ color:"var(--teal2)", fontSize:10, marginLeft:4 }}>✓ paid</span>
//                         )}
//                       </td>
//                       <td><StatusBadge status={b.status} /></td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // ADMINDASHBOARD
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/admin/AdminDashboard.jsx
// // PURPOSE: The Admin role's main dashboard.
// //
// // ADMIN IS THE MOST POWERFUL ROLE. THEY CAN:
// //   - Manage all books (add, edit, delete, upload covers/PDFs)
// //   - Approve/reject book reservations (unavailable book waitlist)
// //   - Approve/reject borrow requests + manage returns and fines
// //   - Edit subscription plan settings (price, duration, max books)
// //   - Approve new Librarian accounts (Librarians can't log in until approved)
// //   - View all registered users
// //   - Change their own password
// //
// // TABS (sidebar nav):
// //   🏠 Dashboard       — stats overview + quick action tiles
// //   📖 Book Management — uses the existing BookManagement component
// //   📌 Reservations    — ManageReservations shared component
// //   📦 Manage Borrows  — ManageBorrowings shared component
// //   🎫 Subscriptions   — AdminSubscriptionManager (Admin ONLY)
// //   ⏳ Pending Approvals — approve new librarian accounts
// //   👥 All Users       — view all registered accounts
// //   👤 My Profile      — ProfilePanel shared component
// //
// // PROPS:
// //   user     — the logged-in admin object { id, name, email, role, ... }
// //   onLogout — function called when "Sign Out" is clicked
// // ============================================================


// function AdminDashboard({ user, onLogout }) {

//   // ── STATE ────────────────────────────────────────────────
//   // Which tab is currently shown in the main content area
//   const [activeTab, setActiveTab] = useState("home");

//   // Librarian accounts waiting for approval
//   const [pendingUsers,   setPendingUsers]   = useState([]);
//   const [allUsers,       setAllUsers]       = useState([]);
//   const [loadingPending, setLoadingPending] = useState(false);
//   const [loadingAll,     setLoadingAll]     = useState(false);
//   const [actionMsg,      setActionMsg]      = useState("");

//   // Book stats from shared hook (total, available, unavailable)
//   const bs = useBookStats();

//   // ── FETCH FUNCTIONS ──────────────────────────────────────
//   const fetchPending = async () => {
//     setLoadingPending(true);
//     try {
//       const r = await fetch(`${API}/admin/pending-users`);
//       if (r.ok) setPendingUsers(await r.json());
//     } catch {} finally { setLoadingPending(false); }
//   };

//   const fetchAllUsers = async () => {
//     setLoadingAll(true);
//     try {
//       const r = await fetch(`${API}/admin/all-users`);
//       if (r.ok) setAllUsers(await r.json());
//     } catch {} finally { setLoadingAll(false); }
//   };

//   // Refetch the relevant data whenever the active tab changes
//   useEffect(() => {
//     if (activeTab === "home")    { fetchPending(); fetchAllUsers(); }
//     if (activeTab === "pending") fetchPending();
//     if (activeTab === "users")   fetchAllUsers();
//   }, [activeTab]);

//   // ── APPROVE LIBRARIAN ACCOUNT ────────────────────────────
//   const approveUser = async (email) => {
//     try {
//       const r = await fetch(`${API}/admin/approve?email=${encodeURIComponent(email)}`, { method: "POST" });
//       setActionMsg("✅ " + await r.text());
//       fetchPending();
//       fetchAllUsers();
//     } catch {
//       setActionMsg("❌ Approval failed.");
//     }
//   };

//   // ── SIDEBAR NAV ITEMS ────────────────────────────────────
//   // badge: shows red number if there are pending librarian approvals
//   const navItems = [
//     { id:"home",          icon:"🏠", label:"Dashboard"           },
//     { id:"books",         icon:"📖", label:"Book Management"     },
//     { id:"reservations",  icon:"📌", label:"Reservations"        },
//     { id:"borrowings",    icon:"📦", label:"Manage Borrows"      },
//     { id:"subscriptions", icon:"🎫", label:"Subscriptions"       },
//     { id:"pending",       icon:"⏳", label:"Pending Approvals",  badge: pendingUsers.length },
//     { id:"users",         icon:"👥", label:"All Users"           },
//     { id:"profile",       icon:"👤", label:"My Profile"          },
//   ];

//   // ── HOME TAB STATS ───────────────────────────────────────
//   const STATS = [
//     { icon:"📚", num: bs.total,                                         label:"Total Books",   c:"var(--amber)"  },
//     { icon:"✅", num: bs.available,                                      label:"Available",     c:"var(--teal2)"  },
//     { icon:"❌", num: bs.unavailable,                                    label:"Unavailable",   c:"#F87171"       },
//     { icon:"👥", num: allUsers.length,                                   label:"Total Users",   c:"#818CF8"       },
//     { icon:"⏳", num: pendingUsers.length,                               label:"Pending",       c:"var(--amber2)" },
//     { icon:"📖", num: allUsers.filter(u=>u.role==="LIBRARIAN").length,  label:"Librarians",    c:"var(--teal2)"  },
//   ];

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div className="app-layout">  {/* flex row: sidebar left, main right */}

//       <Sidebar
//         subtitle="Admin Panel"
//         navItems={navItems}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         user={user}
//         roleLabel="Admin"
//         onLogout={onLogout}
//       />

//       <main className="main-content">

//         {/* BookManagement gets full width (no .main-padded wrapper) */}
//         {activeTab === "books" && <BookManagement userRole="ADMIN" />}

//         {/* All other tabs get standard padding */}
//         {activeTab !== "books" && (
//           <div className="main-padded">

//             {/* ════ HOME TAB ════ */}
//             {activeTab === "home" && (
//               <div className="fade-up">
//                 <div className="page-header">
//                   <h1>Welcome back, {user.name?.split(" ")[0]}! 👋</h1>
//                   <p>Here's your complete library system overview</p>
//                 </div>

//                 {/* Live stats grid */}
//                 <div className="stats-grid">
//                   {STATS.map((s, i) => (
//                     <div className="stat-card" key={i}>
//                       <div className="stat-icon">{s.icon}</div>
//                       <div className="stat-num" style={{ color: s.c }}>{s.num}</div>
//                       <div className="stat-label">{s.label}</div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Quick Action tiles — clicking navigates to that tab */}
//                 <div className="card">
//                   <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//                     Quick Actions
//                   </h3>
//                   <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
//                     {[
//                       { icon:"📖", label:"Manage Books",       c:"rgba(232,160,32,0.15)", t:"books"         },
//                       { icon:"📌", label:"Reservations",       c:"rgba(13,148,136,0.15)", t:"reservations"  },
//                       { icon:"📦", label:"Manage Borrows",     c:"rgba(79,70,229,0.15)",  t:"borrowings"    },
//                       { icon:"🎫", label:"Subscriptions",      c:"rgba(232,160,32,0.15)", t:"subscriptions" },
//                       { icon:"⏳", label:"Pending Approvals",  c:"rgba(245,158,11,0.15)", t:"pending"       },
//                       { icon:"👥", label:"All Users",          c:"rgba(79,70,229,0.15)",  t:"users"         },
//                     ].map((a, i) => (
//                       <div key={i} className="action-card" onClick={() => setActiveTab(a.t)}>
//                         <div className="action-card-icon" style={{ background: a.c }}>{a.icon}</div>
//                         <div style={{ fontWeight:600, fontSize:14 }}>{a.label}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Shared components — just render them, they handle their own data */}
//             {activeTab === "reservations"  && <ManageReservations />}
//             {activeTab === "borrowings"    && <ManageBorrowings userRole="ADMIN" />}
//             {activeTab === "subscriptions" && <AdminSubscriptionManager />}

//             {/* ════ PENDING APPROVALS TAB ════ */}
//             {activeTab === "pending" && (
//               <div className="fade-up">
//                 <div className="page-header">
//                   <h1>Pending Approvals</h1>
//                   <p>Review and approve new Librarian account registrations</p>
//                 </div>
//                 {actionMsg && <div className="msg-success" style={{ marginBottom:16 }}>{actionMsg}</div>}
//                 <div className="card">
//                   {loadingPending ? (
//                     <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
//                   ) : pendingUsers.length === 0 ? (
//                     <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}>
//                       <div style={{ fontSize:48, marginBottom:14 }}>✅</div>
//                       <p>No pending approvals — all clear!</p>
//                     </div>
//                   ) : (
//                     <div className="table-wrap">
//                       <table>
//                         <thead>
//                           <tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr>
//                         </thead>
//                         <tbody>
//                           {pendingUsers.map((u, i) => (
//                             <tr key={i}>
//                               <td style={{ fontWeight:600 }}>{u.name}</td>
//                               <td style={{ color:"var(--text2)" }}>{u.email}</td>
//                               <td>
//                                 <span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span>
//                               </td>
//                               <td>
//                                 <button className="btn-success" onClick={() => approveUser(u.email)}>
//                                   ✅ Approve
//                                 </button>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* ════ ALL USERS TAB ════ */}
//             {activeTab === "users" && (
//               <div className="fade-up">
//                 <div className="page-header">
//                   <h1>All Users</h1>
//                   <p>Every registered account in the system</p>
//                 </div>
//                 <div className="card">
//                   {loadingAll ? (
//                     <div style={{ textAlign:"center", padding:48 }}><Spinner size={28} /></div>
//                   ) : (
//                     <div className="table-wrap">
//                       <table>
//                         <thead>
//                           <tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Approved</th></tr>
//                         </thead>
//                         <tbody>
//                           {allUsers.map((u, i) => (
//                             <tr key={i}>
//                               <td style={{ fontWeight:600 }}>{u.name}</td>
//                               <td style={{ color:"var(--text2)" }}>{u.email}</td>
//                               <td>
//                                 <span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span>
//                               </td>
//                               <td>
//                                 <span className={`tag ${u.verified ? "tag-verified" : "tag-pending"}`}>
//                                   {u.verified ? "Yes" : "No"}
//                                 </span>
//                               </td>
//                               <td>
//                                 <span className={`tag ${u.approved ? "tag-verified" : "tag-pending"}`}>
//                                   {u.approved ? "Yes" : "No"}
//                                 </span>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === "profile" && <ProfilePanel user={user} />}

//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // LIBRARIANDASHBOARD
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/librarian/LibrarianDashboard.jsx
// // PURPOSE: The Librarian role's main dashboard.
// //
// // LIBRARIAN CAPABILITIES:
// //   - Manage books (add, edit, delete — same as Admin)
// //   - Approve/reject book reservations (unavailable book waitlist)
// //   - Approve/reject borrow requests, mark returns, manage fines
// //   - Change their own password
// //
// // WHAT LIBRARIAN CANNOT DO (vs Admin):
// //   ❌ Edit subscription plan pricing/settings (Admin only)
// //   ❌ Approve/reject new Librarian accounts (Admin only)
// //   ❌ View all users list (Admin only)
// //
// // TABS (sidebar nav):
// //   🏠 Dashboard       — stats + quick actions
// //   📖 Manage Books    — BookManagement component
// //   📌 Reservations    — ManageReservations shared component
// //   📦 Manage Borrows  — ManageBorrowings shared component
// //   👤 My Profile      — ProfilePanel shared component
// //
// // PROPS:
// //   user     — the logged-in librarian object { id, name, email, role, ... }
// //   onLogout — function called when "Sign Out" is clicked
// // ============================================================


// function LibrarianDashboard({ user, onLogout }) {

//   const [activeTab, setActiveTab] = useState("home");

//   // Book counts from shared hook
//   const bs = useBookStats();

//   // ── SIDEBAR NAV ──────────────────────────────────────────
//   const navItems = [
//     { id:"home",         icon:"🏠", label:"Dashboard"      },
//     { id:"books",        icon:"📖", label:"Manage Books"   },
//     { id:"reservations", icon:"📌", label:"Reservations"   },
//     { id:"borrowings",   icon:"📦", label:"Manage Borrows" },
//     { id:"profile",      icon:"👤", label:"My Profile"     },
//   ];

//   // ── HOME TAB STATS ───────────────────────────────────────
//   const STATS = [
//     { icon:"📚", num: bs.total,       label:"Total Books",  c:"var(--amber)"  },
//     { icon:"✅", num: bs.available,   label:"Available",    c:"var(--teal2)"  },
//     { icon:"❌", num: bs.unavailable, label:"Unavailable",  c:"#F87171"       },
//   ];

//   // ── RENDER ───────────────────────────────────────────────
//   return (
//     <div className="app-layout">

//       <Sidebar
//         subtitle="Librarian Panel"
//         navItems={navItems}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         user={user}
//         roleLabel="Librarian"
//         onLogout={onLogout}
//       />

//       <main className="main-content">

//         {/* BookManagement: full width, no padding wrapper */}
//         {activeTab === "books" && <BookManagement userRole="LIBRARIAN" />}

//         {activeTab !== "books" && (
//           <div className="main-padded">

//             {/* ════ HOME TAB ════ */}
//             {activeTab === "home" && (
//               <div className="fade-up">
//                 <div className="page-header">
//                   <h1>Librarian Dashboard</h1>
//                   <p>Manage the book collection and handle all member requests</p>
//                 </div>

//                 {/* Stats */}
//                 <div className="stats-grid">
//                   {STATS.map((s, i) => (
//                     <div className="stat-card" key={i}>
//                       <div className="stat-icon">{s.icon}</div>
//                       <div className="stat-num" style={{ color: s.c }}>{s.num}</div>
//                       <div className="stat-label">{s.label}</div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Quick Actions */}
//                 <div className="card">
//                   <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//                     Quick Actions
//                   </h3>
//                   <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
//                     {[
//                       { icon:"📖", label:"Manage Books",   c:"rgba(232,160,32,0.15)", t:"books"        },
//                       { icon:"📌", label:"Reservations",   c:"rgba(13,148,136,0.15)", t:"reservations" },
//                       { icon:"📦", label:"Manage Borrows", c:"rgba(79,70,229,0.15)",  t:"borrowings"   },
//                     ].map((a, i) => (
//                       <div key={i} className="action-card" onClick={() => setActiveTab(a.t)}>
//                         <div className="action-card-icon" style={{ background: a.c }}>{a.icon}</div>
//                         <div style={{ fontWeight:600, fontSize:14 }}>{a.label}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === "reservations" && <ManageReservations />}
//             {activeTab === "borrowings"   && <ManageBorrowings userRole="LIBRARIAN" />}
//             {activeTab === "profile"      && <ProfilePanel user={user} />}

//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════
// // MEMBERDASHBOARD
// // ═══════════════════════════════════════════════════════════════════════════

// // ============================================================
// // FILE: src/pages/member/MemberDashboard.jsx
// // PURPOSE: The Member role's main dashboard.
// //
// // MEMBER CAPABILITIES:
// //   - Browse all books (read-only via BookManagement with userRole="MEMBER")
// //   - Borrow available books (select 1-3, submit request)
// //   - Reserve unavailable books (join waitlist)
// //   - Manage their subscription (Standard or Pro plan)
// //   - View their own profile + change password
// //
// // WHAT MEMBER CANNOT DO:
// //   ❌ Add/edit/delete books
// //   ❌ See other members' data
// //   ❌ Approve/reject anything
// //   ❌ Edit subscription plan settings
// //
// // TABS (sidebar nav):
// //   🏠 Dashboard     — welcome banner + stats + quick actions
// //   🔍 Browse Books  — BookManagement in read-only mode
// //   📦 Borrow Books  — BorrowBooks component (select + submit)
// //   📌 Reserve Books — MemberReservations component
// //   🎫 Subscription  — MemberSubscriptionPage component
// //   👤 My Profile    — ProfilePanel shared component
// //
// // SUBSCRIPTION REQUIREMENT:
// //   Member MUST have an active Standard or Pro subscription
// //   to submit borrow requests. Without it, the backend rejects
// //   the request with "NO_SUBSCRIPTION".
// //
// // PROPS:
// //   user     — the logged-in member object { id, name, email, role, ... }
// //   onLogout — function called when "Sign Out" is clicked
// // ============================================================


// // ══════════════════════════════════════════════════════════════════════════════
// // MY BOOKS PAGE
// // ══════════════════════════════════════════════════════════════════════════════
// //
// // Shows a member's COMPLETE borrowing picture in two tabs:
// //
// //   Tab 1 — "Currently Borrowed"
// //     Books the member has right now (status = BORROWED or OVERDUE).
// //     Each row shows:
// //       • Book name & author
// //       • Issue date (when they picked it up)
// //       • Due date    (when they must return it)
// //       • Days left   (green if ≥3 days, amber if 1-2, red if overdue)
// //       • Fine so far (₹10/day overdue, live calculated)
// //       • Status badge
// //     An urgent red banner appears at the top if any book is overdue.
// //
// //   Tab 2 — "Borrowing History"
// //     ALL past borrowings including returned ones.
// //     Each row shows:
// //       • Book name & author
// //       • Issue date
// //       • Due date
// //       • Return date (or "Not returned" if still out)
// //       • Penalty/fine (₹0 if returned on time, ₹X if late)
// //       • Fine paid status (✓ paid / unpaid)
// //       • Status badge
// //
// // API USED:
// //   GET /api/borrow/borrowings/my/{memberId}
// //   This endpoint auto-calculates fines and marks OVERDUE on every fetch.
// //   Returns array of Borrowing objects.
// //
// // PROPS:
// //   user — logged-in member { id, name, ... }
// // ══════════════════════════════════════════════════════════════════════════════
// function MyBooks({ user }) {

//   // ── STATE ─────────────────────────────────────────────────────────────────
//   const [borrowings, setBorrowings] = useState([]); // all borrowing records
//   const [loading,    setLoading]    = useState(true);
//   const [tab,        setTab]        = useState("current"); // "current" | "history"

//   // ── FETCH BORROWINGS ──────────────────────────────────────────────────────
//   // Called on mount. Backend auto-marks overdue + calculates fines on this call.
//   const fetchBorrowings = async () => {
//     setLoading(true);
//     try {
//       const t = localStorage.getItem("token");
//       const h = t ? { Authorization: `Bearer ${t}` } : {};
//       const r = await fetch(`http://localhost:8080/api/borrow/borrowings/my/${user.id}`, { headers: h });
//       if (r.ok) setBorrowings(await r.json());
//     } catch {}
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetchBorrowings(); }, []);

//   // ── DERIVED DATA ──────────────────────────────────────────────────────────
//   // Books currently in the member's hands
//   const currentBooks = borrowings.filter(b => b.status === "BORROWED" || b.status === "OVERDUE");

//   // All history including returned
//   const allHistory = [...borrowings].sort(
//     (a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt) // newest first
//   );

//   // Total unpaid fines
//   const totalFine = borrowings
//     .filter(b => !b.finePaid && b.fineAmount > 0)
//     .reduce((sum, b) => sum + b.fineAmount, 0);

//   // Are any books overdue?
//   const hasOverdue = currentBooks.some(b => b.status === "OVERDUE");

//   // ── HELPER: Days remaining label ──────────────────────────────────────────
//   // Returns { text, color } for the "days left" column
//   const daysLeft = (dueDateStr) => {
//     if (!dueDateStr) return { text: "—", color: "var(--text3)" };
//     const diff = Math.ceil((new Date(dueDateStr) - new Date()) / (1000 * 60 * 60 * 24));
//     if (diff < 0)  return { text: `${Math.abs(diff)}d overdue`, color: "#F87171" };
//     if (diff === 0) return { text: "Due today!",                color: "#F87171" };
//     if (diff <= 2)  return { text: `${diff}d left`,             color: "#FCD34D" };
//     return             { text: `${diff}d left`,                 color: "var(--teal2)" };
//   };

//   // ── RENDER ────────────────────────────────────────────────────────────────
//   return (
//     <div>
//       {/* Page header */}
//       <div className="page-header">
//         <h1>My Books</h1>
//         <p>Track your currently borrowed books, due dates, and complete borrowing history</p>
//       </div>

//       {/* ── Summary stat strip ── */}
//       <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:24 }}>
//         {[
//           { icon:"📖", label:"Currently Borrowed", value: currentBooks.length,                           color:"var(--amber)"  },
//           { icon:"⚠️", label:"Overdue",            value: currentBooks.filter(b=>b.status==="OVERDUE").length, color:"#F87171" },
//           { icon:"✅", label:"Total Returned",      value: borrowings.filter(b=>b.status==="RETURNED").length, color:"var(--teal2)" },
//           { icon:"💰", label:"Outstanding Fine",    value: `₹${totalFine.toFixed(0)}`,                   color: totalFine > 0 ? "#F87171" : "var(--teal2)" },
//         ].map((s, i) => (
//           <div className="stat-card" key={i}>
//             <div className="stat-icon">{s.icon}</div>
//             <div className="stat-num" style={{ fontSize:26, color:s.color }}>{s.value}</div>
//             <div className="stat-label">{s.label}</div>
//           </div>
//         ))}
//       </div>

//       {/* ── Overdue urgent warning banner ── */}
//       {hasOverdue && (
//         <div style={{
//           background:"rgba(225,29,72,0.10)", border:"1.5px solid rgba(225,29,72,0.35)",
//           borderRadius:14, padding:"16px 22px", marginBottom:22,
//           display:"flex", alignItems:"center", gap:14,
//         }}>
//           <span style={{ fontSize:28 }}>🚨</span>
//           <div>
//             <div style={{ fontWeight:700, color:"#F87171", fontSize:15, marginBottom:3 }}>
//               You have overdue books!
//             </div>
//             <div style={{ fontSize:13, color:"var(--text2)" }}>
//               Fine is ₹10 per day per book. Please return them to avoid your account being blocked at ₹500.
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Fine warning (non-overdue but has fines) ── */}
//       {totalFine > 0 && !hasOverdue && (
//         <div className="msg-error" style={{ marginBottom:20 }}>
//           💰 You have an outstanding fine of <strong>₹{totalFine.toFixed(0)}</strong>.
//           Please pay at the library counter.
//         </div>
//       )}

//       {/* ── Inner tabs ── */}
//       <div className="filter-tabs">
//         <button
//           className={`filter-tab ${tab === "current" ? "active" : ""}`}
//           onClick={() => setTab("current")}
//         >
//           📖 Currently Borrowed
//           {currentBooks.length > 0 && (
//             <span style={{ marginLeft:6, background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"1px 7px", fontSize:10 }}>
//               {currentBooks.length}
//             </span>
//           )}
//         </button>
//         <button
//           className={`filter-tab ${tab === "history" ? "active" : ""}`}
//           onClick={() => setTab("history")}
//         >
//           📋 Borrowing History
//           <span style={{ marginLeft:6, background:"rgba(0,0,0,0.2)", borderRadius:10, padding:"1px 7px", fontSize:10 }}>
//             {allHistory.length}
//           </span>
//         </button>
//       </div>

//       {/* ════════════════════════════════════════════════════════════════════
//           TAB 1: CURRENTLY BORROWED
//           Shows only books still in the member's possession.
//           Due date column turns red when overdue.
//           "Days Left" column shows countdown with colour coding.
//       ════════════════════════════════════════════════════════════════════ */}
//       {tab === "current" && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//             Books You Currently Have
//           </h3>

//           {loading ? (
//             <div style={{ textAlign:"center", padding:48 }}>
//               <div style={{ width:32, height:32, border:"3px solid rgba(255,255,255,0.1)", borderTopColor:"var(--amber)", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto" }} />
//             </div>

//           ) : currentBooks.length === 0 ? (
//             <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}>
//               <div style={{ fontSize:52, marginBottom:16 }}>📭</div>
//               <p style={{ fontSize:16, fontWeight:600, marginBottom:8 }}>No books currently borrowed</p>
//               <p style={{ fontSize:13 }}>Go to "Borrow Books" to request books from the library</p>
//             </div>

//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Book</th>
//                     <th>Author</th>
//                     <th>Issue Date</th>
//                     <th>Due Date</th>
//                     <th>Days Left</th>
//                     <th>Fine (₹)</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentBooks.map((b, i) => {
//                     const dl = daysLeft(b.dueDate);
//                     return (
//                       <tr key={i}>
//                         {/* Book title — bold */}
//                         <td>
//                           <div style={{ fontWeight:700, fontSize:14 }}>{b.bookTitle}</div>
//                         </td>

//                         <td style={{ color:"var(--text2)" }}>{b.bookAuthor || "—"}</td>

//                         {/* Issue date */}
//                         <td style={{ color:"var(--text2)", fontSize:13 }}>
//                           {b.borrowedAt ? new Date(b.borrowedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
//                         </td>

//                         {/* Due date — red if overdue */}
//                         <td style={{ fontWeight:600, color: b.status === "OVERDUE" ? "#F87171" : "var(--teal2)" }}>
//                           {b.dueDate ? new Date(b.dueDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—"}
//                         </td>

//                         {/* Days remaining pill */}
//                         <td>
//                           <span style={{
//                             background: dl.color === "#F87171" ? "rgba(225,29,72,0.12)" :
//                                         dl.color === "#FCD34D" ? "rgba(245,158,11,0.12)" :
//                                                                  "rgba(13,148,136,0.12)",
//                             color: dl.color,
//                             border: `1px solid ${dl.color}44`,
//                             borderRadius: 20,
//                             padding: "3px 12px",
//                             fontSize: 12,
//                             fontWeight: 700,
//                             whiteSpace: "nowrap",
//                           }}>
//                             {dl.text}
//                           </span>
//                         </td>

//                         {/* Fine amount */}
//                         <td style={{ fontWeight:700, color: b.fineAmount > 0 ? "#F87171" : "var(--teal2)" }}>
//                           ₹{b.fineAmount?.toFixed(0) || 0}
//                         </td>

//                         {/* Status badge */}
//                         <td>
//                           {b.status === "OVERDUE"
//                             ? <span className="badge badge-rejected">⚠️ Overdue</span>
//                             : <span className="badge badge-approved">📖 Borrowed</span>
//                           }
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ════════════════════════════════════════════════════════════════════
//           TAB 2: BORROWING HISTORY
//           Full history of ALL borrowings — returned and active.
//           Sorted newest first.
//           Shows: book, author, issue date, due date, return date,
//                  penalty (fine), whether fine was paid, and status.
//       ════════════════════════════════════════════════════════════════════ */}
//       {tab === "history" && (
//         <div className="card">
//           <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:6 }}>
//             Complete Borrowing History
//           </h3>
//           <p style={{ fontSize:13, color:"var(--text2)", marginBottom:20 }}>
//             Full record of every book you have borrowed from this library
//           </p>

//           {loading ? (
//             <div style={{ textAlign:"center", padding:48 }}>
//               <div style={{ width:32, height:32, border:"3px solid rgba(255,255,255,0.1)", borderTopColor:"var(--amber)", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto" }} />
//             </div>

//           ) : allHistory.length === 0 ? (
//             <div style={{ textAlign:"center", padding:60, color:"var(--text2)" }}>
//               <div style={{ fontSize:52, marginBottom:16 }}>📚</div>
//               <p style={{ fontSize:16, fontWeight:600 }}>No borrowing history yet</p>
//             </div>

//           ) : (
//             <div className="table-wrap">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>Book</th>
//                     <th>Author</th>
//                     <th>Issue Date</th>
//                     <th>Due Date</th>
//                     <th>Return Date</th>
//                     <th>Penalty (₹)</th>
//                     <th>Fine Status</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {allHistory.map((b, i) => (
//                     <tr key={i}>
//                       {/* Book name */}
//                       <td style={{ fontWeight:700 }}>{b.bookTitle}</td>

//                       {/* Author */}
//                       <td style={{ color:"var(--text2)" }}>{b.bookAuthor || "—"}</td>

//                       {/* Issue date */}
//                       <td style={{ color:"var(--text2)", fontSize:13 }}>
//                         {b.borrowedAt
//                           ? new Date(b.borrowedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
//                           : "—"}
//                       </td>

//                       {/* Due date — red if it was overdue */}
//                       <td style={{ color: b.fineAmount > 0 ? "#F87171" : "var(--text2)", fontSize:13 }}>
//                         {b.dueDate
//                           ? new Date(b.dueDate).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
//                           : "—"}
//                       </td>

//                       {/* Return date — shown only if actually returned */}
//                       <td style={{ color:"var(--teal2)", fontSize:13, fontWeight: b.returnedAt ? 600 : 400 }}>
//                         {b.returnedAt
//                           ? new Date(b.returnedAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
//                           : <span style={{ color:"var(--text3)" }}>Not returned</span>}
//                       </td>

//                       {/* Penalty / fine amount */}
//                       <td style={{ fontWeight:700, color: b.fineAmount > 0 ? "#F87171" : "var(--teal2)" }}>
//                         {b.fineAmount > 0 ? `₹${b.fineAmount.toFixed(0)}` : "₹0"}
//                       </td>

//                       {/* Fine paid status */}
//                       <td>
//                         {b.fineAmount > 0 ? (
//                           b.finePaid
//                             ? <span style={{ color:"var(--teal2)", fontSize:12, fontWeight:700 }}>✓ Paid</span>
//                             : <span style={{ color:"#F87171",      fontSize:12, fontWeight:700 }}>Unpaid</span>
//                         ) : (
//                           <span style={{ color:"var(--text3)", fontSize:12 }}>No fine</span>
//                         )}
//                       </td>

//                       {/* Status badge */}
//                       <td>
//                         {b.status === "RETURNED" && <span className="badge badge-approved">✅ Returned</span>}
//                         {b.status === "BORROWED" && <span className="badge badge-pending">📖 Borrowed</span>}
//                         {b.status === "OVERDUE"  && <span className="badge badge-rejected">⚠️ Overdue</span>}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // MEMBER DASHBOARD
// // ══════════════════════════════════════════════════════════════════════════════
// function MemberDashboard({ user, onLogout }) {

//   const [activeTab, setActiveTab] = useState("home");

//   // Live book counts for the stats strip on home tab
//   const bs = useBookStats();

//   // ── SIDEBAR NAV ──────────────────────────────────────────────────────────
//   // "mybooks" tab added — shows MyBooks component
//   const navItems = [
//     { id:"home",         icon:"🏠", label:"Dashboard"        },
//     { id:"mybooks",      icon:"📖", label:"My Books"         }, // ← NEW
//     { id:"browse",       icon:"🔍", label:"Browse Books"     },
//     { id:"borrow",       icon:"📦", label:"Borrow Books"     },
//     { id:"reservations", icon:"📌", label:"Reserve Books"    },
//     { id:"subscription", icon:"🎫", label:"Subscription"     },
//     { id:"profile",      icon:"👤", label:"My Profile"       },
//   ];

//   // ── HOME TAB STATS ────────────────────────────────────────────────────────
//   const STATS = [
//     { icon:"📚", num: bs.total,       label:"Total Books",   c:"var(--amber)"  },
//     { icon:"✅", num: bs.available,   label:"Available Now", c:"var(--teal2)"  },
//     { icon:"❌", num: bs.unavailable, label:"Unavailable",   c:"#F87171"       },
//   ];

//   // ── RENDER ────────────────────────────────────────────────────────────────
//   return (
//     <div className="app-layout">

//       <Sidebar
//         subtitle="Member Portal"
//         navItems={navItems}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         user={user}
//         roleLabel="Member"
//         onLogout={onLogout}
//       />

//       <main className="main-content">

//         {/* Browse Books: full-width, no padding wrapper */}
//         {activeTab === "browse" && <BookManagement userRole="MEMBER" />}

//         {activeTab !== "browse" && (
//           <div className="main-padded">

//             {/* ════ HOME TAB ════ */}
//             {activeTab === "home" && (
//               <div className="fade-up">

//                 {/* Welcome banner */}
//                 <div style={{
//                   background: "linear-gradient(135deg,rgba(232,160,32,0.12) 0%,rgba(13,148,136,0.10) 50%,rgba(79,70,229,0.08) 100%)",
//                   border: "1.5px solid var(--border2)",
//                   borderRadius: 20,
//                   padding: "28px 32px",
//                   marginBottom: 28,
//                   display: "flex", alignItems: "center", gap: 20,
//                 }}>
//                   <div className="avatar" style={{ width:66, height:66, fontSize:26, borderRadius:18 }}>
//                     {user.name?.[0]?.toUpperCase()}
//                   </div>
//                   <div>
//                     <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, marginBottom:4 }}>
//                       Hello, {user.name?.split(" ")[0]}! 📚
//                     </h2>
//                     <p style={{ fontSize:13, color:"var(--text2)" }}>{user.email}</p>
//                     <div style={{ marginTop:10, display:"flex", gap:8 }}>
//                       <span className="tag tag-member">Member</span>
//                       <span className="tag tag-verified">✓ Verified</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Stats strip */}
//                 <div className="stats-grid">
//                   {STATS.map((s, i) => (
//                     <div className="stat-card" key={i}>
//                       <div className="stat-icon">{s.icon}</div>
//                       <div className="stat-num" style={{ color: s.c }}>{s.num}</div>
//                       <div className="stat-label">{s.label}</div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* ── Quick Actions ──
//                     "My Books" card added as the first action so it's most visible.
//                     Clicking any card sets activeTab which renders the right component. */}
//                 <div className="card">
//                   <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, marginBottom:18 }}>
//                     Quick Actions
//                   </h3>
//                   <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
//                     {[
//                       // ── NEW: My Books quick action ──────────────────────────
//                       // Shows the member's active borrows + due dates + history
//                       { icon:"📖", label:"My Books",      c:"rgba(124,58,237,0.15)", t:"mybooks"      },
//                       { icon:"🔍", label:"Browse Books",   c:"rgba(232,160,32,0.15)", t:"browse"       },
//                       { icon:"📦", label:"Borrow Books",   c:"rgba(13,148,136,0.15)", t:"borrow"       },
//                       { icon:"📌", label:"Reserve a Book", c:"rgba(79,70,229,0.15)",  t:"reservations" },
//                       { icon:"🎫", label:"Subscription",   c:"rgba(232,160,32,0.15)", t:"subscription" },
//                     ].map((a, i) => (
//                       <div key={i} className="action-card" onClick={() => setActiveTab(a.t)}>
//                         <div className="action-card-icon" style={{ background: a.c }}>{a.icon}</div>
//                         <div style={{ fontWeight:600, fontSize:14 }}>{a.label}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//               </div>
//             )}

//             {/* Route each tab to its component — all receive user prop */}
//             {activeTab === "mybooks"      && <MyBooks user={user} />}
//             {activeTab === "borrow"       && <BorrowBooks user={user} />}
//             {activeTab === "reservations" && <MemberReservations user={user} />}
//             {activeTab === "subscription" && <MemberSubscriptionPage user={user} />}
//             {activeTab === "profile"      && <ProfilePanel user={user} />}

//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════════════════
// // SECTION 10: ROOT APP — The top of the component tree
// // ══════════════════════════════════════════════════════════════════════════════
// //
// // THIS COMPONENT DOES 3 THINGS:
// //   1. Holds `user` state — who is logged in (or null)
// //   2. Routes to auth pages (landing/login/register/otp) when NOT logged in
// //   3. Routes to correct dashboard (Admin/Librarian/Member) when logged in
// //
// // ROUTING without React Router:
// //   `page` state controls which auth page shows when user === null
// //   user.role controls which dashboard shows when user !== null
// //
// // LOGIN FLOW:
// //   LoginPage calls onLogin(user) after successful API response
// //   → sets user state → re-render → correct dashboard appears
// //
// // LOGOUT FLOW:
// //   Sidebar calls onLogout()
// //   → clears JWT, sessionStorage, user state → landing page appears
// //
// function AppInner() {
//   const { dark } = useTheme();   // read dark from ThemeProvider context

//   // `page` — which auth page to show when no user is logged in
//   const [page, setPage] = useState("landing");

//   // `user` — the logged-in user object, or null
//   // Lazy initializer: tries to restore from sessionStorage on first render
//   // so the user stays logged in after browser refresh
//   const [user, setUser] = useState(() => {
//     try { return JSON.parse(sessionStorage.getItem("libraryUser")); }
//     catch { return null; }
//   });

//   // Called by LoginPage after successful login API response
//   const onLogin = (u) => {
//     setUser(u);
//     sessionStorage.setItem("libraryUser", JSON.stringify(u));
//   };

//   // Called by Sidebar "Sign Out" button
//   const onLogout = () => {
//     setUser(null);
//     localStorage.removeItem("token");           // clear JWT
//     sessionStorage.removeItem("libraryUser");   // clear cached user
//     setPage("landing");                         // go back to landing page
//   };

//   return (
//     <>
//       {/* GlobalStyle injects ALL CSS. dark prop switches CSS variable values */}
//       <GlobalStyle dark={dark} />

//       {user ? (
//         // LOGGED IN: route to correct dashboard by role
//         user.role === "ADMIN"     ? <AdminDashboard     user={user} onLogout={onLogout} /> :
//         user.role === "LIBRARIAN" ? <LibrarianDashboard user={user} onLogout={onLogout} /> :
//                                     <MemberDashboard    user={user} onLogout={onLogout} />
//       ) : (
//         // NOT LOGGED IN: show auth page based on `page` state
//         // navigate={setPage} lets child pages switch the current page
//         <>
//           {page === "landing"  && <LandingPage  navigate={setPage} />}
//           {page === "register" && <RegisterPage navigate={setPage} />}
//           {page === "otp"      && <OtpPage      navigate={setPage} />}
//           {page === "login"    && <LoginPage    navigate={setPage} onLogin={onLogin} />}
//         </>
//       )}
//     </>
//   );
// }

// // ThemeProvider wraps AppInner so every component inside can call useTheme()
// // without needing to pass dark/toggle as props through every level
// function App() {
//   return (
//     <ThemeProvider>
//       <AppInner />
//     </ThemeProvider>
//   );
// }

// // ── ROOT EXPORT ──────────────────────────────────────────────────────────────
// // main.jsx does: import App from './LibraryApp'  — this is what it gets
// export default App;