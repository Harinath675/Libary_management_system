package com.Spring.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

// ─────────────────────────────────────────────────────────────────────────────
// Notification.java
//
// PURPOSE: Stores in-app notifications for each user.
//
// TYPES:
//   BORROW_APPROVED   — borrow request was approved
//   BORROW_REJECTED   — borrow request was rejected
//   DUE_REMINDER      — book due in 2 days
//   OVERDUE           — book is overdue, fine applied
//   FINE_CLEARED      — fine paid, account unblocked
//   RENEWAL_CONFIRMED — book renewal confirmed
//   GENERAL           — any other message
//
// READ/UNREAD:
//   isRead = false → shows in unread count badge on bell icon
//   isRead = true  → still visible but not counted
// ─────────────────────────────────────────────────────────────────────────────
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long   userId;       // who receives this notification
    private String type;         // BORROW_APPROVED, OVERDUE, etc.
    private String title;        // short heading e.g. "Borrow Request Approved"
    
    @Column(length = 1000)
    private String message;      // full message body

    private boolean isRead = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Getters & Setters ────────────────────────────────────────────────────
    public Long getId()                          { return id; }
    public Long getUserId()                      { return userId; }
    public void setUserId(Long userId)           { this.userId = userId; }
    public String getType()                      { return type; }
    public void setType(String type)             { this.type = type; }
    public String getTitle()                     { return title; }
    public void setTitle(String title)           { this.title = title; }
    public String getMessage()                   { return message; }
    public void setMessage(String message)       { this.message = message; }
    public boolean isRead()                      { return isRead; }
    public void setRead(boolean read)            { this.isRead = read; }
    public LocalDateTime getCreatedAt()          { return createdAt; }
    public void setCreatedAt(LocalDateTime t)    { this.createdAt = t; }
}
