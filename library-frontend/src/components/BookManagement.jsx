import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// BookManagement.jsx  —  v2
//
// NEW in this version:
//   ✅ Department filter chips (CSE, ECE, EEE, MECHANICAL, CIVIL, MBBS, MBA…)
//   ✅ Book cover image upload — Admin/Librarian can upload a photo per book
//   ✅ Cover shown from backend first, then Google Books API as fallback
//   ✅ Department tag on every book card
//
// Usage:
//   <BookManagement userRole="ADMIN"     />
//   <BookManagement userRole="LIBRARIAN" />
//   <BookManagement userRole="MEMBER"    />
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:8080/api";
const SERVER   = "http://localhost:8080";          // base for uploaded image URLs
const getToken = () => localStorage.getItem("token");
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── All departments ───────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "CSE","ECE","EEE","MECHANICAL","CIVIL",
  "MBBS","MBA","HISTORY","QUANTUM PHYSICS",
  "DATA SCIENCE","BIOTECHNOLOGY","PHARMACY",
  "ARCHITECTURE","LAW","GENERAL",
];

const DEPT_COLORS = {
  "CSE":            { bg:"#dbeafe", fg:"#1d4ed8" },
  "ECE":            { bg:"#d1fae5", fg:"#065f46" },
  "EEE":            { bg:"#fef9c3", fg:"#854d0e" },
  "MECHANICAL":     { bg:"#fee2e2", fg:"#991b1b" },
  "CIVIL":          { bg:"#ede9fe", fg:"#5b21b6" },
  "MBBS":           { bg:"#fce7f3", fg:"#9d174d" },
  "MBA":            { bg:"#e0f2fe", fg:"#0369a1" },
  "HISTORY":        { bg:"#fff7ed", fg:"#9a3412" },
  "QUANTUM PHYSICS":{ bg:"#f0fdf4", fg:"#15803d" },
  "DATA SCIENCE":   { bg:"#f5f3ff", fg:"#6d28d9" },
  "BIOTECHNOLOGY":  { bg:"#ecfdf5", fg:"#065f46" },
  "PHARMACY":       { bg:"#fdf4ff", fg:"#7e22ce" },
  "ARCHITECTURE":   { bg:"#fff1f2", fg:"#be123c" },
  "LAW":            { bg:"#f0f9ff", fg:"#0c4a6e" },
  "GENERAL":        { bg:"#f1f5f9", fg:"#475569" },
};

