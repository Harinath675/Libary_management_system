package com.Spring.demo.entity;

import jakarta.persistence.*;

// Book.java v2 — adds: department, coverImageUrl

@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String isbn;
    private String genre;

    // Department: CSE, ECE, EEE, MECHANICAL, CIVIL, MBBS, MBA, HISTORY, etc.
    @Column(name = "department", length = 60)
    private String department;

    // Uploaded cover image path, e.g. "uploads/books/covers/book_1_abc.jpg"
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    private String publisher;

    @Column(name = "published_year")
    private Integer publishedYear;

    @Column(length = 1000)
    private String description;

    @Column(name = "total_copies")
    private Integer totalCopies = 1;

    @Column(name = "available_copies")
    private Integer availableCopies = 1;

    // Online reading fields (Step 3)
    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "reading_content", columnDefinition = "TEXT")
    private String readingContent;

    @Column(name = "external_link", length = 500)
    private String externalLink;

    @Column(name = "has_online_reading")
    private Boolean hasOnlineReading = false;

    @PrePersist
    @PreUpdate
    private void computeHasOnlineReading() {
        this.hasOnlineReading =
            (pdfUrl != null && !pdfUrl.isBlank()) ||
            (readingContent != null && !readingContent.isBlank()) ||
            (externalLink != null && !externalLink.isBlank());
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String t) { this.title = t; }
    public String getAuthor() { return author; }
    public void setAuthor(String a) { this.author = a; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String i) { this.isbn = i; }
    public String getGenre() { return genre; }
    public void setGenre(String g) { this.genre = g; }
    public String getDepartment() { return department; }
    public void setDepartment(String d) { this.department = d; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String u) { this.coverImageUrl = u; }
    public String getPublisher() { return publisher; }
    public void setPublisher(String p) { this.publisher = p; }
    public Integer getPublishedYear() { return publishedYear; }
    public void setPublishedYear(Integer y) { this.publishedYear = y; }
    public String getDescription() { return description; }
    public void setDescription(String d) { this.description = d; }
    public Integer getTotalCopies() { return totalCopies; }
    public void setTotalCopies(Integer t) { this.totalCopies = t; }
    public Integer getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(Integer a) { this.availableCopies = a; }
    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String u) { this.pdfUrl = u; }
    public String getReadingContent() { return readingContent; }
    public void setReadingContent(String c) { this.readingContent = c; }
    public String getExternalLink() { return externalLink; }
    public void setExternalLink(String l) { this.externalLink = l; }
    public Boolean getHasOnlineReading() { return hasOnlineReading; }
    public void setHasOnlineReading(Boolean h) { this.hasOnlineReading = h; }
}
