// import { useState, useEffect } from "react";

// // ─────────────────────────────────────────────────────────────────────────────
// // BookManagement.jsx  —  Role-Based Book Management with Image Cards
// //
// // Usage:
// //   <BookManagement userRole="ADMIN" />
// //   <BookManagement userRole="LIBRARIAN" />
// //   <BookManagement userRole="MEMBER" />
// //
// // ADMIN     → View + Add + Edit + Delete + image cards
// // LIBRARIAN → View + Add + Edit + Delete + image cards
// // MEMBER    → View + Search only + image cards
// // ─────────────────────────────────────────────────────────────────────────────
// import "./BookManagement.css";
// const API_BASE = "http://localhost:8080/api";
// const getToken = () => localStorage.getItem("token");
// const authHeaders = () => ({
//   "Content-Type": "application/json",
//   Authorization: `Bearer ${getToken()}`,
// });

// // Google Books API — fetches a real cover image for a book by title+author
// const fetchBookCover = async (title, author) => {
//   try {
//     const query = encodeURIComponent(`${title} ${author}`);
//     const res = await fetch(
//       `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`
//     );
//     const data = await res.json();
//     const imageLinks = data?.items?.[0]?.volumeInfo?.imageLinks;
//     return (
//       imageLinks?.thumbnail ||
//       imageLinks?.smallThumbnail ||
//       null
//     );
//   } catch {
//     return null;
//   }
// };

// // Generates a beautiful gradient placeholder when no cover image is found
// const getPlaceholderGradient = (title) => {
//   const gradients = [
//     "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
//     "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
//     "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
//     "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
//     "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
//     "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
//     "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
//     "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
//     "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
//     "linear-gradient(135deg, #fd7043 0%, #ff8a65 100%)",
//   ];
//   const index = (title?.charCodeAt(0) || 0) % gradients.length;
//   return gradients[index];
// };

// const emptyForm = {
//   title: "", author: "", isbn: "", genre: "",
//   publisher: "", publishedYear: "", description: "",
//   totalCopies: 1, availableCopies: 1,
// };

// // ─── BookCard Component ───────────────────────────────────────────────────────
// function BookCard({ book, canManage, onEdit, onDelete }) {
//   const [coverUrl, setCoverUrl] = useState(null);
//   const [imgLoaded, setImgLoaded] = useState(false);
//   const [imgError, setImgError] = useState(false);

//   useEffect(() => {
//     fetchBookCover(book.title, book.author).then((url) => {
//       setCoverUrl(url);
//     });
//   }, [book.title, book.author]);

//   const isAvailable = book.availableCopies > 0;

//   return (
//     <div style={cardStyles.wrapper}>
//       {/* Book Cover Image */}
//       <div style={cardStyles.coverContainer}>
//         {coverUrl && !imgError ? (
//           <>
//             {!imgLoaded && (
//               <div style={{ ...cardStyles.placeholder, background: getPlaceholderGradient(book.title) }}>
//                 <span style={cardStyles.placeholderIcon}>📖</span>
//               </div>
//             )}
//             <img
//               src={coverUrl}
//               alt={book.title}
//               style={{ ...cardStyles.coverImg, opacity: imgLoaded ? 1 : 0 }}
//               onLoad={() => setImgLoaded(true)}
//               onError={() => setImgError(true)}
//             />
//           </>
//         ) : (
//           <div style={{ ...cardStyles.placeholder, background: getPlaceholderGradient(book.title) }}>
//             <span style={cardStyles.placeholderTitle}>{book.title?.charAt(0)?.toUpperCase()}</span>
//           </div>
//         )}

//         {/* Availability badge over image */}
//         <div style={{
//           ...cardStyles.badge,
//           background: isAvailable ? "#16a34a" : "#dc2626",
//         }}>
//           {isAvailable ? `✓ ${book.availableCopies} Available` : "✗ Unavailable"}
//         </div>

