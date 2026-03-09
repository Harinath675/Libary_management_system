package com.Spring.demo.controller;

import com.Spring.demo.entity.Book;
import com.Spring.demo.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// BookController v2
// NEW endpoints:
//   GET  /api/books?search=&department=  — filter by dept + search
//   GET  /api/books/departments           — list all distinct departments
//   POST /api/books/{id}/upload-cover     — upload cover image

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    // From application.properties: app.upload.dir=uploads/books
    @Value("${app.upload.dir:uploads/books}")
    private String uploadDir;

    // ── GET all books (optional search + department filter) ───────────────────
    @GetMapping
    public List<Book> getBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department) {

        if (search != null && !search.isBlank() && department != null && !department.isBlank()) {
            return bookRepository.searchByDepartment(department, search);
        }
        if (search != null && !search.isBlank()) {
            return bookRepository.searchBooks(search);
        }
        if (department != null && !department.isBlank()) {
            return bookRepository.findByDepartmentIgnoreCase(department);
        }
        return bookRepository.findAll();
    }

    // ── GET distinct departments ──────────────────────────────────────────────
    @GetMapping("/departments")
    public List<String> getDepartments() {
        return bookRepository.findAllDepartments();
    }

    // ── GET single book ───────────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return bookRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── POST create book ──────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        return ResponseEntity.ok(bookRepository.save(book));
    }

    // ── PUT update book ───────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book updated) {
        return bookRepository.findById(id).map(book -> {
            book.setTitle(updated.getTitle());
            book.setAuthor(updated.getAuthor());
            book.setIsbn(updated.getIsbn());
            book.setGenre(updated.getGenre());
            book.setDepartment(updated.getDepartment());   // ← NEW
            book.setPublisher(updated.getPublisher());
            book.setPublishedYear(updated.getPublishedYear());
            book.setDescription(updated.getDescription());
            book.setTotalCopies(updated.getTotalCopies());
            book.setAvailableCopies(updated.getAvailableCopies());
            // Only update cover URL if explicitly provided (don't wipe existing)
            if (updated.getCoverImageUrl() != null && !updated.getCoverImageUrl().isBlank()) {
                book.setCoverImageUrl(updated.getCoverImageUrl());
            }
            return ResponseEntity.ok(bookRepository.save(book));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── DELETE book ───────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBook(@PathVariable Long id) {
        if (!bookRepository.existsById(id)) return ResponseEntity.notFound().build();
        bookRepository.deleteById(id);
        return ResponseEntity.ok("Book deleted successfully");
    }

    // ── POST upload cover image ───────────────────────────────────────────────
    // Endpoint : POST /api/books/{id}/upload-cover
    // Form key : "file"  (multipart image)
    // Returns  : { "coverImageUrl": "uploads/books/covers/book_1_abc123.jpg" }
    // Frontend uses: http://localhost:8080/uploads/books/covers/book_1_abc123.jpg
    @PostMapping("/{id}/upload-cover")
    public ResponseEntity<?> uploadCover(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        return bookRepository.findById(id).map(book -> {
            try {
                // Create directory: uploads/books/covers/
                Path dir = Paths.get(uploadDir, "covers");
                Files.createDirectories(dir);

                // Unique filename: book_1_a3f7b2c1.jpg
                String ext = getExt(file.getOriginalFilename());
                String name = "book_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
                Path dest = dir.resolve(name);

                Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

                // Save relative path in DB — frontend prepends server URL
                String relativePath = "uploads/books/covers/" + name;
                book.setCoverImageUrl(relativePath);
                bookRepository.save(book);

                return ResponseEntity.ok(Map.of("coverImageUrl", relativePath));
            } catch (IOException e) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "Upload failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    private String getExt(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
