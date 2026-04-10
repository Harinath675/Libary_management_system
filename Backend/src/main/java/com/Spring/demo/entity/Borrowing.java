// package com.Spring.demo.entity;

// import jakarta.persistence.*;
// import java.time.LocalDateTime;

// @Entity
// @Table(name = "borrowings")
// public class Borrowing {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     private Long memberId;
//     private String memberName;
//     private String memberEmail;

//     private Long bookId;
//     private String bookTitle;
//     private String bookAuthor;

//     private Long borrowRequestId;

//     private LocalDateTime borrowedAt = LocalDateTime.now();
//     private LocalDateTime dueDate;
//     private LocalDateTime returnedAt;

//     // BORROWED, RETURNED, OVERDUE
//     private String status = "BORROWED";

//     private double fineAmount = 0.0;
//     private boolean finePaid = false;

//     // Getters and Setters
//     public Long getId() { return id; }
//     public Long getMemberId() { return memberId; }
//     public void setMemberId(Long memberId) { this.memberId = memberId; }
//     public String getMemberName() { return memberName; }
//     public void setMemberName(String memberName) { this.memberName = memberName; }
//     public String getMemberEmail() { return memberEmail; }
//     public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }
//     public Long getBookId() { return bookId; }
//     public void setBookId(Long bookId) { this.bookId = bookId; }
//     public String getBookTitle() { return bookTitle; }
//     public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
//     public String getBookAuthor() { return bookAuthor; }
//     public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }
//     public Long getBorrowRequestId() { return borrowRequestId; }
//     public void setBorrowRequestId(Long borrowRequestId) { this.borrowRequestId = borrowRequestId; }
//     public LocalDateTime getBorrowedAt() { return borrowedAt; }
//     public void setBorrowedAt(LocalDateTime borrowedAt) { this.borrowedAt = borrowedAt; }
//     public LocalDateTime getDueDate() { return dueDate; }
//     public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
//     public LocalDateTime getReturnedAt() { return returnedAt; }
//     public void setReturnedAt(LocalDateTime returnedAt) { this.returnedAt = returnedAt; }
//     public String getStatus() { return status; }
//     public void setStatus(String status) { this.status = status; }
//     public double getFineAmount() { return fineAmount; }
//     public void setFineAmount(double fineAmount) { this.fineAmount = fineAmount; }
//     public boolean isFinePaid() { return finePaid; }
//     public void setFinePaid(boolean finePaid) { this.finePaid = finePaid; }
// }
package com.Spring.demo.entity;
 
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
 
@Entity
@Table(name = "borrowings")
public class Borrowing {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private Long memberId;
    private String memberName;
    private String memberEmail;
 
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
 
    private Long borrowRequestId;
 
    private LocalDateTime borrowedAt = LocalDateTime.now();
    private LocalDateTime dueDate;
    private LocalDateTime returnedAt;
 
    // BORROWED, RETURNED, OVERDUE
    private String status = "BORROWED";
 
    private double fineAmount = 0.0;
    private boolean finePaid  = false;
    private boolean renewed   = false;  // true after member renews once — cannot renew again

    @Column(nullable = false)
private boolean damaged = false;

@Column
private Double damageFine = 0.0;

@Column
private String damageReason;
    // Getters and Setters
    public Long getId() { return id; }
    public Long getMemberId() { return memberId; }
    public void setMemberId(Long memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getMemberEmail() { return memberEmail; }
    public void setMemberEmail(String memberEmail) { this.memberEmail = memberEmail; }
    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }
    public String getBookAuthor() { return bookAuthor; }
    public void setBookAuthor(String bookAuthor) { this.bookAuthor = bookAuthor; }
    public Long getBorrowRequestId() { return borrowRequestId; }
    public void setBorrowRequestId(Long borrowRequestId) { this.borrowRequestId = borrowRequestId; }
    public LocalDateTime getBorrowedAt() { return borrowedAt; }
    public void setBorrowedAt(LocalDateTime borrowedAt) { this.borrowedAt = borrowedAt; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getReturnedAt() { return returnedAt; }
    public void setReturnedAt(LocalDateTime returnedAt) { this.returnedAt = returnedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getFineAmount() { return fineAmount; }
    public void setFineAmount(double fineAmount) { this.fineAmount = fineAmount; }
    public boolean isFinePaid() { return finePaid; }
    public void setFinePaid(boolean finePaid) { this.finePaid = finePaid; }
    public boolean isRenewed() { return renewed; }
    public void setRenewed(boolean renewed) { this.renewed = renewed; }
    public boolean isDamaged() { return damaged; }
public void setDamaged(boolean damaged) { this.damaged = damaged; }

public Double getDamageFine() { return damageFine; }
public void setDamageFine(Double damageFine) { this.damageFine = damageFine; }

public String getDamageReason() { return damageReason; }
public void setDamageReason(String damageReason) { this.damageReason = damageReason; }

}