//         {/* Hover overlay with actions — only for managers */}
//         {canManage && (
//           <div style={cardStyles.overlay}>
//             <button style={cardStyles.overlayEditBtn} onClick={() => onEdit(book)}>
//               ✏️ Edit
//             </button>
//             <button style={cardStyles.overlayDeleteBtn} onClick={() => onDelete(book)}>
//               🗑️ Delete
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Book Info */}
//       <div style={cardStyles.info}>
//         <h3 style={cardStyles.bookTitle} title={book.title}>
//           {book.title?.length > 28 ? book.title.substring(0, 28) + "…" : book.title}
//         </h3>
//         <p style={cardStyles.bookAuthor}>
//           {book.author?.length > 24 ? book.author.substring(0, 24) + "…" : book.author}
//         </p>
//         <div style={cardStyles.metaRow}>
//           {book.genre && <span style={cardStyles.genreTag}>{book.genre}</span>}
//           {book.publishedYear && <span style={cardStyles.yearTag}>{book.publishedYear}</span>}
//         </div>
//         <p style={cardStyles.copies}>
//           {book.availableCopies} / {book.totalCopies} copies
//         </p>
//       </div>
//     </div>
//   );
// }

// // ─── Main BookManagement Component ───────────────────────────────────────────
// export default function BookManagement({ userRole = "MEMBER" }) {
//   const canManage = userRole === "ADMIN" || userRole === "LIBRARIAN";

//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterGenre, setFilterGenre] = useState("");
//   const [filterAvailability, setFilterAvailability] = useState("all");

//   const [showModal, setShowModal] = useState(false);
//   const [editingBook, setEditingBook] = useState(null);
//   const [formData, setFormData] = useState(emptyForm);
//   const [formError, setFormError] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   // ─── Fetch books ────────────────────────────────────────────────
//   useEffect(() => { fetchBooks(); }, []);

//   const fetchBooks = async (keyword = "") => {
//     setLoading(true);
//     setError("");
//     try {
//       const url = keyword
//         ? `${API_BASE}/books?search=${encodeURIComponent(keyword)}`
//         : `${API_BASE}/books`;
//       const res = await fetch(url, { headers: authHeaders() });
//       if (!res.ok) throw new Error();
//       setBooks(await res.json());
//     } catch {
//       setError("Could not load books. Is the backend running?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ─── Filtering ──────────────────────────────────────────────────
//   const genres = [...new Set(books.map((b) => b.genre).filter(Boolean))];

//   const displayedBooks = books.filter((b) => {
//     const matchesSearch =
//       !searchTerm ||
//       b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       b.genre?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesGenre = !filterGenre || b.genre === filterGenre;
//     const matchesAvailability =
//       filterAvailability === "all" ||
//       (filterAvailability === "available" && b.availableCopies > 0) ||
//       (filterAvailability === "unavailable" && b.availableCopies === 0);
//     return matchesSearch && matchesGenre && matchesAvailability;
//   });

//   // ─── Modal handlers ─────────────────────────────────────────────
//   const openAddModal = () => {
//     setEditingBook(null);
//     setFormData(emptyForm);
//     setFormError("");
//     setShowModal(true);
//   };

//   const openEditModal = (book) => {
//     setEditingBook(book);
//     setFormData({
//       title: book.title || "", author: book.author || "",
//       isbn: book.isbn || "", genre: book.genre || "",
//       publisher: book.publisher || "", publishedYear: book.publishedYear || "",
//       description: book.description || "",
//       totalCopies: book.totalCopies ?? 1, availableCopies: book.availableCopies ?? 1,
//     });
//     setFormError("");
//     setShowModal(true);
//   };

//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // ─── Submit add/edit ────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!formData.title.trim()) return setFormError("Title is required.");
//     if (!formData.author.trim()) return setFormError("Author is required.");
//     if (formData.totalCopies < 1) return setFormError("Total copies must be at least 1.");

//     setFormError("");
//     setSubmitting(true);
//     try {
//       const payload = {
//         ...formData,
//         publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
//         totalCopies: parseInt(formData.totalCopies),
//         availableCopies: parseInt(formData.availableCopies),
//       };

//       const res = await fetch(
//         editingBook ? `${API_BASE}/books/${editingBook.id}` : `${API_BASE}/books`,
//         {
//           method: editingBook ? "PUT" : "POST",
//           headers: authHeaders(),
//           body: JSON.stringify(payload),
//         }
//       );
//       const data = await res.json();
//       if (!res.ok) return setFormError(data.message || "Something went wrong.");

