import { useState, useEffect, useRef } from "react";
import { API, SERVER_URL } from "../config";
 
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});
 
const DEPARTMENTS = [
  "CSE","ECE","EEE","MECHANICAL","CIVIL",
  "MBBS","MBA","HISTORY","QUANTUM PHYSICS",
  "DATA SCIENCE","BIOTECHNOLOGY","PHARMACY",
  "ARCHITECTURE","LAW","GENERAL",
];
 
const DEPT_COLORS = {
  "CSE":             { bg:"#dbeafe", fg:"#1d4ed8" },
  "ECE":             { bg:"#d1fae5", fg:"#065f46" },
  "EEE":             { bg:"#fef9c3", fg:"#854d0e" },
  "MECHANICAL":      { bg:"#fee2e2", fg:"#991b1b" },
  "CIVIL":           { bg:"#ede9fe", fg:"#5b21b6" },
  "MBBS":            { bg:"#fce7f3", fg:"#9d174d" },
  "MBA":             { bg:"#e0f2fe", fg:"#0369a1" },
  "HISTORY":         { bg:"#fff7ed", fg:"#9a3412" },
  "QUANTUM PHYSICS": { bg:"#f0fdf4", fg:"#15803d" },
  "DATA SCIENCE":    { bg:"#f5f3ff", fg:"#6d28d9" },
  "BIOTECHNOLOGY":   { bg:"#ecfdf5", fg:"#065f46" },
  "PHARMACY":        { bg:"#fdf4ff", fg:"#7e22ce" },
  "ARCHITECTURE":    { bg:"#fff1f2", fg:"#be123c" },
  "LAW":             { bg:"#f0f9ff", fg:"#0c4a6e" },
  "GENERAL":         { bg:"#f1f5f9", fg:"#475569" },
};
 
const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#fd7043,#ff8a65)",
  "linear-gradient(135deg,#2196f3,#21cbf3)",
];
const grad = (t) => GRADIENTS[(t?.charCodeAt(0)||0) % GRADIENTS.length];
 
const EMPTY = {
  title:"", author:"", isbn:"", genre:"", department:"",
  publisher:"", publishedYear:"", description:"",
  totalCopies:1, availableCopies:1,
};
 
