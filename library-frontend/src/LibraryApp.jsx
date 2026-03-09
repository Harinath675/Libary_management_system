import { useState, useEffect, createContext, useContext } from "react";
import BookManagement from "./components/BookManagement";

// ─────────────────────────────────────────────
// API BASE URL
// ─────────────────────────────────────────────
const API = "http://localhost:8080/api";

const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0d0d0d;
      --cream: #faf8f3;
      --gold: #c9943a;
      --gold-light: #f0d898;
      --sage: #4a7c59;
      --rust: #b5451b;
      --slate: #2c3e50;
      --glass: rgba(255,255,255,0.08);
      --border: rgba(201,148,58,0.25);
      --shadow: 0 8px 40px rgba(0,0,0,0.18);
    }

    html, body, #root { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--ink); color: var(--cream); }
    h1,h2,h3,h4 { font-family: 'Playfair Display', serif; }

    input, select, textarea {
      font-family: 'DM Sans', sans-serif;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      color: var(--cream);
      padding: 12px 16px;
      border-radius: 8px;
      width: 100%;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
    }
    input:focus, select:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,148,58,0.15); }
    input::placeholder { color: rgba(250,248,243,0.35); }
    select option { background: #1a1a1a; color: var(--cream); }

    button {
      font-family: 'DM Sans', sans-serif;
      cursor: pointer;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.2s;
      letter-spacing: 0.3px;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-gold { background: linear-gradient(135deg, var(--gold), #e8b44a); color: var(--ink); padding: 13px 28px; }
    .btn-gold:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,148,58,0.4); }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--cream); padding: 12px 24px; }
    .btn-outline:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }
    .btn-danger { background: rgba(181,69,27,0.15); border: 1px solid rgba(181,69,27,0.4); color: #e07050; padding: 8px 16px; }
    .btn-danger:hover { background: rgba(181,69,27,0.25); }
    .btn-success { background: rgba(74,124,89,0.15); border: 1px solid rgba(74,124,89,0.4); color: #6dba85; padding: 8px 16px; }
    .btn-success:hover { background: rgba(74,124,89,0.25); }

    .card { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 16px; padding: 28px; backdrop-filter: blur(10px); }

    .error-msg { background: rgba(181,69,27,0.15); border: 1px solid rgba(181,69,27,0.35); color: #e07050; padding: 12px 16px; border-radius: 8px; font-size: 13px; }
    .success-msg { background: rgba(74,124,89,0.15); border: 1px solid rgba(74,124,89,0.35); color: #6dba85; padding: 12px 16px; border-radius: 8px; font-size: 13px; }

    .page-center {
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px;
      background: radial-gradient(ellipse at 20% 50%, rgba(201,148,58,0.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 20%, rgba(74,124,89,0.06) 0%, transparent 60%), var(--ink);
    }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 13px; font-weight: 500; color: rgba(250,248,243,0.65); letter-spacing: 0.3px; }

    .tag { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    .tag-admin { background: rgba(201,148,58,0.2); color: var(--gold); border: 1px solid rgba(201,148,58,0.3); }
    .tag-librarian { background: rgba(74,124,89,0.2); color: #6dba85; border: 1px solid rgba(74,124,89,0.3); }
    .tag-member { background: rgba(44,62,80,0.4); color: #90adc0; border: 1px solid rgba(44,62,80,0.6); }
    .tag-verified { background: rgba(74,124,89,0.15); color: #6dba85; border: 1px solid rgba(74,124,89,0.25); }
    .tag-pending { background: rgba(181,69,27,0.15); color: #e07050; border: 1px solid rgba(181,69,27,0.25); }

    .app-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px; background: rgba(255,255,255,0.03); border-right: 1px solid var(--border);
      display: flex; flex-direction: column; padding: 0; position: sticky; top: 0; height: 100vh; overflow-y: auto;
    }
    .sidebar-logo { padding: 28px 24px 20px; border-bottom: 1px solid var(--border); }
    .sidebar-logo h2 { font-size: 20px; color: var(--gold); letter-spacing: -0.5px; }
    .sidebar-logo p { font-size: 11px; color: rgba(250,248,243,0.4); margin-top: 2px; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px;
      font-size: 14px; font-weight: 500; color: rgba(250,248,243,0.55); cursor: pointer;
      transition: all 0.15s; border: 1px solid transparent;
    }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--cream); }
    .nav-item.active { background: rgba(201,148,58,0.12); border-color: rgba(201,148,58,0.2); color: var(--gold); }
    .nav-icon { font-size: 18px; width: 22px; text-align: center; }
    .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border); }
    .user-chip { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; background: rgba(255,255,255,0.04); margin-bottom: 10px; }
    .avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--gold), var(--sage)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: var(--ink); flex-shrink: 0; }
    .user-chip-info { flex: 1; min-width: 0; }
    .user-chip-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-chip-role { font-size: 11px; color: rgba(250,248,243,0.45); text-transform: uppercase; letter-spacing: 0.5px; }
    .main-content { flex: 1; overflow-y: auto; }
    .main-content-padded { padding: 36px 40px; }
    .page-header { margin-bottom: 32px; }
    .page-header h1 { font-size: 32px; color: var(--cream); }
    .page-header p { color: rgba(250,248,243,0.5); margin-top: 6px; font-size: 14px; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
    .stat-number { font-size: 36px; font-weight: 700; font-family: 'Playfair Display', serif; color: var(--gold); }
    .stat-label { font-size: 12px; color: rgba(250,248,243,0.5); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(250,248,243,0.4); padding: 12px 16px; border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s; }
    tbody tr:hover { background: rgba(255,255,255,0.03); }
    tbody td { padding: 14px 16px; font-size: 13px; color: rgba(250,248,243,0.8); }

    .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 24px 0; }
    .otp-box { width: 52px; height: 60px; text-align: center; font-size: 24px; font-weight: 700; border-radius: 12px; background: rgba(255,255,255,0.06); border: 2px solid var(--border); color: var(--cream); caret-color: var(--gold); }
    .otp-box:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,148,58,0.2); }

    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.4s ease forwards; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .pulsing { animation: pulse 1.5s infinite; }
    .divider { height: 1px; background: var(--border); margin: 24px 0; }

    .landing-hero { min-height: 100vh; display: flex; flex-direction: column; background: radial-gradient(ellipse at 15% 40%, rgba(201,148,58,0.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(74,124,89,0.07) 0%, transparent 55%), var(--ink); }
    .landing-nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 60px; border-bottom: 1px solid var(--border); }
    .landing-nav-logo { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--gold); }
    .landing-nav-actions { display: flex; gap: 12px; }
    .hero-section { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 24px; max-width: 800px; margin: 0 auto; }
    .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(201,148,58,0.1); border: 1px solid rgba(201,148,58,0.25); padding: 6px 16px; border-radius: 20px; font-size: 12px; color: var(--gold); letter-spacing: 0.5px; margin-bottom: 28px; }
    .hero-title { font-size: clamp(48px, 8vw, 80px); line-height: 1.05; letter-spacing: -2px; margin-bottom: 22px; }
    .hero-title span { color: var(--gold); }
    .hero-sub { font-size: 18px; color: rgba(250,248,243,0.55); line-height: 1.7; max-width: 520px; margin: 0 auto 40px; }
    .hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .hero-cta .btn-gold { padding: 15px 36px; font-size: 15px; border-radius: 10px; }
    .hero-cta .btn-outline { padding: 14px 32px; font-size: 15px; border-radius: 10px; }
    .features-section { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; padding: 60px; border-top: 1px solid var(--border); }
    .feature-card { background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
    .feature-icon { font-size: 28px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 16px; margin-bottom: 8px; color: var(--cream); }
    .feature-card p { font-size: 13px; color: rgba(250,248,243,0.5); line-height: 1.6; }
  `}</style>
);

// ─────────────────────────────────────────────
// SPINNER
// ─────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "var(--gold)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
function LandingPage({ navigate }) {
  return (
    <div className="landing-hero">
      <nav className="landing-nav">
        
        <div className="landing-nav-logo">📚 LibraryMS</div>
        <div className="landing-nav-actions">
          <button className="btn-outline" onClick={() => navigate("login")}>Sign In</button>
          <button className="btn-gold" onClick={() => navigate("register")}>Get Started</button>
        </div>
      </nav>
      <div className="hero-section fade-up">
        <div className="hero-badge">✨ Library Management System</div>
        <h1 className="hero-title">Manage Your<br /><span>Library</span> Smarter</h1>
        <p className="hero-sub">A complete platform for admins, librarians, and members to manage books, memberships, and library operations effortlessly.</p>
        <div className="hero-cta">
          <button className="btn-gold" onClick={() => navigate("register")}>Create Account</button>
          <button className="btn-outline" onClick={() => navigate("login")}>Sign In</button>
        </div>
      </div>
      <div className="features-section">
        {[
          { icon: "🔐", title: "Role-Based Access", desc: "Separate dashboards for Admin, Librarian, and Member with tailored features for each role." },
          { icon: "📧", title: "OTP Verification", desc: "Secure email OTP verification for members to keep your library safe and trusted." },
          { icon: "✅", title: "Admin Approval", desc: "Librarians require admin approval before access — ensuring only trusted staff get in." },
          { icon: "📖", title: "Book Management", desc: "Track books, borrowings, returns, and availability all in one place." },
        ].map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────────
function RegisterPage({ navigate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "MEMBER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text() || "Registration failed");
      sessionStorage.setItem("otpEmail", form.email);
      sessionStorage.setItem("otpRole", form.role);
      navigate("otp");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-center">
      <div className="card fade-up" style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <h2 style={{ fontSize: 26 }}>Create Account</h2>
          <p style={{ color: "rgba(250,248,243,0.45)", fontSize: 13, marginTop: 6 }}>Join the Library Management System</p>
        </div>
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group"><label>Full Name</label><input placeholder="Enter your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Create a password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
          <div className="form-group">
            <label>Register As</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="MEMBER">Member</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {form.role === "MEMBER" && <p style={{ fontSize: 12, color: "rgba(250,248,243,0.4)", lineHeight: 1.5 }}>📧 An OTP will be sent to your email to verify your account.</p>}
          {(form.role === "ADMIN" || form.role === "LIBRARIAN") && <p style={{ fontSize: 12, color: "rgba(250,248,243,0.4)", lineHeight: 1.5 }}>⏳ Your account will require Super Admin approval before you can log in.</p>}
          <button className="btn-gold" type="submit" disabled={loading} style={{ marginTop: 8, width: "100%" }}>{loading ? <Spinner /> : "Create Account"}</button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(250,248,243,0.45)" }}>
          Already have an account?{" "}
          <span style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("login")}>Sign In</span>
        </p>
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(250,248,243,0.35)", marginTop: 8, cursor: "pointer" }} onClick={() => navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// OTP PAGE
// ─────────────────────────────────────────────
function OtpPage({ navigate }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const email = sessionStorage.getItem("otpEmail") || "";

  const handleChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
  };

  const handleVerify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) { setError("Please enter all 6 digits"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify?email=${encodeURIComponent(email)}&otp=${otpStr}`, { method: "POST" });
      const txt = await res.text();
      if (txt.includes("successfully") || txt.toLowerCase().includes("verified")) {
        const role = sessionStorage.getItem("otpRole") || "MEMBER";
        setSuccess(role === "MEMBER" ? "✅ Email verified! You can now log in." : "✅ Email verified! Please wait for Admin approval before logging in.");
        sessionStorage.removeItem("otpEmail");
        sessionStorage.removeItem("otpRole");
      } else { setError(txt || "Verification failed"); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-center">
      <div className="card fade-up" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>Verify Your Email</h2>
        <p style={{ fontSize: 13, color: "rgba(250,248,243,0.5)", lineHeight: 1.6 }}>
          We sent a 6-digit OTP to<br /><strong style={{ color: "var(--gold)" }}>{email || "your email"}</strong>
        </p>
        {error && <div className="error-msg" style={{ marginTop: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginTop: 16 }}>{success}</div>}
        {!success && (
          <>
            <div className="otp-inputs">
              {otp.map((d, i) => (
                <input key={i} id={`otp-${i}`} className="otp-box" maxLength={1} value={d}
                  onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} />
              ))}
            </div>
            <button className="btn-gold" onClick={handleVerify} disabled={loading} style={{ width: "100%", padding: "14px" }}>{loading ? <Spinner /> : "Verify OTP"}</button>
          </>
        )}
        {success && <button className="btn-gold" onClick={() => navigate("login")} style={{ width: "100%", padding: "14px", marginTop: 16 }}>Go to Login →</button>}
        <p style={{ marginTop: 20, fontSize: 12, color: "rgba(250,248,243,0.35)" }}>OTP is valid for 5 minutes.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────