//       setShowModal(false);
//       setSuccess(editingBook ? "Book updated!" : "Book added!");
//       fetchBooks(searchTerm);
//       setTimeout(() => setSuccess(""), 3000);
//     } catch {
//       setFormError("Network error. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ─── Delete ─────────────────────────────────────────────────────
//   const handleDelete = async (bookId) => {
//     try {
//       const res = await fetch(`${API_BASE}/books/${bookId}`, {
//         method: "DELETE", headers: authHeaders(),
//       });
//       if (!res.ok) throw new Error();
//       setDeleteConfirm(null);
//       setSuccess("Book deleted!");
//       fetchBooks(searchTerm);
//       setTimeout(() => setSuccess(""), 3000);
//     } catch {
//       setError("Failed to delete book.");
//     }
//   };

//   // ─── Render ─────────────────────────────────────────────────────
//   return (
//     <div style={styles.page}>

//       {/* ── Header ─────────────────────────────────────────────── */}
//       <div style={styles.header}>
//         <div>
//           <h2 style={styles.pageTitle}>📚 Book Management</h2>
//           <p style={styles.roleTag}>
//             {userRole === "ADMIN" && " Admin — Full Access"}
//             {userRole === "LIBRARIAN" && "🔖 Librarian — Full Access"}
//             {userRole === "MEMBER" && "👤 Member — View Only"}
//           </p>
//         </div>
//         {canManage && (
//           <button style={styles.addBtn} onClick={openAddModal}>
//             + Add New Book
//           </button>
//         )}
//       </div>

//       {/* ── Banners ─────────────────────────────────────────────── */}
//       {success && <div style={styles.successBanner}>✅ {success}</div>}
//       {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

//       {/* ── Search & Filters ────────────────────────────────────── */}
//       <div style={styles.filterBar}>
//         {/* Search */}
//         <div style={styles.searchWrapper}>
//           <span style={styles.searchIcon}>🔍</span>
//           <input
//             style={styles.searchInput}
//             type="text"
//             placeholder="Search by title, author, genre..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           {searchTerm && (
//             <button style={styles.clearBtn} onClick={() => setSearchTerm("")}>✕</button>
//           )}
//         </div>

//         {/* Genre filter */}
//         <select
//           style={styles.filterSelect}
//           value={filterGenre}
//           onChange={(e) => setFilterGenre(e.target.value)}
//         >
//           <option value="">All Genres</option>
//           {genres.map((g) => <option key={g} value={g}>{g}</option>)}
//         </select>

//         {/* Availability filter */}
//         <select
//           style={styles.filterSelect}
//           value={filterAvailability}
//           onChange={(e) => setFilterAvailability(e.target.value)}
//         >
//           <option value="all">All Books</option>
//           <option value="available">Available Only</option>
//           <option value="unavailable">Unavailable Only</option>
//         </select>
//       </div>

//       {/* ── Stats Bar ───────────────────────────────────────────── */}
//       <div style={styles.statsBar}>
//         <span style={styles.statItem}>📦 Total: <strong>{books.length}</strong></span>
//         <span style={styles.statItem}>
//           ✅ Available: <strong>{books.filter(b => b.availableCopies > 0).length}</strong>
//         </span>
//         <span style={styles.statItem}>
//           ❌ Unavailable: <strong>{books.filter(b => b.availableCopies === 0).length}</strong>
//         </span>
//         <span style={styles.statItem}>
//           🔎 Showing: <strong>{displayedBooks.length}</strong>
//         </span>
//       </div>

//       {/* ── Loading ─────────────────────────────────────────────── */}
//       {loading && (
//         <div style={styles.loadingState}>
//           <div style={styles.loadingSpinner}>⏳</div>
//           <p>Loading books...</p>
//         </div>
//       )}

//       {/* ── Empty State ─────────────────────────────────────────── */}
//       {!loading && displayedBooks.length === 0 && (
//         <div style={styles.emptyState}>
//           <div style={{ fontSize: "64px", marginBottom: "16px" }}>📭</div>
//           <h3>No books found</h3>
//           <p style={{ color: "#94a3b8" }}>
//             {canManage
//               ? "Click '+ Add New Book' to add your first book!"
//               : "No books match your search."}
//           </p>
//         </div>
//       )}

