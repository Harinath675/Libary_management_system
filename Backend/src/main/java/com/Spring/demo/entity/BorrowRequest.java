package com.Spring.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "borrow_requests")
public class BorrowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId;
    private String memberName;
    private String memberEmail;

    // Comma-separated book IDs e.g. "1,2,3"
    @Column(length = 500)
    private String bookIds;

    // Comma-separated book titles for display
    @Column(length = 1000)
    private String bookTitles;

    private int bookCount;

    // PENDING, APPROVED, REJECTED
    private String status = "PENDING";

    private LocalDateTime requestedAt = LocalDateTime.now();
    private LocalDateTime approvedAt;
    private LocalDateTime dueDate;

    private String approvedBy; // librarian/admin name

    // Getters and Setters
    public Long getId() { return id; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getMemberEmail() { return memberEmail; }
    public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }
    public String getBookIds() { return bookIds; }
    public void setBookIds(String bookIds) { this.bookIds = bookIds; }
    public String getBookTitles() { return bookTitles; }
    public void setBookTitles(String bookTitles) { this.bookTitles = bookTitles; }
    public int getBookCount() { return bookCount; }
    public void setBookCount(int bookCount) { this.bookCount = bookCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
}
