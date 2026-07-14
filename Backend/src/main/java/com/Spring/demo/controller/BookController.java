package com.Spring.demo.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Spring.demo.entity.Book;
import com.Spring.demo.repository.BookRepository;

@RestController
@RequestMapping("https://libary-management-system-5.onrender.com/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    // This reads from application.properties: app.upload.dir=uploads/books
    @Value("${app.upload.dir:uploads/books}")
    private String uploadDir;

    // ── GET all books ─────────────────────────────────────────────────────────
    @GetMapping
    public List<Book> getBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department) {
        if (search != null && !search.isBlank() && department != null && !department.isBlank())
            return bookRepository.searchByDepartment(department, search);
        if (search != null && !search.isBlank())
            return bookRepository.searchBooks(search);
        if (department != null && !department.isBlank())
            return bookRepository.findByDepartmentIgnoreCase(department);
        return bookRepository.findAll();
    }

    // ── GET departments ───────────────────────────────────────────────────────
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
            book.setDepartment(updated.getDepartment());
            book.setPublisher(updated.getPublisher());
            book.setPublishedYear(updated.getPublishedYear());
            book.setDescription(updated.getDescription());
            book.setTotalCopies(updated.getTotalCopies());
            book.setAvailableCopies(updated.getAvailableCopies());
            if (updated.getCoverImageUrl() != null && !updated.getCoverImageUrl().isBlank())
                book.setCoverImageUrl(updated.getCoverImageUrl());
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

    // ── POST upload cover ─────────────────────────────────────────────────────
    // Saves file to: uploads/books/covers/book_{id}_{uuid}.jpg
    // Stores in DB:  book_{id}_{uuid}.jpg  (just the filename)
    @PostMapping("/{id}/upload-cover")
    public ResponseEntity<?> uploadCover(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        return bookRepository.findById(id).map(book -> {
            try {
                // Use absolute path so Windows path issues don't matter
                Path dir = Paths.get(uploadDir, "covers").toAbsolutePath().normalize();
                Files.createDirectories(dir);

                String ext  = getExt(file.getOriginalFilename());
                String name = "book_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;
                Path dest   = dir.resolve(name);
                Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

                // Store ONLY the filename in DB — e.g. "book_56_abc123.jpg"
                book.setCoverImageUrl(name);
                bookRepository.save(book);

                System.out.println("✅ Cover saved to: " + dest);
                System.out.println("✅ Stored in DB:   " + name);
                System.out.println("✅ Access via:     /api/books/cover-image/" + name);

                return ResponseEntity.ok(Map.of("coverImageUrl", name));
            } catch (IOException e) {
                System.out.println("❌ Upload error: " + e.getMessage());
                return ResponseEntity.internalServerError()
                        .body(Map.of("error", "Upload failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── GET serve cover image ─────────────────────────────────────────────────
    // URL:  GET /api/books/cover-image/{filename}
    // e.g.  GET /api/books/cover-image/book_56_abc123.jpg
    @GetMapping("/cover-image/{filename:.+}")
    public ResponseEntity<Resource> serveCover(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, "covers", filename)
                                 .toAbsolutePath()
                                 .normalize();

            System.out.println("📂 Looking for cover: " + filePath);
            System.out.println("📂 File exists: " + Files.exists(filePath));

            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                System.out.println("❌ File not found or not readable: " + filePath);
                return ResponseEntity.notFound().build();
            }

            String contentType = "image/jpeg";
            if (filename.toLowerCase().endsWith(".png"))  contentType = "image/png";
            if (filename.toLowerCase().endsWith(".webp")) contentType = "image/webp";
            if (filename.toLowerCase().endsWith(".gif"))  contentType = "image/gif";

            System.out.println("✅ Serving: " + filePath);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String getExt(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