//       {/* ── Book Cards Grid ─────────────────────────────────────── */}
//       {!loading && displayedBooks.length > 0 && (
//         <div style={styles.grid}>
//           {displayedBooks.map((book) => (
//             <BookCard
//               key={book.id}
//               book={book}
//               canManage={canManage}
//               onEdit={openEditModal}
//               onDelete={setDeleteConfirm}
//             />
//           ))}
//         </div>
//       )}

//       {/* ── Add / Edit Modal ─────────────────────────────────────── */}
//       {showModal && (
//         <div style={styles.overlay}>
//           <div style={styles.modal}>
//             <div style={styles.modalHeader}>
//               <h3 style={styles.modalTitle}>
//                 {editingBook ? "✏️ Edit Book" : "➕ Add New Book"}
//               </h3>
//               <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
//             </div>

//             {formError && <div style={styles.formError}>{formError}</div>}

//             <div style={styles.formGrid}>
//               {[
//                 { label: "Title *", name: "title", placeholder: "Book title" },
//                 { label: "Author *", name: "author", placeholder: "Author name" },
//                 { label: "ISBN", name: "isbn", placeholder: "e.g. 978-3-16-148410-0" },
//                 { label: "Genre", name: "genre", placeholder: "e.g. Fiction, Science" },
//                 { label: "Publisher", name: "publisher", placeholder: "Publisher name" },
//                 { label: "Published Year", name: "publishedYear", placeholder: "e.g. 2021", type: "number" },
//                 { label: "Total Copies *", name: "totalCopies", placeholder: "1", type: "number" },
//                 { label: "Available Copies", name: "availableCopies", placeholder: "1", type: "number" },
//               ].map(({ label, name, placeholder, type = "text" }) => (
//                 <div key={name} style={styles.formGroup}>
//                   <label style={styles.formLabel}>{label}</label>
//                   <input
//                     style={styles.formInput}
//                     type={type}
//                     name={name}
//                     placeholder={placeholder}
//                     value={formData[name]}
//                     onChange={handleFormChange}
//                     min={type === "number" ? "0" : undefined}
//                   />
//                 </div>
//               ))}
//             </div>

//             {/* Description full width */}
//             <div style={{ ...styles.formGroup, marginTop: "4px" }}>
//               <label style={styles.formLabel}>Description</label>
//               <textarea
//                 style={{ ...styles.formInput, height: "80px", resize: "vertical" }}
//                 name="description"
//                 placeholder="Short description of the book..."
//                 value={formData.description}
//                 onChange={handleFormChange}
//               />
//             </div>

