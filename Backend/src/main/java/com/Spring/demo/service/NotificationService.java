package com.Spring.demo.service;

import com.Spring.demo.entity.Notification;
import com.Spring.demo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

// ─────────────────────────────────────────────────────────────────────────────
// NotificationService.java
//
// PURPOSE: Creates and manages in-app notifications.
//
// USED BY:
//   - BorrowRequestController (approve, reject, renew, pay-fine)
//   - SchedulerService (overdue, due reminder)
//   - UserService (welcome)
//
// USAGE:
//   notificationService.create(userId, "BORROW_APPROVED",
//       "Borrow Request Approved",
//       "Your request for Clean Code has been approved. Due: 15 Apr 2026");
// ─────────────────────────────────────────────────────────────────────────────
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepo;

    // ── Create a new notification ─────────────────────────────────────────────
    public Notification create(Long userId, String type, String title, String message) {
        Notification n = new Notification();
        n.setUserId(userId);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        return notificationRepo.save(n);
    }

    // ── Convenience methods for each notification type ─────────────────────────

    public void notifyBorrowApproved(Long userId, String bookTitles, String dueDate) {
        create(userId, "BORROW_APPROVED",
            "✅ Borrow Request Approved",
            "Your request for \"" + bookTitles + "\" has been approved. Due date: " + dueDate);
    }

    public void notifyBorrowRejected(Long userId, String bookTitles) {
        create(userId, "BORROW_REJECTED",
            "❌ Borrow Request Rejected",
            "Your request for \"" + bookTitles + "\" has been rejected. Visit the library for more info.");
    }

    public void notifyDueReminder(Long userId, String bookTitle, String dueDate) {
        create(userId, "DUE_REMINDER",
            "⏰ Book Due in 2 Days",
            "\"" + bookTitle + "\" is due on " + dueDate + ". Please return it on time to avoid fines.");
    }

    public void notifyOverdue(Long userId, String bookTitle, long daysOverdue, double fine) {
        create(userId, "OVERDUE",
            "🚨 Book Overdue — Fine Applied",
            "\"" + bookTitle + "\" is " + daysOverdue + " day(s) overdue. Fine: ₹" + String.format("%.0f", fine) + ". Please return immediately.");
    }

    public void notifyFineCleared(Long userId, double amount) {
        create(userId, "FINE_CLEARED",
            "✅ Fine Cleared — Account Unblocked",
            "Your outstanding fine of ₹" + String.format("%.0f", amount) + " has been cleared. Your account is now active.");
    }

    public void notifyRenewal(Long userId, String bookTitle, String newDueDate) {
        create(userId, "RENEWAL_CONFIRMED",
            "🔄 Book Renewed Successfully",
            "\"" + bookTitle + "\" has been renewed. New due date: " + newDueDate + ". Note: renewals are allowed only once.");
    }

    public void notifyWelcome(Long userId, String name) {
        create(userId, "GENERAL",
            "👋 Welcome to LibraryMS!",
            "Hello " + name + "! Your account is ready. Browse books, subscribe to a plan, and start borrowing!");
    }
}
