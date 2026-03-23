package com.Spring.demo.service;
 
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
 
import jakarta.mail.internet.MimeMessage;
 
// ─────────────────────────────────────────────────────────────────────────────
// EmailService.java
//
// PURPOSE: Sends all transactional emails from the library system.
//
// EMAILS SENT:
//   1. sendOtp()                — OTP for registration / password reset
//   2. sendBorrowApproved()     — borrow request approved, includes due date
//   3. sendBorrowRejected()     — borrow request rejected
//   4. sendDueDateReminder()    — reminder 2 days before due date
//   5. sendOverdueNotice()      — book is overdue, includes fine amount
//   6. sendFineCleared()        — fine paid + account unblocked
//   7. sendWelcome()            — welcome email after registration
//
// HOW IT WORKS:
//   - Uses Spring's JavaMailSender (configured in application.properties)
//   - Sends HTML emails with inline styles for maximum email client compatibility
//   - All methods are try/catch safe — a failed email never crashes the app
// ─────────────────────────────────────────────────────────────────────────────
@Service
public class EmailService {
 
    @Autowired
    private JavaMailSender mailSender;
 
    private static final String FROM    = "projectlibrery@gmail.com";
    private static final String BRAND   = "LibraryMS";
    private static final DateTimeFormatter DATE_FMT =
        DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
 
    // ── Shared HTML wrapper ───────────────────────────────────────────────────
    private String wrap(String title, String body) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f0f2f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:40px 20px;">
                  <table width="580" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:16px;overflow:hidden;
                           box-shadow:0 4px 24px rgba(0,0,0,0.10);">
 
                    <!-- Header -->
                    <tr><td style="background:linear-gradient(135deg,#1a1f36,#0d1117);
                                   padding:32px 40px;text-align:center;">
                      <div style="font-size:28px;margin-bottom:8px;">📚</div>
                      <div style="font-family:Georgia,serif;font-size:22px;
                                  font-weight:700;color:#E8A020;letter-spacing:1px;">
                        %s
                      </div>
                      <div style="font-size:12px;color:rgba(255,255,255,0.45);
                                  margin-top:4px;text-transform:uppercase;letter-spacing:1px;">
                        Library Management System
                      </div>
                    </td></tr>
 
                    <!-- Title bar -->
                    <tr><td style="background:linear-gradient(135deg,#E8A020,#14B8A6);
                                   padding:12px 40px;">
                      <div style="font-size:15px;font-weight:700;color:#0d1117;">
                        %s
                      </div>
                    </td></tr>
 
                    <!-- Body -->
                    <tr><td style="padding:32px 40px;color:#1a1f36;line-height:1.7;">
                      %s
                    </td></tr>
 