//             <div style={styles.modalFooter}>
//               <button
//                 style={styles.cancelBtn}
//                 onClick={() => setShowModal(false)}
//                 disabled={submitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 style={{ ...styles.saveBtn, opacity: submitting ? 0.7 : 1 }}
//                 onClick={handleSubmit}
//                 disabled={submitting}
//               >
//                 {submitting ? "Saving..." : editingBook ? "Update Book" : "Add Book"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Delete Confirm Modal ─────────────────────────────────── */}
//       {deleteConfirm && (
//         <div style={styles.overlay}>
//           <div style={{ ...styles.modal, maxWidth: "400px", padding: "32px" }}>
//             <div style={{ fontSize: "48px", textAlign: "center", marginBottom: "16px" }}>🗑️</div>
//             <h3 style={{ textAlign: "center", color: "#1e293b", marginBottom: "8px" }}>
//               Delete Book?
//             </h3>
//             <p style={{ textAlign: "center", color: "#64748b", marginBottom: "24px" }}>
//               Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
//               This cannot be undone.
//             </p>
//             <div style={styles.modalFooter}>
//               <button style={styles.cancelBtn} onClick={() => setDeleteConfirm(null)}>
//                 Cancel
//               </button>
//               <button
//                 style={{ ...styles.saveBtn, background: "#dc2626" }}
//                 onClick={() => handleDelete(deleteConfirm.id)}
//               >
//                 Yes, Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Card Styles ─────────────────────────────────────────────────────────────
// const cardStyles = {
//   wrapper: {
//     borderRadius: "16px",
//     overflow: "hidden",
//     background: "#fff",
//     boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//     transition: "transform 0.2s ease, box-shadow 0.2s ease",
//     cursor: "default",
//   },
//   coverContainer: {
//     position: "relative",
//     width: "100%",
//     height: "240px",
//     overflow: "hidden",
//   },
//   coverImg: {
//     width: "100%",
//     height: "100%",
//     objectFit: "cover",
//     transition: "opacity 0.3s ease, transform 0.3s ease",
//     display: "block",
//   },
//   placeholder: {
//     width: "100%",
//     height: "100%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "absolute",
//     top: 0, left: 0,
//   },
//   placeholderIcon: { fontSize: "56px" },
//   placeholderTitle: {
//     fontSize: "80px",
//     fontWeight: 900,
//     color: "rgba(255,255,255,0.6)",
//     fontFamily: "Georgia, serif",
//   },
//   badge: {
//     position: "absolute",
//     top: "12px", right: "12px",
//     padding: "4px 10px",
//     borderRadius: "20px",
//     fontSize: "11px",
//     fontWeight: 700,
//     color: "#fff",
//     backdropFilter: "blur(4px)",
//     zIndex: 2,
//   },
//   overlay: {
//     position: "absolute",
//     inset: 0,
//     background: "rgba(0,0,0,0.6)",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: "10px",
//     opacity: 0,
//     transition: "opacity 0.2s ease",
//     zIndex: 3,
//     // CSS hover via onMouseEnter/onMouseLeave handled below
//   },
//   overlayEditBtn: {
//     padding: "10px 24px",
//     background: "#2563eb",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "14px",
//     width: "140px",
//   },
//   overlayDeleteBtn: {
//     padding: "10px 24px",
//     background: "#dc2626",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "14px",
//     width: "140px",
//   },
//   info: {
//     padding: "16px",
//   },
//   bookTitle: {
//     fontSize: "15px",
//     fontWeight: 700,
//     color: "#1e293b",
//     margin: "0 0 4px 0",
//     lineHeight: "1.3",
//   },
//   bookAuthor: {
//     fontSize: "13px",
//     color: "#64748b",
//     margin: "0 0 8px 0",
//   },
//   metaRow: {
//     display: "flex",
//     gap: "6px",
//     flexWrap: "wrap",
//     marginBottom: "8px",
//   },
//   genreTag: {
//     background: "#eff6ff",
//     color: "#2563eb",
//     padding: "2px 8px",
//     borderRadius: "12px",
//     fontSize: "11px",
//     fontWeight: 600,
//   },
//   yearTag: {
//     background: "#f1f5f9",
//     color: "#64748b",
//     padding: "2px 8px",
//     borderRadius: "12px",
//     fontSize: "11px",
//   },
//   copies: {
//     fontSize: "12px",
//     color: "#94a3b8",
//     margin: 0,
//   },
// };

