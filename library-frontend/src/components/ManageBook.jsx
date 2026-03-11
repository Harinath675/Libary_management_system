import { useState, useEffect, createContext, useContext } from "react";

// ─────────────────────────────────────────────
// API BASE URL — change this to your backend URL
// ─────────────────────────────────────────────
const API = "http://localhost:8080/api";

// ─────────────────────────────────────────────
// AUTH CONTEXT — stores the logged-in user
// ─────────────────────────────────────────────
const AuthContext = createContext(null);

function useAuth() {
  return useContext(AuthContext);
} 

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --ink: #0d0d0d;
      --cream: #83c33e;
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

    .btn-gold {
      background: linear-gradient(135deg, var(--gold), #e8b44a);
      color: var(--ink);
      padding: 13px 28px;
    }
    .btn-gold:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,148,58,0.4); }

    .btn-outline {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--cream);
      padding: 12px 24px;
    }
    .btn-outline:hover:not(:disabled) { border-color: var(--gold); color: var(--gold); }

    .btn-danger {
      background: rgba(181,69,27,0.15);
      border: 1px solid rgba(181,69,27,0.4);
      color: #e07050;
      padding: 8px 16px;
    }
    .btn-danger:hover { background: rgba(181,69,27,0.25); }

    .btn-success {
      background: rgba(74,124,89,0.15);
      border: 1px solid rgba(74,124,89,0.4);
      color: #6dba85;
      padding: 8px 16px;
    }
    .btn-success:hover { background: rgba(74,124,89,0.25); }

    .card {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
      backdrop-filter: blur(10px);
    }

    .error-msg {
      background: rgba(181,69,27,0.15);
      border: 1px solid rgba(181,69,27,0.35);
      color: #e07050;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
    }
    .success-msg {
      background: rgba(74,124,89,0.15);
      border: 1px solid rgba(74,124,89,0.35);
      color: #6dba85;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
    }

    .page-center {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(ellipse at 20% 50%, rgba(201,148,58,0.06) 0%, transparent 60%),
                  radial-gradient(ellipse at 80% 20%, rgba(74,124,89,0.06) 0%, transparent 60%),
                  var(--ink);
    }

    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 13px; font-weight: 500; color: rgba(250,248,243,0.65); letter-spacing: 0.3px; }

    .tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .tag-admin { background: rgba(201,148,58,0.2); color: var(--gold); border: 1px solid rgba(201,148,58,0.3); }
    .tag-librarian { background: rgba(74,124,89,0.2); color: #6dba85; border: 1px solid rgba(74,124,89,0.3); }
    .tag-member { background: rgba(44,62,80,0.4); color: #90adc0; border: 1px solid rgba(44,62,80,0.6); }
    .tag-verified { background: rgba(74,124,89,0.15); color: #6dba85; border: 1px solid rgba(74,124,89,0.25); }
    .tag-pending { background: rgba(181,69,27,0.15); color: #e07050; border: 1px solid rgba(181,69,27,0.25); }

    /* Sidebar layout */
    .app-layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 260px;
      background: rgba(255,255,255,0.03);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar-logo {
      padding: 28px 24px 20px;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-logo h2 { font-size: 20px; color: var(--gold); letter-spacing: -0.5px; }
    .sidebar-logo p { font-size: 11px; color: rgba(250,248,243,0.4); margin-top: 2px; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      color: rgba(250,248,243,0.55);
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid transparent;
    }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--cream); }
    .nav-item.active { background: rgba(201,148,58,0.12); border-color: rgba(201,148,58,0.2); color: var(--gold); }
    .nav-icon { font-size: 18px; width: 22px; text-align: center; }
    .sidebar-footer {
      padding: 16px 12px;
      border-top: 1px solid var(--border);
    }
    .user-chip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 10px;
      background: rgba(255,255,255,0.04);
      margin-bottom: 10px;
    }
    .avatar {
      width: 36px; height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--gold), var(--sage));
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px; color: var(--ink);
      flex-shrink: 0;
    }
    .user-chip-info { flex: 1; min-width: 0; }
    .user-chip-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-chip-role { font-size: 11px; color: rgba(250,248,243,0.45); text-transform: uppercase; letter-spacing: 0.5px; }
    .main-content { flex: 1; padding: 36px 40px; overflow-y: auto; }
    .page-header { margin-bottom: 32px; }
    .page-header h1 { font-size: 32px; color: var(--cream); }
    .page-header p { color: rgba(250,248,243,0.5); margin-top: 6px; font-size: 14px; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .stat-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
    }
    .stat-number { font-size: 36px; font-weight: 700; font-family: 'Playfair Display', serif; color: var(--gold); }
    .stat-label { font-size: 12px; color: rgba(250,248,243,0.5); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

    table { width: 100%; border-collapse: collapse; }
    thead th {
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      color: rgba(250,248,243,0.4);
      padding: 12px 16px;
      border-bottom: 1px solid var(--border);
    }
    tbody tr { border-bottom: 1px solid rgba(255,255,255,0.04); transition: background 0.15s; }
    tbody tr:hover { background: rgba(255,255,255,0.03); }
    tbody td { padding: 14px 16px; font-size: 13px; color: rgba(152, 120, 40, 0.8); }

    .otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 24px 0; }
    .otp-box {
      width: 52px; height: 60px;
      text-align: center;
      font-size: 24px;
      font-weight: 700;
      border-radius: 12px;
      background: rgba(255,255,255,0.06);
      border: 2px solid var(--border);
      color: var(--cream);
      caret-color: var(--gold);
    }
    .otp-box:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201,148,58,0.2); }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp 0.4s ease forwards; }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
    .pulsing { animation: pulse 1.5s infinite; }

    .divider {
      height: 1px;
      background: var(--border);
      margin: 24px 0;
    }

    /* Landing page */
    .landing-hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(ellipse at 15% 40%, rgba(201,148,58,0.08) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 20%, rgba(74,124,89,0.07) 0%, transparent 55%),
        var(--ink);
    }
    .landing-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px 60px;
      border-bottom: 1px solid var(--border);
    }
    .landing-nav-logo { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--gold); }
    .landing-nav-actions { display: flex; gap: 12px; }
    .hero-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(201,148,58,0.1);
      border: 1px solid rgba(201,148,58,0.25);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      color: var(--gold);
      letter-spacing: 0.5px;
      margin-bottom: 28px;
    }
    .hero-title {
      font-size: clamp(48px, 8vw, 80px);
      line-height: 1.05;
      letter-spacing: -2px;
      margin-bottom: 22px;
    }
    .hero-title span { color: var(--gold); }
    .hero-sub {
      font-size: 18px;
      color: rgba(250,248,243,0.55);
      line-height: 1.7;
      max-width: 520px;
      margin: 0 auto 40px;
    }
    .hero-cta { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
    .hero-cta .btn-gold { padding: 15px 36px; font-size: 15px; border-radius: 10px; }
    .hero-cta .btn-outline { padding: 14px 32px; font-size: 15px; border-radius: 10px; }
    .features-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      padding: 60px;
      border-top: 1px solid var(--border);
    }
    .feature-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px;
    }
    .feature-icon { font-size: 28px; margin-bottom: 14px; }
    .feature-card h3 { font-size: 16px; margin-bottom: 8px; color:  rgba(66, 202, 68, 0.5); }
    .feature-card p { font-size: 13px; color: rgba(66, 202, 68, 0.5); line-height: 1.6; }
  `}</style>
);
// ─────────────────────────────────────────────
// BOOK MANAGER — used by Librarian
// ─────────────────────────────────────────────
function BookManager() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null); // null = add mode
  const [form, setForm] = useState({ title: "", author: "", genre: "", isbn: "", totalCopies: 1 });
  const [formLoading, setFormLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const fetchBooks = async (q = "") => {
    setLoading(true);
    try {
      const url = q ? `${API}/books/search?query=${encodeURIComponent(q)}` : `${API}/books`;
      const res = await fetch(url);
      if (res.ok) setBooks(await res.json());
    } catch { setMsg({ type: "error", text: "Failed to load books" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);

  // Debounce search — wait 400ms after user stops typing
  useEffect(() => {
    const t = setTimeout(() => fetchBooks(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openAddForm = () => {
    setEditingBook(null);
    setForm({ title: "", author: "", genre: "", isbn: "", totalCopies: 1 });
    setShowForm(true);
  };

  const openEditForm = (book) => {
    setEditingBook(book);
    setForm({
      title: book.title, author: book.author,
      genre: book.genre || "", isbn: book.isbn || "",
      totalCopies: book.totalCopies
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setMsg({ type: "", text: "" });
    try {
      const url = editingBook ? `${API}/books/${editingBook.id}` : `${API}/books`;
      const method = editingBook ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, totalCopies: Number(form.totalCopies) }),
      });
      if (!res.ok) throw new Error(await res.text());
      setMsg({ type: "success", text: editingBook ? "✅ Book updated!" : "✅ Book added!" });
      setShowForm(false);
      fetchBooks(search);
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally { setFormLoading(false); }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API}/books/${book.id}`, { method: "DELETE" });
      const txt = await res.text();
      setMsg({ type: res.ok ? "success" : "error", text: txt });
      fetchBooks(search);
    } catch { setMsg({ type: "error", text: "Delete failed" }); }
  };

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Manage Books</h1>
        <p>Add, edit, and remove books from the library catalog</p>
      </div>

      {/* Message bar */}
      {msg.text && (
        <div className={msg.type === "error" ? "error-msg" : "success-msg"} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {/* Controls row */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="🔍 Search by title or author..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <button className="btn-gold" onClick={openAddForm}>+ Add Book</button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 24, borderColor: "rgba(54, 40, 8, 0.4)" }}>
          <h3 style={{ marginBottom: 20 }}>{editingBook ? "✏️ Edit Book" : "➕ Add New Book"}</h3>
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="form-group">
              <label>Title *</label>
              <input placeholder="Book title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Author *</label>
              <input placeholder="Author name" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input placeholder="e.g. Fiction, Science" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} />
            </div>
            <div className="form-group">
              <label>ISBN</label>
              <input placeholder="e.g. 978-3-16-148410-0" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Total Copies *</label>
              <input type="number" min="1" value={form.totalCopies} onChange={e => setForm({ ...form, totalCopies: e.target.value })} required />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <button className="btn-gold" type="submit" disabled={formLoading} style={{ flex: 1 }}>
                {formLoading ? <Spinner /> : editingBook ? "Save Changes" : "Add Book"}
              </button>
              <button className="btn-outline" type="button" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Books Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}><Spinner /></div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(250,248,243,0.35)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
            <p>{search ? "No books match your search" : "No books added yet"}</p>
            {!search && <button className="btn-gold" style={{ marginTop: 16 }} onClick={openAddForm}>Add First Book</button>}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>ISBN</th>
                <th>Available</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 600 }}>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre || <span style={{ opacity: 0.35 }}>—</span>}</td>
                  <td style={{ fontSize: 12, opacity: 0.6 }}>{book.isbn || "—"}</td>
                  <td>
                    <span style={{ color: book.availableCopies === 0 ? "#e07050" : "#6dba85", fontWeight: 600 }}>
                      {book.availableCopies}
                    </span>
                  </td>
                  <td>{book.totalCopies}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-outline" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => openEditForm(book)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(book)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BOOK BROWSER — used by Member (read-only)
// ─────────────────────────────────────────────
function BookBrowser() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchBooks = async (q = "") => {
    setLoading(true);
    try {
      const url = q ? `${API}/books/search?query=${encodeURIComponent(q)}` : `${API}/books`;
      const res = await fetch(url);
      if (res.ok) setBooks(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchBooks(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="fade-up">
      <div className="page-header">
        <h1>Browse Books</h1>
        <p>Explore our library catalog</p>
      </div>
      <input
        placeholder="🔍 Search by title or author..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 20 }}
      />
      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}><Spinner /></div>
        ) : books.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "rgba(250,248,243,0.35)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
            <p>{search ? "No books found" : "No books in catalog yet"}</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Title</th><th>Author</th><th>Genre</th><th>Availability</th></tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id}>
                  <td style={{ fontWeight: 600 }}>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.genre || "—"}</td>
                  <td>
                    {book.availableCopies > 0
                      ? <span className="tag tag-verified">✓ Available ({book.availableCopies})</span>
                      : <span className="tag tag-pending">✗ All Borrowed</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}