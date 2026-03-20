package com.Spring.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// ─────────────────────────────────────────────────────────────────────────────
// Reservation.java
// PURPOSE: A member's waitlist request for a book with 0 available copies.
//
// STATUS FLOW:  PENDING → APPROVED  (librarian/admin approves)
//               PENDING → REJECTED  (librarian/admin rejects)
// ─────────────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Member who made the request
    private Long   memberId;
    private String memberName;
    private String memberEmail;

    // Book being reserved
    private Long   bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookDepartment;

    // PENDING, APPROVED, REJECTED
    private String status = "PENDING";

    private LocalDateTime requestedAt = LocalDateTime.now();

    // ── Getters & Setters ────────────────────────────────────────────────────
    public Long getId()                              { return id; }
    public Long getMemberId()                        { return memberId; }
    public void setMemberId(Long memberId)           { this.memberId = memberId; }
    public String getMemberName()                    { return memberName; }
    public void setMemberName(String memberName)     { this.memberName = memberName; }
    public String getMemberEmail()                   { return memberEmail; }
    public void setMemberEmail(String memberEmail)   { this.memberEmail = memberEmail; }
    public Long getBookId()                          { return bookId; }
    public void setBookId(Long bookId)               { this.bookId = bookId; }
    public String getBookTitle()                     { return bookTitle; }
    public void setBookTitle(String bookTitle)       { this.bookTitle = bookTitle; }
    public String getBookAuthor()                    { return bookAuthor; }
    public void setBookAuthor(String bookAuthor)     { this.bookAuthor = bookAuthor; }
    public String getBookDepartment()                { return bookDepartment; }
    public void setBookDepartment(String dept)       { this.bookDepartment = dept; }
    public String getStatus()                        { return status; }
    public void setStatus(String status)             { this.status = status; }
    public LocalDateTime getRequestedAt()            { return requestedAt; }
    public void setRequestedAt(LocalDateTime t)      { this.requestedAt = t; }
}