// // ─── Page Styles ─────────────────────────────────────────────────────────────
// const styles = {
//   page: {
//     padding: "28px",
//     fontFamily: "'Segoe UI', sans-serif",
//     background: "#f8fafc",
//     minHeight: "100vh",
//   },
//   header: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: "24px",
//   },
//   pageTitle: {
//     fontSize: "28px",
//     fontWeight: 800,
//     color: "#0f172a",
//     margin: "0 0 4px 0",
//   },
//   roleTag: {
//     fontSize: "13px",
//     color: "#64748b",
//     margin: 0,
//   },
//   addBtn: {
//     background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
//     color: "#fff",
//     border: "none",
//     padding: "12px 24px",
//     borderRadius: "10px",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "14px",
//     boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
//   },
//   successBanner: {
//     background: "#dcfce7", color: "#166534",
//     padding: "12px 16px", borderRadius: "10px",
//     marginBottom: "16px", fontWeight: 600,
//   },
//   errorBanner: {
//     background: "#fee2e2", color: "#991b1b",
//     padding: "12px 16px", borderRadius: "10px",
//     marginBottom: "16px", fontWeight: 600,
//   },
//   filterBar: {
//     display: "flex",
//     gap: "12px",
//     marginBottom: "16px",
//     flexWrap: "wrap",
//     alignItems: "center",
//   },
//   searchWrapper: {
//     flex: 1,
//     minWidth: "200px",
//     position: "relative",
//     display: "flex",
//     alignItems: "center",
//   },
//   searchIcon: {
//     position: "absolute",
//     left: "12px",
//     fontSize: "16px",
//   },
//   searchInput: {
//     width: "100%",
//     padding: "10px 12px 10px 36px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "10px",
//     fontSize: "14px",
//     background: "#fff",
//     outline: "none",
//     boxSizing: "border-box",
//   },
//   clearBtn: {
//     position: "absolute",
//     right: "10px",
//     background: "none",
//     border: "none",
//     cursor: "pointer",
//     color: "#94a3b8",
//     fontSize: "14px",
//   },
//   filterSelect: {
//     padding: "10px 14px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "10px",
//     fontSize: "14px",
//     background: "#fff",
//     cursor: "pointer",
//     outline: "none",
//   },
//   statsBar: {
//     display: "flex",
//     gap: "20px",
//     marginBottom: "24px",
//     flexWrap: "wrap",
//     padding: "12px 16px",
//     background: "#fff",
//     borderRadius: "10px",
//     border: "1px solid #e2e8f0",
//   },
//   statItem: {
//     fontSize: "13px",
//     color: "#64748b",
//   },
//   loadingState: {
//     textAlign: "center",
//     padding: "80px 0",
//     color: "#64748b",
//   },
//   loadingSpinner: {
//     fontSize: "48px",
//     animation: "spin 1s linear infinite",
//     marginBottom: "12px",
//   },
//   emptyState: {
//     textAlign: "center",
//     padding: "80px 0",
//     color: "#1e293b",
//   },
//   grid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
//     gap: "24px",
//   },
//   overlay: {
//     position: "fixed",
//     inset: 0,
//     background: "rgba(0,0,0,0.55)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 1000,
//     padding: "20px",
//   },
//   modal: {
//     background: "#fff",
//     borderRadius: "16px",
//     padding: "28px",
//     width: "100%",
//     maxWidth: "700px",
//     maxHeight: "90vh",
//     overflowY: "auto",
//     boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
//   },
//   modalHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: "20px",
//   },
//   modalTitle: {
//     fontSize: "20px",
//     fontWeight: 700,
//     color: "#0f172a",
//     margin: 0,
//   },
//   closeBtn: {
//     background: "#f1f5f9",
//     border: "none",
//     borderRadius: "8px",
//     width: "32px", height: "32px",
//     cursor: "pointer",
//     fontSize: "14px",
//     fontWeight: 700,
//     color: "#64748b",
//   },
//   formGrid: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: "14px",
//     marginBottom: "4px",
//   },
//   formGroup: {
//     display: "flex",
//     flexDirection: "column",
//   },
//   formLabel: {
//     fontSize: "12px",
//     fontWeight: 700,
//     color: "#475569",
//     marginBottom: "5px",
//     textTransform: "uppercase",
//     letterSpacing: "0.5px",
//   },
//   formInput: {
//     padding: "10px 12px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "8px",
//     fontSize: "14px",
//     outline: "none",
//     background: "#f8fafc",
//     fontFamily: "inherit",
//   },
//   formError: {
//     background: "#fee2e2",
//     color: "#dc2626",
//     padding: "10px 14px",
//     borderRadius: "8px",
//     marginBottom: "16px",
//     fontSize: "14px",
//   },
//   modalFooter: {
//     display: "flex",
//     justifyContent: "flex-end",
//     gap: "10px",
//     marginTop: "20px",
//   },
//   cancelBtn: {
//     padding: "10px 22px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "8px",
//     background: "#fff",
//     cursor: "pointer",
//     fontWeight: 600,
//     fontSize: "14px",
//     color: "#64748b",
//   },
//   saveBtn: {
//     padding: "10px 22px",
//     background: "#2563eb",
//     color: "#fff",
//     border: "none",
//     borderRadius: "8px",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: "14px",
//   },
// };