                    <!-- Footer -->
                    <tr><td style="padding:20px 40px 32px;border-top:1px solid #f0f2f8;
                                   text-align:center;font-size:11px;color:#94a3b8;">
                      This is an automated message from %s. Please do not reply to this email.
                    </td></tr>
 
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(BRAND, title, body, BRAND);
    }
 
    // ── Send helper ───────────────────────────────────────────────────────────
    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(FROM);
            h.setTo(to);
            h.setSubject("[" + BRAND + "] " + subject);
            h.setText(html, true);
            mailSender.send(msg);
            System.out.println("✅ Email sent to " + to + " — " + subject);
        } catch (Exception e) {
            System.out.println("❌ Email failed to " + to + ": " + e.getMessage());
        }
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 1. OTP Email (registration + password reset)
    // ─────────────────────────────────────────────────────────────────────────
    public void sendOtp(String to, String name, String otp) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>Your verification code is:</p>
            <div style="text-align:center;margin:28px 0;">
              <span style="font-size:42px;font-weight:800;letter-spacing:12px;
                           color:#E8A020;font-family:monospace;">%s</span>
            </div>
            <p style="color:#64748b;font-size:13px;">
              This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
            </p>
            """.formatted(name, otp);
        send(to, "Your Verification Code", wrap("Verification Code", body));
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 2. Borrow Request APPROVED
    // ─────────────────────────────────────────────────────────────────────────
    public void sendBorrowApproved(String to, String name, String bookTitles,
                                    LocalDateTime dueDate) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>Great news! Your borrow request has been <strong style="color:#14B8A6;">approved</strong>.</p>
 
            <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;
                        padding:20px;margin:20px 0;">
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">Books</div>
              <div style="font-weight:700;font-size:15px;color:#1a1f36;">%s</div>
            </div>
 
            <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;
                        padding:20px;margin:20px 0;">
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">Return By</div>
              <div style="font-weight:700;font-size:18px;color:#E8A020;">%s</div>
            </div>
 
            <p style="color:#64748b;font-size:13px;">
              ⚠️ Late returns incur a fine of <strong>₹10 per day</strong>.
              Please return the book before the due date.
            </p>
            """.formatted(name, bookTitles, dueDate != null ? dueDate.format(DATE_FMT) : "—");
        send(to, "Borrow Request Approved ✅", wrap("Borrow Request Approved", body));
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 3. Borrow Request REJECTED
    // ─────────────────────────────────────────────────────────────────────────
    public void sendBorrowRejected(String to, String name, String bookTitles) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>Unfortunately, your borrow request has been <strong style="color:#F87171;">rejected</strong>.</p>
 
            <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;
                        padding:20px;margin:20px 0;">
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">Requested Books</div>
              <div style="font-weight:700;font-size:15px;color:#1a1f36;">%s</div>
            </div>
 
            <p style="color:#64748b;font-size:13px;">
              You can visit the library or contact a librarian for more information.
              You may also browse other available books and submit a new request.
            </p>
            """.formatted(name, bookTitles);
        send(to, "Borrow Request Rejected", wrap("Borrow Request Rejected", body));
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 4. Due Date Reminder (sent 2 days before due)
    // ─────────────────────────────────────────────────────────────────────────
    public void sendDueDateReminder(String to, String name,
                                     String bookTitle, LocalDateTime dueDate) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>This is a friendly reminder that a book is due for return in <strong>2 days</strong>.</p>
 
            <div style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;
                        padding:20px;margin:20px 0;">
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">📖 Book</div>
              <div style="font-weight:700;font-size:15px;color:#1a1f36;margin-bottom:12px;">%s</div>
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">⏰ Due Date</div>
              <div style="font-weight:700;font-size:18px;color:#E8A020;">%s</div>
            </div>
 
            <p style="color:#64748b;font-size:13px;">
              Please return the book on time to avoid a fine of <strong>₹10 per day</strong>.
            </p>
            """.formatted(name, bookTitle, dueDate != null ? dueDate.format(DATE_FMT) : "—");
        send(to, "Book Due in 2 Days ⏰", wrap("Return Reminder", body));
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 5. Overdue Notice
    // ─────────────────────────────────────────────────────────────────────────
    public void sendOverdueNotice(String to, String name, String bookTitle,
                                   LocalDateTime dueDate, long daysOverdue, double fine) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>The following book is <strong style="color:#F87171;">overdue</strong>
               and a fine has been applied to your account.</p>
 
            <div style="background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;
                        padding:20px;margin:20px 0;">
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">📖 Book</div>
              <div style="font-weight:700;font-size:15px;color:#1a1f36;margin-bottom:14px;">%s</div>
 
              <div style="display:flex;gap:20px;flex-wrap:wrap;">
                <div>
                  <div style="font-size:11px;color:#64748b;text-transform:uppercase;
                              letter-spacing:1px;">Was Due</div>
                  <div style="font-weight:700;color:#F87171;">%s</div>
                </div>
                <div>
                  <div style="font-size:11px;color:#64748b;text-transform:uppercase;
                              letter-spacing:1px;">Days Overdue</div>
                  <div style="font-weight:700;color:#F87171;">%d days</div>
                </div>
                <div>
                  <div style="font-size:11px;color:#64748b;text-transform:uppercase;
                              letter-spacing:1px;">Fine</div>
                  <div style="font-weight:800;font-size:20px;color:#E8A020;">₹%.0f</div>
                </div>
              </div>
            </div>
 
            <p style="color:#64748b;font-size:13px;">
              ⚠️ If total unpaid fines reach <strong>₹500</strong>, your account will be blocked.
              Please return the book and pay the fine at the library counter immediately.
            </p>
            """.formatted(name, bookTitle,
                dueDate != null ? dueDate.format(DATE_FMT) : "—",
                daysOverdue, fine);
        send(to, "Overdue Book — Fine Applied 🚨", wrap("Book Overdue", body));
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 6. Fine Cleared + Account Unblocked
    // ─────────────────────────────────────────────────────────────────────────
    public void sendFineCleared(String to, String name, double amountPaid) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>Your library fine has been <strong style="color:#14B8A6;">cleared</strong>
               and your account is now active again.</p>
 
            <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;
                        padding:20px;margin:20px 0;text-align:center;">
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">Amount Cleared</div>
              <div style="font-weight:800;font-size:32px;color:#14B8A6;">₹%.0f</div>
              <div style="margin-top:12px;font-size:22px;">✅</div>
              <div style="font-weight:700;color:#14B8A6;">Account Unblocked</div>
            </div>
 
            <p style="color:#64748b;font-size:13px;">
              You can now borrow books again. Thank you for your prompt payment.
            </p>
            """.formatted(name, amountPaid);
        send(to, "Fine Cleared — Account Unblocked ✅", wrap("Account Unblocked", body));
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 7. Welcome Email
    // ─────────────────────────────────────────────────────────────────────────
    public void sendWelcome(String to, String name) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>Welcome to <strong>LibraryMS</strong>! Your account has been created successfully.</p>
 
            <div style="background:linear-gradient(135deg,rgba(232,160,32,0.08),rgba(13,148,136,0.08));
                        border:1.5px solid rgba(232,160,32,0.25);border-radius:12px;
                        padding:24px;margin:20px 0;">
              <div style="font-size:15px;font-weight:700;margin-bottom:14px;">
                What you can do:
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;">
                <div>📚 Browse thousands of books across departments</div>
                <div>📦 Request to borrow up to 3 books at once</div>
                <div>📌 Reserve unavailable books</div>
                <div>🎫 Subscribe to Standard or Pro plan</div>
                <div>📖 Track your borrowing history</div>
              </div>
            </div>
 
            <p style="color:#64748b;font-size:13px;">
              Visit the library portal to get started. Happy reading! 📖
            </p>
            """.formatted(name);
        send(to, "Welcome to LibraryMS 📚", wrap("Welcome!", body));
    }
 
    // ─────────────────────────────────────────────────────────────────────────
    // 8. Book Renewal Confirmation
    // ─────────────────────────────────────────────────────────────────────────
    public void sendRenewalConfirmation(String to, String name,
                                         String bookTitle, LocalDateTime newDueDate) {
        String body = """
            <p style="font-size:15px;">Hello <strong>%s</strong>,</p>
            <p>Your book has been <strong style="color:#14B8A6;">renewed</strong> successfully.</p>
 
            <div style="background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;
                        padding:20px;margin:20px 0;">
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">📖 Book</div>
              <div style="font-weight:700;font-size:15px;color:#1a1f36;margin-bottom:12px;">%s</div>
              <div style="font-size:12px;color:#64748b;text-transform:uppercase;
                          letter-spacing:1px;margin-bottom:8px;">⏰ New Due Date</div>
              <div style="font-weight:700;font-size:18px;color:#14B8A6;">%s</div>
            </div>
 
            <p style="color:#64748b;font-size:13px;">
              Note: Each book can only be renewed <strong>once</strong>.
              Please return it by the new due date to avoid fines.
            </p>
            """.formatted(name, bookTitle,
                newDueDate != null ? newDueDate.format(DATE_FMT) : "—");
        send(to, "Book Renewed ✅", wrap("Renewal Confirmed", body));
    }
}