function LoginPage({ navigate, onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text() || "Login failed");
      const user = await res.json();
      // Save JWT token so BookManagement can use it
      if (user.token) localStorage.setItem("token", user.token);
      onLogin(user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-center">
      <div className="card fade-up" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
          <h2 style={{ fontSize: 26 }}>Welcome Back</h2>
          <p style={{ color: "rgba(250,248,243,0.45)", fontSize: 13, marginTop: 6 }}>Sign in to your library account</p>
        </div>
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group"><label>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="form-group"><label>Password</label><input type="password" placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></div>
          <button className="btn-gold" type="submit" disabled={loading} style={{ marginTop: 8, width: "100%" }}>{loading ? <Spinner /> : "Sign In"}</button>
        </form>
        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(250,248,243,0.45)" }}>
          Don't have an account?{" "}
          <span style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("register")}>Register</span>
        </p>
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(250,248,243,0.35)", marginTop: 8 }}>
          Need to verify OTP?{" "}
          <span style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 600 }} onClick={() => navigate("otp")}>Verify Email</span>
        </p>
        <p style={{ textAlign: "center", fontSize: 13, color: "rgba(250,248,243,0.35)", marginTop: 8, cursor: "pointer" }} onClick={() => navigate("landing")}>← Back to Home</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFILE PANEL
