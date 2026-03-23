package com.Spring.demo.service;

import com.Spring.demo.entity.Borrowing;
import com.Spring.demo.entity.MemberSubscription;
import com.Spring.demo.entity.User;
import com.Spring.demo.repository.BorrowingRepository;
import com.Spring.demo.repository.MemberSubscriptionRepository;
import com.Spring.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

// ─────────────────────────────────────────────────────────────────────────────
// SchedulerService.java
//
// PURPOSE: Runs background jobs automatically every day at midnight.
//          No API call needed — Spring Boot triggers these automatically.
//
// JOBS:
//   1. markOverdueBooks()       — runs daily at midnight
//      - Finds all BORROWED books whose due date has passed
//      - Marks them OVERDUE
//      - Calculates fine (₹10 per day overdue)
//      - If total unpaid fines ≥ ₹500, blocks the member account
//      - Sends overdue email to member
//
//   2. expireSubscriptions()    — runs daily at midnight
//      - Finds all ACTIVE subscriptions whose expiry date has passed
//      - Marks them EXPIRED
//
// CRON EXPRESSION: "0 0 0 * * *"
//   0 0 0  = at 00:00:00 (midnight)
//   * * *  = every day, every month, every day-of-week
// ─────────────────────────────────────────────────────────────────────────────
@Service
public class SchedulerService {

    @Autowired BorrowingRepository          borrowingRepo;
    @Autowired MemberSubscriptionRepository subscriptionRepo;
    @Autowired UserRepository               userRepo;
    @Autowired EmailService                 emailService;

    private static final double FINE_PER_DAY   = 10.0;   // ₹10 per overdue day
    private static final double FINE_BLOCK_LIMIT = 500.0; // block account at ₹500

    // ─────────────────────────────────────────────────────────────────────────
    // JOB 1: Mark overdue books + calculate fines
    // Runs every day at midnight: "0 0 0 * * *"
    //
    // For testing, you can temporarily change to run every minute:
    //   "0 * * * * *"
    // ─────────────────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 0 * * *")
    public void markOverdueBooks() {
        System.out.println("⏰ [SCHEDULER] Running markOverdueBooks job at " + LocalDateTime.now());

        // Find all books currently BORROWED (not yet returned)
        List<Borrowing> activeBorrowings = borrowingRepo.findByStatus("BORROWED");

        int markedOverdue = 0;
        int alreadyOverdue = 0;

        for (Borrowing b : activeBorrowings) {
            if (b.getDueDate() == null) continue;

            LocalDateTime now     = LocalDateTime.now();
            LocalDateTime dueDate = b.getDueDate();

            if (now.isAfter(dueDate)) {
                // Calculate how many days overdue
                long daysOverdue = ChronoUnit.DAYS.between(dueDate, now);
                if (daysOverdue < 1) daysOverdue = 1; // minimum 1 day fine

                double fine = daysOverdue * FINE_PER_DAY;

                // Update borrowing record
                b.setStatus("OVERDUE");
                b.setFineAmount(fine);
                borrowingRepo.save(b);
                markedOverdue++;

                // Check if member should be blocked (total unpaid fines ≥ ₹500)
                checkAndBlockMember(b.getMemberId());

                // Send overdue email
                try {
                    User member = userRepo.findById(b.getMemberId()).orElse(null);
                    if (member != null) {
                        emailService.sendOverdueNotice(
                            member.getEmail(),
                            member.getName(),
                            b.getBookTitle(),
                            dueDate,
                            daysOverdue,
                            fine
                        );
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Failed to send overdue email: " + e.getMessage());
                }
            }
        }

        // Also update fines for already-OVERDUE books (fine grows daily)
        List<Borrowing> overdueBorrowings = borrowingRepo.findByStatus("OVERDUE");
        for (Borrowing b : overdueBorrowings) {
            if (b.getDueDate() == null) continue;
            long daysOverdue = ChronoUnit.DAYS.between(b.getDueDate(), LocalDateTime.now());
            if (daysOverdue < 1) daysOverdue = 1;
            double fine = daysOverdue * FINE_PER_DAY;
            b.setFineAmount(fine);
            borrowingRepo.save(b);
            checkAndBlockMember(b.getMemberId());
            alreadyOverdue++;
        }

        System.out.println("✅ [SCHEDULER] markOverdueBooks done — " +
            markedOverdue + " newly overdue, " + alreadyOverdue + " fine amounts updated");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // JOB 2: Expire subscriptions
    // Runs every day at midnight
    // ─────────────────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 0 * * *")
    public void expireSubscriptions() {
        System.out.println("⏰ [SCHEDULER] Running expireSubscriptions job at " + LocalDateTime.now());

        List<MemberSubscription> active = subscriptionRepo.findByStatus("ACTIVE");
        int expired = 0;

        for (MemberSubscription sub : active) {
            if (sub.getExpiresAt() == null) continue;
            if (LocalDateTime.now().isAfter(sub.getExpiresAt())) {
                sub.setStatus("EXPIRED");
                subscriptionRepo.save(sub);
                expired++;
                System.out.println("📅 Expired subscription for member ID: " + sub.getMemberId());
            }
        }

        System.out.println("✅ [SCHEDULER] expireSubscriptions done — " + expired + " subscriptions expired");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // JOB 3: Send due-date reminders (2 days before due)
    // Runs every day at 9 AM
    // ─────────────────────────────────────────────────────────────────────────
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDueDateReminders() {
        System.out.println("⏰ [SCHEDULER] Running sendDueDateReminders job at " + LocalDateTime.now());

        List<Borrowing> activeBorrowings = borrowingRepo.findByStatus("BORROWED");
        int remindersSent = 0;

        for (Borrowing b : activeBorrowings) {
            if (b.getDueDate() == null) continue;

            long daysUntilDue = ChronoUnit.DAYS.between(LocalDateTime.now(), b.getDueDate());

            // Send reminder exactly 2 days before due date
            if (daysUntilDue == 2) {
                try {
                    User member = userRepo.findById(b.getMemberId()).orElse(null);
                    if (member != null) {
                        emailService.sendDueDateReminder(
                            member.getEmail(),
                            member.getName(),
                            b.getBookTitle(),
                            b.getDueDate()
                        );
                        remindersSent++;
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Failed to send reminder email: " + e.getMessage());
                }
            }
        }

        System.out.println("✅ [SCHEDULER] sendDueDateReminders done — " + remindersSent + " reminders sent");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPER: Check if member's total unpaid fines ≥ ₹500 → block account
    // ─────────────────────────────────────────────────────────────────────────
    private void checkAndBlockMember(Long memberId) {
        try {
            List<Borrowing> memberBorrowings = borrowingRepo.findByMemberId(memberId);
            double totalUnpaidFine = memberBorrowings.stream()
                .filter(b -> !b.isFinePaid() && b.getFineAmount() > 0)
                .mapToDouble(Borrowing::getFineAmount)
                .sum();

            User member = userRepo.findById(memberId).orElse(null);
            if (member == null) return;

            if (totalUnpaidFine >= FINE_BLOCK_LIMIT && member.isApproved()) {
                member.setApproved(false);
                userRepo.save(member);
                System.out.println("🚫 Blocked member " + member.getEmail() +
                    " — total fine ₹" + totalUnpaidFine);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Error checking member block status: " + e.getMessage());
        }
    }
}