// ── Google Books cover fallback (staggered to avoid 429) ─────────────────────
const fetchGoogleCover = async (title, author) => {
  try {
    const q   = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`
    );
    if (!res.ok) return null;
    const d   = await res.json();
    const lnk = d?.items?.[0]?.volumeInfo?.imageLinks;
    return lnk?.thumbnail || lnk?.smallThumbnail || null;
  } catch { return null; }
};
 
// ── Build the correct cover URL from whatever is stored in DB ─────────────────
// DB may store:
//   "covers/book_1_abc.jpg"           → served at /api/books/covers/book_1_abc.jpg
//   "uploads/books/covers/book_1.jpg" → old format, strip prefix
//   full http URL                     → use as-is (Google Books fallback)
const buildCoverUrl = (coverImageUrl) => {
  if (!coverImageUrl) return null;
  if (coverImageUrl.startsWith("http")) return coverImageUrl;
  // Strip any prefix — keep just the filename
  const filename = coverImageUrl
    .replace(/^uploads\/books\/covers\//, "")
    .replace(/^uploads\/books\//, "")
    .replace(/^covers\//, "")
    .replace(/^uploads\//, "");
  return `${SERVER}/images/covers/${filename}`;
};
 
// ═════════════════════════════════════════════════════════════════════════════
// BookCard
// ═════════════════════════════════════════════════════════════════════════════
function BookCard({ book, canManage, onEdit, onDelete }) {
  const [cover,  setCover]  = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [err,    setErr]    = useState(false);
  const [hover,  setHover]  = useState(false);
 
  useEffect(() => {
    setLoaded(false);
    setErr(false);
 
    if (book.coverImageUrl) {
      // Use our own backend endpoint — no rate limiting, always works
      setCover(buildCoverUrl(book.coverImageUrl));
    } else {
      // No uploaded cover — fall back to Google Books (staggered delay)
      const delay = Math.floor(Math.random() * 2000); // random 0–2s to avoid 429
      const t = setTimeout(() => {
        fetchGoogleCover(book.title, book.author).then(url => {
          if (url) setCover(url);
        });
      }, delay);
      return () => clearTimeout(t);
    }
  }, [book.coverImageUrl, book.title, book.author]);
 
  const avail = book.availableCopies > 0;
  const dc    = DEPT_COLORS[book.department] || DEPT_COLORS["GENERAL"];
 
  return (
    <div style={C.wrap}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={C.coverBox}>
        {/* Always show gradient placeholder underneath */}
        <div style={{...C.placeholder, background: grad(book.title)}}>
          <span style={C.letter}>{book.title?.[0]?.toUpperCase()}</span>
        </div>
 
        {/* Cover image on top — fades in when loaded, hidden if error */}
        {cover && !err && (
          <img
            src={cover}
            alt={book.title}
            style={{...C.img, opacity: loaded ? 1 : 0}}
            onLoad={() => setLoaded(true)}
            onError={() => setErr(true)}
          />
        )}
 
        <div style={{...C.availBadge, background: avail ? "#16a34a" : "#dc2626"}}>
          {avail ? `✓ ${book.availableCopies}` : "✗ Out"}
        </div>
 
        {canManage && (
          <div style={{...C.overlay, opacity: hover ? 1 : 0}}>
            <button style={C.editBtn} onClick={() => onEdit(book)}>✏️ Edit</button>
            <button style={C.delBtn}  onClick={() => onDelete(book)}>🗑️ Delete</button>
          </div>
        )}
      </div>
 
      <div style={C.info}>
        {book.department && (
          <span style={{...C.deptTag, background: dc.bg, color: dc.fg}}>
            {book.department}
          </span>
        )}
        <h3 style={C.title} title={book.title}>
          {book.title?.length > 26 ? book.title.slice(0,26)+"…" : book.title}
        </h3>
        <p style={C.author}>{book.author?.length > 22 ? book.author.slice(0,22)+"…" : book.author}</p>
        <div style={C.tags}>
          {book.genre && <span style={C.genreTag}>{book.genre}</span>}
          {book.publishedYear && <span style={C.yearTag}>{book.publishedYear}</span>}
        </div>
        <p style={C.copies}>{book.availableCopies}/{book.totalCopies} copies</p>
      </div>
    </div>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
// AddBookModal
// ═════════════════════════════════════════════════════════════════════════════
function AddBookModal({ editBook, onClose, onSaved }) {
  const [form, setForm] = useState(
    editBook ? {
      title:          editBook.title||"",
      author:         editBook.author||"",
      isbn:           editBook.isbn||"",
      genre:          editBook.genre||"",
      department:     editBook.department||"",
      publisher:      editBook.publisher||"",
      publishedYear:  editBook.publishedYear||"",
      description:    editBook.description||"",
      totalCopies:    editBook.totalCopies??1,
      availableCopies:editBook.availableCopies??1,
    } : { ...EMPTY }
  );
 
  const [coverFile,  setCoverFile]  = useState(null);
  const [coverPrev,  setCoverPrev]  = useState(
    editBook?.coverImageUrl ? buildCoverUrl(editBook.coverImageUrl) : null
  );
  const [prevBroken, setPrevBroken] = useState(false);
  const [formErr,    setFormErr]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef();
 
  const set = (key, val) => setForm(p => ({...p, [key]: val}));
 
  // ── Image pick ──────────────────────────────────────────────────────────────
  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setFormErr("Please pick an image file.");
    if (f.size > 5_242_880)           return setFormErr("Image must be under 5 MB.");
    setCoverFile(f);
    setCoverPrev(URL.createObjectURL(f)); // local blob URL — always works instantly
    setPrevBroken(false);
    setFormErr("");
  };
 
  // ── Upload cover to backend ─────────────────────────────────────────────────
  const uploadCover = async (bookId) => {
    if (!coverFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", coverFile);
      const res = await fetch(`${API_BASE}/books/${bookId}/upload-cover`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) setFormErr("Image upload failed — book was saved without cover.");
    } catch {
      setFormErr("Image upload failed — book was saved without cover.");
    } finally { setUploading(false); }
  };
 
  // ── Save book ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim())  return setFormErr("Title is required.");
    if (!form.author.trim()) return setFormErr("Author is required.");
    setFormErr(""); setSubmitting(true);
    try {
      const payload = {
        ...form,
        publishedYear:   form.publishedYear   ? parseInt(form.publishedYear)   : null,
        totalCopies:     parseInt(form.totalCopies)     || 1,
        availableCopies: parseInt(form.availableCopies) || 0,
      };
      const url    = editBook ? `${API_BASE}/books/${editBook.id}` : `${API_BASE}/books`;
      const method = editBook ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) { setFormErr("Save failed — check backend."); return; }
      const saved = await res.json();
      if (coverFile) await uploadCover(saved.id || editBook?.id);
      onSaved(editBook ? "✅ Book updated!" : "✅ Book added!");
    } catch { setFormErr("Network error — is backend running?"); }
    finally { setSubmitting(false); }
  };
 
  return (
    <div style={M.overlay}>
      <style>{`
        /* Override dark global CSS from LibraryApp inside this modal */
        .bm-modal input, .bm-modal select, .bm-modal textarea {
          background: #ffffff !important;
          color: #111827 !important;
          border: 1.5px solid #e5e7eb !important;
          font-family: 'Segoe UI', sans-serif !important;
        }
        .bm-input::placeholder { color: #9ca3af !important; }
        .bm-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important;
          outline: none !important;
        }
        .bm-input option { color: #1e293b; background: #fff; }
        .bm-file-hidden { display: none !important; width: 0 !important; }
      `}</style>
 
      <div style={M.modal} className="bm-modal">
 
        {/* Header */}
        <div style={M.header}>
          <div>
            <h2 style={M.title}>{editBook ? "✏️ Edit Book" : "➕ Add New Book"}</h2>
            <p style={M.subtitle}>Fill in the details below to {editBook ? "update" : "add"} a book</p>
          </div>
          <button style={M.closeBtn} onClick={onClose}>✕</button>
        </div>
 
        {formErr && <div style={M.errBox}>⚠️ {formErr}</div>}
 
        <div style={M.body}>
 
          {/* ── Cover Image ── */}
          <div style={M.section}>
            <div style={M.sectionTitle}>📷 Book Cover Image</div>
            <div style={M.coverRow}>
 
              {/* Preview box */}
              <div
                style={{
                  ...M.coverPreview,
                  background: (coverPrev && !prevBroken) ? "transparent" : grad(form.title||"A"),
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                onClick={() => fileRef.current?.click()}
              >
                {coverPrev && !prevBroken ? (
                  <img
                    src={coverPrev}
                    alt="cover preview"
                    style={M.coverImg}
                    onError={() => setPrevBroken(true)}
                  />
                ) : (
                  <div style={M.coverPlaceholder}>
                    <span style={{fontSize:32}}>📷</span>
                    <span style={{fontSize:11, marginTop:6, color:"rgba(255,255,255,0.8)"}}>
                      {prevBroken ? "Image not found" : "Click to upload"}
                    </span>
                  </div>
                )}
              </div>
 
              {/* Upload controls */}
              <div style={M.coverInfo}>
                <p style={M.coverHint}>
                  Upload a book cover photo (JPG / PNG, max 5 MB).<br/>
                  <span style={{color:"#16a34a"}}>If skipped, cover is auto-fetched from Google Books.</span>
                </p>
                <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:10}}>
                  <button style={M.chooseBtn} type="button" onClick={() => fileRef.current?.click()}>
                    📷 {coverFile ? "Change Image" : "Choose Image"}
                  </button>
                  {coverFile && (
                    <button style={M.removeBtn} type="button" onClick={() => {
                      setCoverFile(null);
                      setCoverPrev(editBook?.coverImageUrl ? buildCoverUrl(editBook.coverImageUrl) : null);
                      setPrevBroken(false);
                    }}>
                      ✕ Remove
                    </button>
                  )}
                </div>
                {coverFile && (
                  <p style={{fontSize:12, color:"#16a34a", marginTop:8}}>
                    ✓ Selected: {coverFile.name}
                  </p>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="bm-file-hidden"
                  onChange={onFileChange}
                />
              </div>
            </div>
          </div>
 
          {/* ── Book Details ── */}
          <div style={M.section}>
            <div style={M.sectionTitle}>📚 Book Details</div>
            <div style={M.grid2}>
 
              <div style={M.field}>
                <label style={M.label}>Title <span style={{color:"#ef4444"}}>*</span></label>
                <input className="bm-input" style={M.input} type="text"
                  placeholder="Enter book title" value={form.title}
                  onChange={e => set("title", e.target.value)} />
              </div>
 
              <div style={M.field}>
                <label style={M.label}>Author <span style={{color:"#ef4444"}}>*</span></label>
                <input className="bm-input" style={M.input} type="text"
                  placeholder="Enter author name" value={form.author}
                  onChange={e => set("author", e.target.value)} />
              </div>
 
              <div style={M.field}>
                <label style={M.label}>Department 🎓</label>
                <select className="bm-input" style={M.input}
                  value={form.department} onChange={e => set("department", e.target.value)}>
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
 
              <div style={M.field}>
                <label style={M.label}>Genre</label>
                <input className="bm-input" style={M.input} type="text"
                  placeholder="e.g. Textbook, Novel, Reference" value={form.genre}
                  onChange={e => set("genre", e.target.value)} />
              </div>
 
              <div style={M.field}>
                <label style={M.label}>ISBN</label>
                <input className="bm-input" style={M.input} type="text"
                  placeholder="978-0-000-00000-0" value={form.isbn}
                  onChange={e => set("isbn", e.target.value)} />
              </div>
 
              <div style={M.field}>
                <label style={M.label}>Publisher</label>
                <input className="bm-input" style={M.input} type="text"
                  placeholder="e.g. Pearson, McGraw-Hill" value={form.publisher}
                  onChange={e => set("publisher", e.target.value)} />
              </div>
 
              <div style={M.field}>
                <label style={M.label}>Published Year</label>
                <input className="bm-input" style={M.input} type="number"
                  placeholder="e.g. 2024" value={form.publishedYear}
                  onChange={e => set("publishedYear", e.target.value)} />
              </div>
 
              <div />
 
              <div style={M.field}>
                <label style={M.label}>Total Copies</label>
                <input className="bm-input" style={M.input} type="number" min="1"
                  value={form.totalCopies} onChange={e => set("totalCopies", e.target.value)} />
              </div>
 
              <div style={M.field}>
                <label style={M.label}>Available Copies</label>
                <input className="bm-input" style={M.input} type="number" min="0"
                  value={form.availableCopies} onChange={e => set("availableCopies", e.target.value)} />
              </div>
 
            </div>
 
            <div style={{...M.field, marginTop:14}}>
              <label style={M.label}>Description</label>
              <textarea className="bm-input"
                style={{...M.input, minHeight:90, resize:"vertical", lineHeight:1.6}}
                placeholder="Write a short description of the book…"
                value={form.description} onChange={e => set("description", e.target.value)} />
            </div>
          </div>
 
        </div>
 
        {/* Footer */}
        <div style={M.footer}>
          <button style={M.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{...M.saveBtn, opacity: submitting||uploading ? 0.7:1, cursor: submitting||uploading ? "not-allowed":"pointer"}}
            onClick={handleSave} disabled={submitting||uploading}
          >
            {submitting ? "⏳ Saving…" : uploading ? "⏳ Uploading image…" : editBook ? "✅ Update Book" : "✅ Add Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ═════════════════════════════════════════════════════════════════════════════
// Main BookManagement
// ═════════════════════════════════════════════════════════════════════════════
export default function BookManagement({ userRole = "MEMBER" }) {
  const canManage = userRole === "ADMIN" || userRole === "LIBRARIAN";
 
  const [books,       setBooks]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [search,      setSearch]      = useState("");
  const [filterDept,  setFilterDept]  = useState("");
  const [filterAvail, setFilterAvail] = useState("all");
  const [showModal,   setShowModal]   = useState(false);
  const [editBook,    setEditBook]    = useState(null);
  const [delTarget,   setDelTarget]   = useState(null);
 
  useEffect(() => { loadBooks(); }, []);
 
  const loadBooks = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/books`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      setBooks(await res.json());
    } catch {
      setError("Cannot load books — is backend running on port 8080?");
    } finally { setLoading(false); }
  };
 
  const presentDepts = [...new Set(books.map(b => b.department).filter(Boolean))].sort();
 
  const displayed = books.filter(b => {
    const s   = search.toLowerCase();
    const ok1 = !search || b.title?.toLowerCase().includes(s) || b.author?.toLowerCase().includes(s) || b.genre?.toLowerCase().includes(s);
    const ok2 = !filterDept || b.department === filterDept;
    const ok3 = filterAvail === "all"
      || (filterAvail === "available"   && b.availableCopies > 0)
      || (filterAvail === "unavailable" && b.availableCopies === 0);
    return ok1 && ok2 && ok3;
  });
 
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/books/${id}`, { method:"DELETE", headers: authHeaders() });
      setDelTarget(null); setSuccess("🗑️ Book deleted!");
      loadBooks(); setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Delete failed."); }
  };
 
  const handleSaved = (msg) => {
    setShowModal(false); setEditBook(null);
    setSuccess(msg); loadBooks();
    setTimeout(() => setSuccess(""), 3000);
  };
 
  return (
    <div style={P.page}>
 
      <div style={P.header}>
        <div>
          <h1 style={P.title}>{canManage ? "📚 Book Management" : "🔍 Browse Books"}</h1>
          <p style={P.sub}>{canManage ? `${userRole} · Add, edit, upload covers & manage` : "Search and filter the library collection"}</p>
        </div>
        {canManage && (
          <button style={P.addBtn} onClick={() => { setEditBook(null); setShowModal(true); }}>
            + Add Book
          </button>
        )}
      </div>
 
      {success && <div style={P.success}>{success}</div>}
      {error   && <div style={P.errBanner}>{error}</div>}
 
      <div style={P.statsBar}>
        <span style={P.stat}>📦 <b>{books.length}</b> Total</span>
        <span style={P.stat}>✅ <b>{books.filter(b=>b.availableCopies>0).length}</b> Available</span>
        <span style={P.stat}>❌ <b>{books.filter(b=>b.availableCopies===0).length}</b> Unavailable</span>
        {filterDept && <span style={{...P.stat, color:"#2563eb"}}>🎓 {filterDept}</span>}
        <span style={{...P.stat, marginLeft:"auto", color:"#94a3b8"}}>{displayed.length} shown</span>
      </div>
 
      <div style={P.chipRow}>
        <button style={{...P.chip, ...(filterDept===""?P.chipOn:{})}} onClick={() => setFilterDept("")}>🏫 All</button>
        {DEPARTMENTS.map(d => {
          if (presentDepts.length > 0 && !presentDepts.includes(d)) return null;
          const col = DEPT_COLORS[d] || DEPT_COLORS["GENERAL"];
          const on  = filterDept === d;
          return (
            <button key={d}
              style={{...P.chip, background: on ? col.fg : col.bg, color: on ? "#fff" : col.fg, border:`1.5px solid ${col.fg}`}}
              onClick={() => setFilterDept(on ? "" : d)}
            >{d}</button>
          );
        })}
      </div>
 
      <div style={P.filterRow}>
        <div style={P.searchWrap}>
          <span style={P.searchIcon}>🔍</span>
          <input style={P.searchInput} placeholder="Search title, author, genre…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button style={P.clearBtn} onClick={() => setSearch("")}>✕</button>}
        </div>
        <select style={P.select} value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
          <option value="all">All Availability</option>
          <option value="available">Available Only</option>
          <option value="unavailable">Unavailable Only</option>
        </select>
      </div>
 
      {loading ? (
        <div style={P.center}><div style={{fontSize:48, marginBottom:12}}>⏳</div><p>Loading books…</p></div>
      ) : displayed.length === 0 ? (
        <div style={P.center}>
          <div style={{fontSize:52, marginBottom:12}}>📭</div>
          <h3>No books found</h3>
          <p style={{color:"#94a3b8", marginTop:4}}>{filterDept ? `No books tagged "${filterDept}"` : "Try clearing filters"}</p>
        </div>
      ) : (
        <div style={P.grid}>
          {displayed.map(b => (
            <BookCard key={b.id} book={b} canManage={canManage}
              onEdit={(book) => { setEditBook(book); setShowModal(true); }}
              onDelete={setDelTarget} />
          ))}
        </div>
      )}
 
      {showModal && (
        <AddBookModal editBook={editBook}
          onClose={() => { setShowModal(false); setEditBook(null); }}
          onSaved={handleSaved} />
      )}
 
      {delTarget && (
        <div style={M.overlay}>
          <div style={{...M.modal, maxWidth:400, textAlign:"center", padding:36}}>
            <div style={{fontSize:52, marginBottom:12}}>🗑️</div>
            <h3 style={{fontSize:18, color:"#0f172a", marginBottom:8}}>Delete this book?</h3>
            <p style={{color:"#64748b", fontSize:14, marginBottom:24}}>
              "<b>{delTarget.title}</b>" will be permanently removed.
            </p>
            <div style={{display:"flex", gap:10, justifyContent:"center"}}>
              <button style={M.cancelBtn} onClick={() => setDelTarget(null)}>Cancel</button>
              <button style={{...M.saveBtn, background:"#dc2626"}} onClick={() => handleDelete(delTarget.id)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── Styles ──────────────────────────────────────────────────────────────────
const C = {
  wrap:       { background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", border:"1px solid #e2e8f0" },
  coverBox:   { position:"relative", height:200, overflow:"hidden", background:"#f1f5f9" },
  img:        { position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"opacity 0.3s" },
  placeholder:{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" },
  letter:     { fontSize:64, fontWeight:800, color:"rgba(255,255,255,0.7)", fontFamily:"Georgia,serif" },
  availBadge: { position:"absolute", top:10, right:10, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20, zIndex:2 },
  overlay:    { position:"absolute", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, transition:"opacity 0.2s", zIndex:3 },
  editBtn:    { background:"#fff", border:"none", padding:"8px 20px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", color:"#1d4ed8", width:120 },
  delBtn:     { background:"rgba(220,38,38,0.9)", border:"none", padding:"8px 20px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", color:"#fff", width:120 },
  info:       { padding:"12px 14px" },
  deptTag:    { display:"inline-block", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, marginBottom:5, letterSpacing:"0.5px", textTransform:"uppercase" },
  title:      { fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 3px", lineHeight:1.3 },
  author:     { fontSize:12, color:"#64748b", margin:"0 0 7px" },
  tags:       { display:"flex", gap:5, flexWrap:"wrap", marginBottom:6 },
  genreTag:   { background:"#eff6ff", color:"#2563eb", padding:"2px 7px", borderRadius:12, fontSize:10, fontWeight:600 },
  yearTag:    { background:"#f1f5f9", color:"#64748b", padding:"2px 7px", borderRadius:12, fontSize:10 },
  copies:     { fontSize:11, color:"#94a3b8", margin:0 },
};
 
const M = {
  overlay:      { position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 },
  modal:        { background:"#ffffff", borderRadius:20, width:"100%", maxWidth:720, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 30px 80px rgba(0,0,0,0.25)", display:"flex", flexDirection:"column" },
  header:       { display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"24px 28px 16px", borderBottom:"1px solid #f1f5f9" },
  title:        { fontSize:22, fontWeight:800, color:"#0f172a", margin:0 },
  subtitle:     { fontSize:13, color:"#64748b", marginTop:4 },
  closeBtn:     { background:"#f1f5f9", border:"none", borderRadius:10, width:36, height:36, cursor:"pointer", fontSize:16, fontWeight:700, color:"#64748b", flexShrink:0 },
  errBox:       { margin:"12px 28px 0", background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:"10px 14px", borderRadius:10, fontSize:13 },
  body:         { padding:"20px 28px", flex:1 },
  section:      { marginBottom:24 },
  sectionTitle: { fontSize:13, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:14, paddingBottom:8, borderBottom:"1px solid #f1f5f9" },
  coverRow:     { display:"flex", gap:20, alignItems:"flex-start" },
  coverPreview: { width:100, height:130, borderRadius:12, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", border:"2px dashed #cbd5e1" },
  coverImg:     { width:"100%", height:"100%", objectFit:"cover", borderRadius:10 },
  coverPlaceholder: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" },
  coverInfo:    { flex:1 },
  coverHint:    { fontSize:12, color:"#64748b", lineHeight:1.6, margin:0 },
  chooseBtn:    { background:"#3b82f6", color:"#fff", border:"none", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 },
  removeBtn:    { background:"#fef2f2", color:"#dc2626", border:"1px solid #fecaca", padding:"8px 14px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 },
  grid2:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px 20px" },
  field:        { display:"flex", flexDirection:"column", gap:6 },
  label:        { fontSize:12, fontWeight:700, color:"#374151", letterSpacing:"0.3px" },
  input:        { padding:"11px 14px", border:"1.5px solid #e5e7eb", borderRadius:10, fontSize:14, color:"#111827", background:"#ffffff", outline:"none", fontFamily:"inherit", width:"100%", boxSizing:"border-box" },
  footer:       { display:"flex", justifyContent:"flex-end", gap:10, padding:"16px 28px", borderTop:"1px solid #f1f5f9" },
  cancelBtn:    { padding:"11px 24px", border:"1.5px solid #e5e7eb", borderRadius:10, background:"#fff", cursor:"pointer", fontWeight:600, fontSize:14, color:"#64748b" },
  saveBtn:      { padding:"11px 28px", background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14 },
};
 
const P = {
  page:       { padding:28, fontFamily:"'Segoe UI',sans-serif", background:"#f8fafc", minHeight:"100vh" },
  header:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 },
  title:      { fontSize:26, fontWeight:800, color:"#0f172a", margin:"0 0 4px" },
  sub:        { fontSize:13, color:"#64748b", margin:0 },
  addBtn:     { background:"linear-gradient(135deg,#3b82f6,#2563eb)", color:"#fff", border:"none", padding:"12px 22px", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, whiteSpace:"nowrap" },
  success:    { background:"#dcfce7", color:"#166534", padding:"12px 16px", borderRadius:10, marginBottom:14, fontWeight:600 },
  errBanner:  { background:"#fee2e2", color:"#991b1b", padding:"12px 16px", borderRadius:10, marginBottom:14, fontWeight:600 },
  statsBar:   { display:"flex", gap:20, marginBottom:14, padding:"10px 16px", background:"#fff", borderRadius:10, border:"1px solid #e2e8f0", flexWrap:"wrap", alignItems:"center" },
  stat:       { fontSize:13, color:"#475569" },
  chipRow:    { display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 },
  chip:       { padding:"5px 13px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"1.5px solid #e2e8f0", background:"#f1f5f9", color:"#475569", whiteSpace:"nowrap" },
  chipOn:     { background:"#1d4ed8", color:"#fff", border:"1.5px solid #1d4ed8" },
  filterRow:  { display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" },
  searchWrap: { flex:1, minWidth:200, position:"relative", display:"flex", alignItems:"center" },
  searchIcon: { position:"absolute", left:12, fontSize:15, pointerEvents:"none" },
  searchInput:{ width:"100%", padding:"10px 36px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#fff", outline:"none", boxSizing:"border-box", color:"#0f172a" },
  clearBtn:   { position:"absolute", right:10, background:"none", border:"none", cursor:"pointer", color:"#94a3b8" },
  select:     { padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#fff", cursor:"pointer", outline:"none", color:"#0f172a" },
  grid:       { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:20 },
  center:     { textAlign:"center", padding:"80px 0", color:"#64748b" },
};