// ─────────────────────────────────────────────
function ProfilePanel({ user }) {
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (pwForm.newPassword !== pwForm.confirm) { setError("New passwords don't match"); return; }
    if (pwForm.newPassword.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) throw new Error(await res.text());
      setSuccess("Password updated successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) { setError(err.message || "Failed to update password."); }
    finally { setLoading(false); }
  };

  const roleTag = { ADMIN: "tag-admin", LIBRARIAN: "tag-librarian", MEMBER: "tag-member" }[user.role] || "tag-member";

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="page-header"><h1>My Profile</h1><p>View your account info and update your password</p></div>
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: 24 }}>{user.name?.[0]?.toUpperCase() || "?"}</div>
          <div>
            <h3 style={{ fontSize: 20, marginBottom: 6 }}>{user.name}</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className={`tag ${roleTag}`}>{user.role}</span>
              <span className={`tag ${user.verified ? "tag-verified" : "tag-pending"}`}>{user.verified ? "✓ Verified" : "Unverified"}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[{ label: "Full Name", value: user.name }, { label: "Email Address", value: user.email }, { label: "Role", value: user.role }, { label: "Account Status", value: user.approved ? "Approved" : "Pending Approval" }].map((row, i) => (
            <div key={i}>
              <div style={{ fontSize: 11, color: "rgba(250,248,243,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontSize: 14 }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Change Password</h3>
        <p style={{ fontSize: 13, color: "rgba(250,248,243,0.45)", marginBottom: 20 }}>Update your account password securely</p>
        {error && <div className="error-msg" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="success-msg" style={{ marginBottom: 16 }}>{success}</div>}
        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group"><label>Current Password</label><input type="password" placeholder="Enter current password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required /></div>
          <div className="form-group"><label>New Password</label><input type="password" placeholder="Enter new password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required /></div>
          <div className="form-group"><label>Confirm New Password</label><input type="password" placeholder="Confirm new password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required /></div>
          <button className="btn-gold" type="submit" disabled={loading} style={{ alignSelf: "flex-start", minWidth: 160 }}>{loading ? <Spinner /> : "Update Password"}</button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN DASHBOARD
// ─────────────────────────────────────────────
function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const fetchPending = async () => {
    setLoadingPending(true);
    try { const res = await fetch(`${API}/admin/pending-users`); if (res.ok) setPendingUsers(await res.json()); }
    catch { } finally { setLoadingPending(false); }
  };

  const fetchAll = async () => {
    setLoadingAll(true);
    try { const res = await fetch(`${API}/admin/all-users`); if (res.ok) setAllUsers(await res.json()); }
    catch { } finally { setLoadingAll(false); }
  };

  useEffect(() => {
    if (activeTab === "home") { fetchPending(); fetchAll(); }
    if (activeTab === "pending") fetchPending();
    if (activeTab === "users") fetchAll();
  }, [activeTab]);

  const approveUser = async (email) => {
    setActionMsg("");
    try {
      const res = await fetch(`${API}/admin/approve?email=${encodeURIComponent(email)}`, { method: "POST" });
      const txt = await res.text();
      setActionMsg("✅ " + txt);
      fetchPending(); fetchAll();
    } catch { setActionMsg("❌ Action failed. Try again."); }
  };

  // ── Sidebar nav — "books" tab added ──
  const navItems = [
    { id: "home",    icon: "🏠", label: "Dashboard" },
    { id: "books",   icon: "📖", label: "Book Management" },
    { id: "pending", icon: "⏳", label: "Pending Approvals" },
    { id: "users",   icon: "👥", label: "All Users" },
    { id: "profile", icon: "👤", label: "My Profile" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><h2>📚 LibraryMS</h2><p>Admin Panel</p></div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <div key={n.id} className={`nav-item ${activeTab === n.id ? "active" : ""}`} onClick={() => setActiveTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div className="user-chip-info"><div className="user-chip-name">{user.name}</div><div className="user-chip-role">Admin</div></div>
          </div>
          <button className="btn-outline" onClick={onLogout} style={{ width: "100%" }}>Logout</button>
        </div>
      </aside>

      <main className="main-content">

        {/* ── Book Management — full width, no extra padding ── */}
        {activeTab === "books" && <BookManagement userRole="ADMIN" />}

        {/* ── All other tabs — padded ── */}
        {activeTab !== "books" && (
          <div className="main-content-padded">

            {activeTab === "home" && (
              <div className="fade-up">
                <div className="page-header"><h1>Welcome, {user.name?.split(" ")[0]}! 👋</h1><p>Here's an overview of your library system</p></div>
                <div className="stats-grid">
                  {[
                    { num: allUsers.length || "—", label: "Total Users" },
                    { num: allUsers.filter(u => u.role === "MEMBER").length || "—", label: "Members" },
                    { num: pendingUsers.length || "0", label: "Pending Approvals" },
                    { num: allUsers.filter(u => u.role === "LIBRARIAN").length || "—", label: "Librarians" },
                  ].map((s, i) => (
                    <div className="stat-card" key={i}><div className="stat-number">{s.num}</div><div className="stat-label">{s.label}</div></div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn-gold" onClick={() => setActiveTab("books")}>📖 Manage Books</button>
                    <button className="btn-gold" onClick={() => setActiveTab("pending")}>⏳ Review Pending</button>
                    <button className="btn-outline" onClick={() => setActiveTab("users")}>👥 All Users</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pending" && (
              <div className="fade-up">
                <div className="page-header"><h1>Pending Approvals</h1><p>Review and approve Librarian / Admin accounts</p></div>
                {actionMsg && <div className="success-msg" style={{ marginBottom: 16 }}>{actionMsg}</div>}
                <div className="card">
                  {loadingPending ? <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div>
                    : pendingUsers.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 48, color: "rgba(250,248,243,0.35)" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div><p>No pending approvals</p>
                      </div>
                    ) : (
                      <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                        <tbody>
                          {pendingUsers.map((u, i) => (
                            <tr key={i}>
                              <td>{u.name}</td><td>{u.email}</td>
                              <td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                              <td><button className="btn-success" onClick={() => approveUser(u.email)}>Approve</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="fade-up">
                <div className="page-header"><h1>All Users</h1><p>Every registered account in the system</p></div>
                <div className="card">
                  {loadingAll ? <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div>
                    : allUsers.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 48, color: "rgba(250,248,243,0.35)" }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div><p>No users found</p>
                      </div>
                    ) : (
                      <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Approved</th></tr></thead>
                        <tbody>
                          {allUsers.map((u, i) => (
                            <tr key={i}>
                              <td>{u.name}</td><td>{u.email}</td>
                              <td><span className={`tag tag-${u.role?.toLowerCase()}`}>{u.role}</span></td>
                              <td><span className={`tag ${u.verified ? "tag-verified" : "tag-pending"}`}>{u.verified ? "Yes" : "No"}</span></td>
                              <td><span className={`tag ${u.approved ? "tag-verified" : "tag-pending"}`}>{u.approved ? "Yes" : "No"}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              </div>
            )}

            {activeTab === "profile" && <ProfilePanel user={user} />}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// LIBRARIAN DASHBOARD
// ─────────────────────────────────────────────
function LibrarianDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home",       icon: "🏠", label: "Dashboard" },
    { id: "books",      icon: "📖", label: "Manage Books" },
    { id: "borrowings", icon: "🔄", label: "Borrowings" },
    { id: "profile",    icon: "👤", label: "My Profile" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><h2>📙  LibraryMS</h2><p>Librarian Panel</p></div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <div key={n.id} className={`nav-item ${activeTab === n.id ? "active" : ""}`} onClick={() => setActiveTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div className="user-chip-info"><div className="user-chip-name">{user.name}</div><div className="user-chip-role">Librarian</div></div>
          </div>
          <button className="btn-outline" onClick={onLogout} style={{ width: "100%" }}>Logout</button>
        </div>
      </aside>

      <main className="main-content">

        {/* ── Book Management — full width ── */}
        {activeTab === "books" && <BookManagement userRole="LIBRARIAN" />}

        {activeTab !== "books" && (
          <div className="main-content-padded">

            {activeTab === "home" && (
              <div className="fade-up">
                <div className="page-header"><h1>Librarian Dashboard</h1><p>Manage books and track borrowings</p></div>
                <div className="stats-grid">
                  {[{ num: "—", label: "Total Books" }, { num: "—", label: "Borrowed" }, { num: "—", label: "Available" }, { num: "—", label: "Overdue" }].map((s, i) => (
                    <div className="stat-card" key={i}><div className="stat-number">{s.num}</div><div className="stat-label">{s.label}</div></div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn-gold" onClick={() => setActiveTab("books")}>📖 Manage Books</button>
                    <button className="btn-outline" onClick={() => setActiveTab("borrowings")}>🔄 Borrowings</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "borrowings" && (
              <div className="fade-up">
                <div className="page-header"><h1>Borrowings</h1><p>Track issued and returned books</p></div>
                <div className="card" style={{ textAlign: "center", padding: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔄</div>
                  <h3 style={{ marginBottom: 8 }}>Borrowings Module Coming Soon</h3>
                  <p style={{ fontSize: 13, color: "rgba(250,248,243,0.4)" }}>Add a Borrowing entity in your backend, then fetch data here.</p>
                </div>
              </div>
            )}

            {activeTab === "profile" && <ProfilePanel user={user} />}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// MEMBER DASHBOARD
// ─────────────────────────────────────────────
function MemberDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("home");

  const navItems = [
    { id: "home",       icon: "🏠", label: "Dashboard" },
    { id: "browse",     icon: "🔍", label: "Browse Books" },
    { id: "myborrowed", icon: "📋", label: "My Borrowings" },
    { id: "profile",    icon: "👤", label: "My Profile" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><h2>📙 LibraryMS</h2><p>Member Portal</p></div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <div key={n.id} className={`nav-item ${activeTab === n.id ? "active" : ""}`} onClick={() => setActiveTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>{n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div className="user-chip-info"><div className="user-chip-name">{user.name}</div><div className="user-chip-role">Member</div></div>
          </div>
          <button className="btn-outline" onClick={onLogout} style={{ width: "100%" }}>Logout</button>
        </div>
      </aside>

      <main className="main-content">

        {/* ── Browse Books — MEMBER view only, full width ── */}
        {activeTab === "browse" && <BookManagement userRole="MEMBER" />}

        {activeTab !== "browse" && (
          <div className="main-content-padded">

            {activeTab === "home" && (
              <div className="fade-up">
                <div className="page-header"><h1>Hello, {user.name?.split(" ")[0]}! 📚</h1><p>Welcome to your library member portal</p></div>
                <div className="card" style={{ marginBottom: 20, background: "linear-gradient(135deg, rgba(201,148,58,0.1), rgba(74,124,89,0.08))" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div className="avatar" style={{ width: 56, height: 56, fontSize: 22 }}>{user.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <h3>{user.name}</h3>
                      <p style={{ fontSize: 13, color: "rgba(250,248,243,0.5)", marginTop: 4 }}>{user.email}</p>
                      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                        <span className="tag tag-member">Member</span>
                        <span className="tag tag-verified">✓ Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="stats-grid">
                  {[{ num: "—", label: "Books Borrowed" }, { num: "—", label: "Books Returned" }, { num: "—", label: "Currently Reading" }, { num: "—", label: "Overdue" }].map((s, i) => (
                    <div className="stat-card" key={i}><div className="stat-number">{s.num}</div><div className="stat-label">{s.label}</div></div>
                  ))}
                </div>
                <div className="card">
                  <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <button className="btn-gold" onClick={() => setActiveTab("browse")}>🔍 Browse Books</button>
                    <button className="btn-outline" onClick={() => setActiveTab("myborrowed")}>📋 My Borrowings</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "myborrowed" && (
              <div className="fade-up">
                <div className="page-header"><h1>My Borrowings</h1><p>Your borrowing history and current books</p></div>
                <div className="card" style={{ textAlign: "center", padding: 60 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                  <h3 style={{ marginBottom: 8 }}>Borrowing History Coming Soon</h3>
                  <p style={{ fontSize: 13, color: "rgba(250,248,243,0.4)" }}>
                    Connect to <code style={{ color: "var(--gold-light)" }}>GET /api/borrowings/my</code> to show your borrowed books.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "profile" && <ProfilePanel user={user} />}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("libraryUser")); } catch { return null; }
  });

  const navigate = (p) => setPage(p);

  const onLogin = (u) => {
    setUser(u);
    sessionStorage.setItem("libraryUser", JSON.stringify(u));
  };

  const onLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    sessionStorage.removeItem("libraryUser");
    setPage("landing");
  };

  if (user) {
    if (user.role === "ADMIN")     return <><GlobalStyle /><AdminDashboard user={user} onLogout={onLogout} /></>;
    if (user.role === "LIBRARIAN") return <><GlobalStyle /><LibrarianDashboard user={user} onLogout={onLogout} /></>;
    if (user.role === "MEMBER")    return <><GlobalStyle /><MemberDashboard user={user} onLogout={onLogout} /></>;
  }

  return (
    <>
      <GlobalStyle />
      {page === "landing"  && <LandingPage navigate={navigate} />}
      {page === "register" && <RegisterPage navigate={navigate} />}
      {page === "login"    && <LoginPage navigate={navigate} onLogin={onLogin} />}
      {page === "otp"      && <OtpPage navigate={navigate} />}
    </>
  );
}