// ── Google Books cover fallback ───────────────────────────────────────────────
const fetchGoogleCover = async (title, author) => {
  try {
    const q   = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    const d   = await res.json();
    const lnk = d?.items?.[0]?.volumeInfo?.imageLinks;
    return lnk?.thumbnail || lnk?.smallThumbnail || null;
  } catch { return null; }
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

// ═════════════════════════════════════════════════════════════════════════════
// BookCard
// ═════════════════════════════════════════════════════════════════════════════
function BookCard({ book, canManage, onEdit, onDelete }) {
  const [cover,  setCover]  = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [err,    setErr]    = useState(false);
  const [hover,  setHover]  = useState(false);

  useEffect(() => {
    if (book.coverImageUrl) {
      setCover(`${SERVER}/${book.coverImageUrl}`);
    } else {
      fetchGoogleCover(book.title, book.author).then(setCover);
    }
  }, [book.coverImageUrl, book.title, book.author]);

  const avail   = book.availableCopies > 0;
  const dc      = DEPT_COLORS[book.department] || DEPT_COLORS["GENERAL"];

  return (
    <div style={C.wrap}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Cover image area */}
      <div style={C.coverBox}>
        {cover && !err ? (
          <>
            {!loaded && <div style={{...C.placeholder, background: grad(book.title)}}><span style={C.placeholderLetter}>{book.title?.[0]}</span></div>}
            <img src={cover} alt={book.title}
              style={{...C.img, opacity: loaded ? 1 : 0}}
              onLoad={() => setLoaded(true)}
              onError={() => setErr(true)} />
          </>
        ) : (
          <div style={{...C.placeholder, background: grad(book.title)}}>
            <span style={C.placeholderLetter}>{book.title?.[0]?.toUpperCase()}</span>
          </div>
        )}

        {/* Availability badge */}
        <div style={{...C.availBadge, background: avail ? "#16a34a" : "#dc2626"}}>
          {avail ? `✓ ${book.availableCopies}` : "✗ Out"}
        </div>

        {/* Hover overlay for manage actions */}
        {canManage && (
          <div style={{...C.overlay, opacity: hover ? 1 : 0}}>
            <button style={C.editBtn} onClick={() => onEdit(book)}>✏️ Edit</button>
            <button style={C.delBtn}  onClick={() => onDelete(book)}>🗑️ Delete</button>
          </div>
        )}
      </div>

      {/* Card info */}
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
// Main: BookManagement
// ═════════════════════════════════════════════════════════════════════════════
export default function BookManagement({ userRole = "MEMBER" }) {
  const canManage = userRole === "ADMIN" || userRole === "LIBRARIAN";

  const [books,        setBooks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");

  // Filters
  const [search,       setSearch]       = useState("");
  const [filterDept,   setFilterDept]   = useState("");
  const [filterAvail,  setFilterAvail]  = useState("all");

  // Modal
  const [showModal,    setShowModal]    = useState(false);
  const [editBook,     setEditBook]     = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [formErr,      setFormErr]      = useState("");
  const [submitting,   setSubmitting]   = useState(false);
  const [delTarget,    setDelTarget]    = useState(null);

  // Image upload
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPrev,    setCoverPrev]    = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const fileRef = useRef();

  // ── Load books ──────────────────────────────────────────────────────────────
  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/books`, { headers: authHeaders() });
      if (!res.ok) throw new Error();
      setBooks(await res.json());
    } catch { setError("Cannot load books — is backend running on port 8080?"); }
    finally  { setLoading(false); }
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const presentDepts = [...new Set(books.map(b => b.department).filter(Boolean))].sort();

  const displayed = books.filter(b => {
    const s  = search.toLowerCase();
    const ok1 = !search || b.title?.toLowerCase().includes(s) || b.author?.toLowerCase().includes(s) || b.genre?.toLowerCase().includes(s);
    const ok2 = !filterDept || b.department === filterDept;
    const ok3 = filterAvail === "all"
      || (filterAvail === "available"   && b.availableCopies > 0)
      || (filterAvail === "unavailable" && b.availableCopies === 0);
    return ok1 && ok2 && ok3;
  });

  // ── Modal helpers ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditBook(null); setForm(EMPTY);
    setCoverFile(null); setCoverPrev(null);
    setFormErr(""); setShowModal(true);
  };

  const openEdit = (book) => {
    setEditBook(book);
    setForm({
      title: book.title||"", author: book.author||"",
      isbn: book.isbn||"", genre: book.genre||"",
      department: book.department||"",
      publisher: book.publisher||"",
      publishedYear: book.publishedYear||"",
      description: book.description||"",
      totalCopies: book.totalCopies??1,
      availableCopies: book.availableCopies??1,
    });
    setCoverFile(null);
    setCoverPrev(book.coverImageUrl ? `${SERVER}/${book.coverImageUrl}` : null);
    setFormErr(""); setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditBook(null); };

  // ── Image pick ──────────────────────────────────────────────────────────────
  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) return setFormErr("Please pick an image file.");
    if (f.size > 5_242_880) return setFormErr("Image must be under 5 MB.");
    setCoverFile(f);
    setCoverPrev(URL.createObjectURL(f));
    setFormErr("");
  };

  // ── Upload cover after save ──────────────────────────────────────────────────
  const uploadCover = async (bookId) => {
    if (!coverFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", coverFile);
      await fetch(`${API_BASE}/books/${bookId}/upload-cover`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
    } catch { /* non-fatal */ }
    finally { setUploading(false); }
  };

  // ── Save book ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.title.trim())  return setFormErr("Title is required.");
    if (!form.author.trim()) return setFormErr("Author is required.");
    setFormErr(""); setSubmitting(true);
    try {
      const payload = {
        ...form,
        publishedYear: form.publishedYear ? parseInt(form.publishedYear) : null,
        totalCopies:   parseInt(form.totalCopies),
        availableCopies: parseInt(form.availableCopies),
      };
      const res = await fetch(
        editBook ? `${API_BASE}/books/${editBook.id}` : `${API_BASE}/books`,
        { method: editBook ? "PUT" : "POST", headers: authHeaders(), body: JSON.stringify(payload) }
      );
      if (!res.ok) { setFormErr("Save failed — check backend."); return; }
      const saved = await res.json();
      if (coverFile) await uploadCover(saved.id || editBook?.id);
      closeModal();
      setSuccess(editBook ? "✅ Book updated!" : "✅ Book added!");
      loadBooks();
      setTimeout(() => setSuccess(""), 3000);
    } catch { setFormErr("Network error."); }
    finally { setSubmitting(false); }
  };

  // ── Delete book ──────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/books/${id}`, { method: "DELETE", headers: authHeaders() });
      setDelTarget(null);
      setSuccess("🗑️ Book deleted!");
      loadBooks();
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("Delete failed."); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div style={P.page}>

      {/* Header */}
      <div style={P.header}>
        <div>
          <h1 style={P.title}>{canManage ? "📚 Book Management" : "🔍 Browse Books"}</h1>
          <p style={P.sub}>{canManage ? `${userRole} · Add, edit, upload covers & manage` : "Search and filter the library collection"}</p>
        </div>
        {canManage && <button style={P.addBtn} onClick={openAdd}>+ Add Book</button>}
      </div>

      {success && <div style={P.success}>{success}</div>}
      {error   && <div style={P.errBanner}>{error}</div>}

      {/* Stats */}
      <div style={P.statsBar}>
        <span style={P.stat}>📦 <b>{books.length}</b> Total</span>
        <span style={P.stat}>✅ <b>{books.filter(b=>b.availableCopies>0).length}</b> Available</span>
        <span style={P.stat}>❌ <b>{books.filter(b=>b.availableCopies===0).length}</b> Unavailable</span>
        {filterDept && <span style={{...P.stat, color:"#2563eb"}}>🎓 {filterDept}</span>}
        <span style={{...P.stat, marginLeft:"auto", color:"#94a3b8"}}>{displayed.length} shown</span>
      </div>

      {/* ── Department Chips ─────────────────────────────────────────────────── */}
      <div style={P.chipRow}>
        <button
          style={{...P.chip, ...(filterDept===""?P.chipOn:{})}}
          onClick={() => setFilterDept("")}
        >🏫 All</button>

        {DEPARTMENTS.map(d => {
          // only show chip if dept exists in loaded books (or if no books yet — show all)
          if (presentDepts.length > 0 && !presentDepts.includes(d)) return null;
          const col = DEPT_COLORS[d] || DEPT_COLORS["GENERAL"];
          const on  = filterDept === d;
          return (
            <button key={d}
              style={{
                ...P.chip,
                background: on ? col.fg : col.bg,
                color: on ? "#fff" : col.fg,
                border: `1.5px solid ${col.fg}`,
              }}
              onClick={() => setFilterDept(on ? "" : d)}
            >{d}</button>
          );
        })}
      </div>

      {/* Search + availability */}
      <div style={P.filterRow}>
        <div style={P.searchWrap}>
          <span style={P.searchIcon}>🔍</span>
          <input
            style={P.searchInput}
            placeholder="Search title, author, genre…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button style={P.clearBtn} onClick={() => setSearch("")}>✕</button>}
        </div>
        <select style={P.select} value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
          <option value="all">All Availability</option>
          <option value="available">Available Only</option>
          <option value="unavailable">Unavailable Only</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={P.center}>
          <div style={{fontSize:48, marginBottom:12}}>⏳</div>
          <p>Loading books…</p>
        </div>
      ) : displayed.length === 0 ? (
        <div style={P.center}>
          <div style={{fontSize:52, marginBottom:12}}>📭</div>
          <h3>No books found</h3>
          <p style={{color:"#94a3b8", marginTop:4}}>
            {filterDept ? `No books tagged "${filterDept}"` : "Try clearing filters"}
          </p>
        </div>
      ) : (
        <div style={P.grid}>
          {displayed.map(b => (
            <BookCard key={b.id} book={b} canManage={canManage}
              onEdit={openEdit} onDelete={setDelTarget} />
          ))}
        </div>
      )}

      {/* ════════ ADD / EDIT MODAL ════════ */}
      {showModal && (
        <div style={P.overlay}>
          <div style={P.modal}>
            <div style={P.mHead}>
              <h2 style={P.mTitle}>{editBook ? "✏️ Edit Book" : "➕ Add New Book"}</h2>
              <button style={P.closeBtn} onClick={closeModal}>✕</button>
            </div>

            {formErr && <div style={P.formErr}>{formErr}</div>}

            {/* Cover upload */}
            <div style={P.uploadBox}>
              <label style={P.label}>📷 Book Cover Image</label>
              <div style={P.uploadRow}>
                <div
                  style={{...P.previewBox, background: coverPrev ? "transparent" : grad(form.title||"A")}}
                  onClick={() => fileRef.current?.click()}
                >
                  {coverPrev
                    ? <img src={coverPrev} alt="preview" style={P.previewImg} />
                    : <div style={P.previewPlaceholder}><span style={{fontSize:26}}>📷</span><span style={{fontSize:10, marginTop:3}}>Click to upload</span></div>
                  }
                </div>
                <div style={{flex:1}}>
                  <p style={{fontSize:12, color:"#64748b", marginBottom:8}}>
                    Upload a cover photo (JPG / PNG, max 5 MB).<br/>
                    If skipped, we auto-fetch from Google Books.
                  </p>
                  <button style={P.pickBtn} type="button" onClick={() => fileRef.current?.click()}>
                    {coverFile ? "Change Image" : "Choose Image"}
                  </button>
                  {coverFile && (
                    <>
                      <button style={P.clearImgBtn} type="button"
                        onClick={() => { setCoverFile(null); setCoverPrev(editBook?.coverImageUrl ? `${SERVER}/${editBook.coverImageUrl}` : null); }}>
                        Remove
                      </button>
                      <p style={{fontSize:11, color:"#16a34a", marginTop:5}}>✓ {coverFile.name}</p>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={onFileChange} />
                </div>
              </div>
            </div>

            {/* Form grid */}
            <div style={P.formGrid}>
              {[
                {label:"Title *",    key:"title",       placeholder:"Book title"},
                {label:"Author *",   key:"author",      placeholder:"Author name"},
                {label:"ISBN",       key:"isbn",        placeholder:"978-..."},
                {label:"Genre",      key:"genre",       placeholder:"Textbook / Novel"},
                {label:"Publisher",  key:"publisher",   placeholder:"Publisher"},
                {label:"Year",       key:"publishedYear",placeholder:"2024", type:"number"},
                {label:"Total Copies",    key:"totalCopies",     placeholder:"", type:"number"},
                {label:"Available Copies",key:"availableCopies", placeholder:"", type:"number"},
              ].map(f => (
                <div key={f.key} style={P.fg}>
                  <label style={P.label}>{f.label}</label>
                  <input
                    style={P.input}
                    type={f.type||"text"}
                    value={form[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setForm({...form, [f.key]: e.target.value})}
                  />
                </div>
              ))}

              {/* Department — full row */}
              <div style={{...P.fg, gridColumn:"1/-1"}}>
                <label style={P.label}>Department 🎓</label>
                <select style={P.input} value={form.department}
                  onChange={e => setForm({...form, department: e.target.value})}>
                  <option value="">-- Select Department --</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* Description — full row */}
              <div style={{...P.fg, gridColumn:"1/-1"}}>
                <label style={P.label}>Description</label>
                <textarea style={{...P.input, minHeight:70, resize:"vertical"}}
                  value={form.description}
                  placeholder="Short description…"
                  onChange={e => setForm({...form, description: e.target.value})} />
              </div>
            </div>

            <div style={P.mFoot}>
              <button style={P.cancelBtn} onClick={closeModal}>Cancel</button>
              <button style={{...P.saveBtn, opacity: submitting||uploading ? 0.7 : 1}}
                onClick={handleSave} disabled={submitting||uploading}>
                {submitting ? "Saving…" : uploading ? "Uploading image…" : editBook ? "Update Book" : "Add Book"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ DELETE CONFIRM ════════ */}
      {delTarget && (
        <div style={P.overlay}>
          <div style={{...P.modal, maxWidth:400, textAlign:"center"}}>
            <div style={{fontSize:48, marginBottom:10}}>🗑️</div>
            <h3 style={{fontSize:17, marginBottom:8}}>Delete this book?</h3>
            <p style={{color:"#64748b", marginBottom:22, fontSize:13}}>
              "<b>{delTarget.title}</b>" will be permanently removed.
            </p>
            <div style={{display:"flex", gap:10, justifyContent:"center"}}>
              <button style={P.cancelBtn} onClick={() => setDelTarget(null)}>Cancel</button>
              <button style={{...P.saveBtn, background:"#dc2626"}} onClick={() => handleDelete(delTarget.id)}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Card styles ───────────────────────────────────────────────────────────────
const C = {
  wrap:   { background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 12px rgba(0,0,0,0.08)", border:"1px solid #e2e8f0" },
  coverBox: { position:"relative", height:200, overflow:"hidden", background:"#f1f5f9" },
  img:    { width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"opacity 0.3s" },
  placeholder: { position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" },
  placeholderLetter: { fontSize:64, fontWeight:800, color:"rgba(255,255,255,0.7)", fontFamily:"Georgia,serif" },
  availBadge: { position:"absolute", top:10, right:10, color:"#fff", fontSize:11, fontWeight:700, padding:"3px 8px", borderRadius:20 },
  overlay: { position:"absolute", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, transition:"opacity 0.2s", pointerEvents:"auto" },
  editBtn:{ background:"#fff", border:"none", padding:"8px 20px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", color:"#1d4ed8", width:120 },
  delBtn: { background:"rgba(220,38,38,0.9)", border:"none", padding:"8px 20px", borderRadius:8, fontWeight:700, fontSize:13, cursor:"pointer", color:"#fff", width:120 },
  info:   { padding:"12px 14px" },
  deptTag:{ display:"inline-block", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20, marginBottom:5, letterSpacing:"0.5px", textTransform:"uppercase" },
  title:  { fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 3px", lineHeight:1.3 },
  author: { fontSize:12, color:"#64748b", margin:"0 0 7px" },
  tags:   { display:"flex", gap:5, flexWrap:"wrap", marginBottom:6 },
  genreTag:{ background:"#eff6ff", color:"#2563eb", padding:"2px 7px", borderRadius:12, fontSize:10, fontWeight:600 },
  yearTag: { background:"#f1f5f9", color:"#64748b", padding:"2px 7px", borderRadius:12, fontSize:10 },
  copies: { fontSize:11, color:"#94a3b8", margin:0 },
};

// ── Page styles ───────────────────────────────────────────────────────────────
const P = {
  page:    { padding:28, fontFamily:"'Segoe UI',sans-serif", background:"#f8fafc", minHeight:"100vh" },
  header:  { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 },
  title:   { fontSize:26, fontWeight:800, color:"#0f172a", margin:"0 0 4px" },
  sub:     { fontSize:13, color:"#64748b", margin:0 },
  addBtn:  { background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff", border:"none", padding:"12px 22px", borderRadius:10, cursor:"pointer", fontWeight:700, fontSize:14, boxShadow:"0 4px 12px rgba(37,99,235,0.3)", whiteSpace:"nowrap" },
  success: { background:"#dcfce7", color:"#166534", padding:"12px 16px", borderRadius:10, marginBottom:14, fontWeight:600 },
  errBanner:{ background:"#fee2e2", color:"#991b1b", padding:"12px 16px", borderRadius:10, marginBottom:14, fontWeight:600 },
  statsBar:{ display:"flex", gap:20, marginBottom:14, padding:"10px 16px", background:"#fff", borderRadius:10, border:"1px solid #e2e8f0", flexWrap:"wrap", alignItems:"center" },
  stat:    { fontSize:13, color:"#475569" },

  // dept chips
  chipRow: { display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 },
  chip:    { padding:"5px 13px", borderRadius:20, fontSize:12, fontWeight:600, cursor:"pointer", border:"1.5px solid #e2e8f0", background:"#f1f5f9", color:"#475569", transition:"all 0.15s", whiteSpace:"nowrap" },
  chipOn:  { background:"#1d4ed8", color:"#fff", border:"1.5px solid #1d4ed8" },

  filterRow:  { display:"flex", gap:10, marginBottom:20, flexWrap:"wrap" },
  searchWrap: { flex:1, minWidth:200, position:"relative", display:"flex", alignItems:"center" },
  searchIcon: { position:"absolute", left:12, fontSize:15, pointerEvents:"none" },
  searchInput:{ width:"100%", padding:"10px 36px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#fff", outline:"none", boxSizing:"border-box" },
  clearBtn:   { position:"absolute", right:10, background:"none", border:"none", cursor:"pointer", color:"#94a3b8" },
  select:     { padding:"10px 14px", border:"1px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#fff", cursor:"pointer", outline:"none" },

  grid:   { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:20 },
  center: { textAlign:"center", padding:"80px 0", color:"#64748b" },

  // modal
  overlay:  { position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 },
  modal:    { background:"#fff", borderRadius:16, padding:28, width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 25px 60px rgba(0,0,0,0.2)" },
  mHead:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 },
  mTitle:   { fontSize:19, fontWeight:700, color:"#0f172a", margin:0 },
  closeBtn: { background:"#f1f5f9", border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", fontSize:14, fontWeight:700, color:"#64748b" },

  // upload
  uploadBox:  { marginBottom:16, padding:14, background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" },
  uploadRow:  { display:"flex", gap:16, alignItems:"flex-start", marginTop:8 },
  previewBox: { width:90, height:118, borderRadius:8, overflow:"hidden", cursor:"pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", border:"2px dashed #cbd5e1" },
  previewImg: { width:"100%", height:"100%", objectFit:"cover" },
  previewPlaceholder: { display:"flex", flexDirection:"column", alignItems:"center", color:"rgba(255,255,255,0.85)" },
  pickBtn:    { background:"#2563eb", color:"#fff", border:"none", padding:"7px 15px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13, marginRight:8 },
  clearImgBtn:{ background:"#fee2e2", color:"#dc2626", border:"none", padding:"7px 13px", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 },

  formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 },
  fg:       { display:"flex", flexDirection:"column" },
  label:    { fontSize:11, fontWeight:700, color:"#475569", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.5px" },
  input:    { padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, outline:"none", background:"#f8fafc", fontFamily:"inherit" },
  formErr:  { background:"#fee2e2", color:"#dc2626", padding:"10px 14px", borderRadius:8, marginBottom:14, fontSize:13 },

  mFoot:     { display:"flex", justifyContent:"flex-end", gap:10, marginTop:20 },
  cancelBtn: { padding:"10px 22px", border:"1px solid #e2e8f0", borderRadius:8, background:"#fff", cursor:"pointer", fontWeight:600, fontSize:14, color:"#64748b" },
  saveBtn:   { padding:"10px 22px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:14 },
};
