package com.Spring.demo.controller;
 
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Spring.demo.entity.Book;
import com.Spring.demo.entity.BorrowRequest;
import com.Spring.demo.entity.Borrowing;
import com.Spring.demo.entity.MemberSubscription;
import com.Spring.demo.entity.User;
import com.Spring.demo.repository.BookRepository;
import com.Spring.demo.repository.BorrowRequestRepository;
import com.Spring.demo.repository.BorrowingRepository;
import com.Spring.demo.repository.MemberSubscriptionRepository;
import com.Spring.demo.repository.UserRepository;
import com.Spring.demo.service.EmailService;
import com.Spring.demo.service.NotificationService;
 
@RestController
@RequestMapping("/api/borrow")
@CrossOrigin(origins = "*")
public class BorrowRequestController {
 
    @Autowired BorrowRequestRepository      borrowRequestRepo;
    @Autowired BorrowingRepository          borrowingRepo;
    @Autowired BookRepository               bookRepo;
    @Autowired UserRepository               userRepo;
    @Autowired MemberSubscriptionRepository subscriptionRepo;
    @Autowired EmailService                 emailService;
    @Autowired NotificationService          notificationService;
 
    private static final DateTimeFormatter DATE_FMT =
        DateTimeFormatter.ofPattern("dd MMM yyyy");
 
    // ── POST /api/borrow/request — Member submits borrow request ─────────────
    @PostMapping("/request")
    public ResponseEntity<?> submitRequest(@RequestBody Map<String, Object> body) {
 
        Long memberId;
        try { memberId = Long.parseLong(body.get("memberId").toString()); }
        catch (Exception e) { return ResponseEntity.badRequest().body("Invalid memberId"); }
 
        List<Long> bookIds;
        try {
            List<?> rawIds = (List<?>) body.get("bookIds");
            if (rawIds == null || rawIds.isEmpty())
                return ResponseEntity.badRequest().body("No books selected");
            bookIds = rawIds.stream()
                            .map(item -> Long.parseLong(item.toString()))
                            .collect(Collectors.toList());
        } catch (Exception e) { return ResponseEntity.badRequest().body("Invalid bookIds"); }
 
        // Load member
        User member = userRepo.findById(memberId).orElse(null);
        if (member == null) return ResponseEntity.badRequest().body("Member not found");
        if (!member.isApproved()) return ResponseEntity.badRequest().body("BLOCKED");
 
        // Check subscription
        MemberSubscription sub = subscriptionRepo
            .findTopByMemberIdAndStatusOrderBySubscribedAtDesc(memberId, "ACTIVE")
            .orElse(null);
        if (sub == null) return ResponseEntity.badRequest().body("NO_SUBSCRIPTION");
        if (sub.getExpiresAt() != null && sub.getExpiresAt().isBefore(LocalDateTime.now()))
            return ResponseEntity.badRequest().body("SUBSCRIPTION_EXPIRED");
 
        // Check borrow limit
       int maxBooks = sub.getMaxBooks() > 0 ? sub.getMaxBooks() : 6;
long currentBorrows = borrowingRepo.countByMemberIdAndStatus(memberId, "BORROWED")
                    + borrowingRepo.countByMemberIdAndStatus(memberId, "OVERDUE");
        if (currentBorrows + bookIds.size() > maxBooks)
            return ResponseEntity.badRequest()
                .body("LIMIT_EXCEEDED:" + maxBooks + ":" + currentBorrows);
 
        // Check pending request
        long pending = borrowRequestRepo.countByMemberIdAndStatus(memberId, "PENDING");
        if (pending > 0) return ResponseEntity.badRequest().body("PENDING_EXISTS");
 
        // Build comma-separated book ids and titles
        StringBuilder ids    = new StringBuilder();
        StringBuilder titles = new StringBuilder();
        for (Long bid : bookIds) {
            Book book = bookRepo.findById(bid).orElse(null);
            if (book == null) return ResponseEntity.badRequest().body("Book not found: " + bid);
            if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0)
                return ResponseEntity.badRequest().body("Book unavailable: " + book.getTitle());
            if (ids.length() > 0) { ids.append(","); titles.append(","); }
            ids.append(bid);
            titles.append(book.getTitle());
        }
 
        BorrowRequest req = new BorrowRequest();
        req.setMemberId(memberId);
        req.setMemberName(member.getName());
        req.setMemberEmail(member.getEmail());
        req.setBookIds(ids.toString());
        req.setBookTitles(titles.toString());
        req.setBookCount(bookIds.size());
        req.setStatus("PENDING");
        req.setRequestedAt(LocalDateTime.now());
        borrowRequestRepo.save(req);
 
        return ResponseEntity.ok("Borrow request submitted successfully");
    }
 
    // ── GET all requests ──────────────────────────────────────────────────────
    @GetMapping("/requests/all")
    public List<BorrowRequest> getAllRequests() { return borrowRequestRepo.findAll(); }
 
    @GetMapping("/requests/pending")
    public List<BorrowRequest> getPendingRequests() {
        return borrowRequestRepo.findByStatus("PENDING");
    }
 
    @GetMapping("/requests/my/{memberId}")
    public List<BorrowRequest> getMyRequests(@PathVariable Long memberId) {
        return borrowRequestRepo.findByMemberId(memberId);
    }
 
    // ── PUT approve ───────────────────────────────────────────────────────────
    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
 
        BorrowRequest req = borrowRequestRepo.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();
        if (!"PENDING".equals(req.getStatus()))
            return ResponseEntity.badRequest().body("Request is already " + req.getStatus());
 
        int dueDays = 14;
        if (body.containsKey("dueDays")) {
            try { dueDays = Integer.parseInt(body.get("dueDays").toString()); }
            catch (Exception ignored) {}
        }
        String approvedBy = body.containsKey("approvedBy")
            ? body.get("approvedBy").toString() : "Staff";
 
        LocalDateTime dueDate = LocalDateTime.now().plusDays(dueDays);
        req.setStatus("APPROVED");
        req.setApprovedAt(LocalDateTime.now());
        req.setDueDate(dueDate);
        req.setApprovedBy(approvedBy);
        borrowRequestRepo.save(req);
 
        String[] bookIdArr    = req.getBookIds().split(",");
        String[] bookTitleArr = req.getBookTitles().split(",");
 
        for (int i = 0; i < bookIdArr.length; i++) {
            Long bookId;
            try { bookId = Long.parseLong(bookIdArr[i].trim()); }
            catch (NumberFormatException e) { continue; }
 
            Book book = bookRepo.findById(bookId).orElse(null);
            if (book == null) continue;
            int current = (book.getAvailableCopies() != null) ? book.getAvailableCopies() : 0;
            book.setAvailableCopies(Math.max(0, current - 1));
            bookRepo.save(book);
 
            Borrowing b = new Borrowing();
            b.setMemberId(req.getMemberId());
            b.setMemberName(req.getMemberName());
            b.setMemberEmail(req.getMemberEmail());
            b.setBookId(bookId);
            b.setBookTitle(i < bookTitleArr.length ? bookTitleArr[i].trim() : book.getTitle());
            b.setBookAuthor(book.getAuthor() != null ? book.getAuthor() : "");
            b.setBorrowRequestId(req.getId());
            b.setBorrowedAt(LocalDateTime.now());
            b.setDueDate(dueDate);
            b.setStatus("BORROWED");
            b.setFineAmount(0.0);
            b.setFinePaid(false);
            b.setRenewed(false);
            borrowingRepo.save(b);
        }
 
        // Send approval email + in-app notification
        try {
            emailService.sendBorrowApproved(
                req.getMemberEmail(), req.getMemberName(),
                req.getBookTitles(), dueDate);
            notificationService.notifyBorrowApproved(
                req.getMemberId(), req.getBookTitles(),
                dueDate.format(DATE_FMT));
        } catch (Exception e) {
            System.out.println("⚠️ Approval notification failed: " + e.getMessage());
        }
 
        return ResponseEntity.ok("Approved. Due: " + dueDate.toLocalDate());
    }
 
    // ── PUT reject ────────────────────────────────────────────────────────────
    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        BorrowRequest req = borrowRequestRepo.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();
        req.setStatus("REJECTED");
        borrowRequestRepo.save(req);
 
        // Send rejection email + in-app notification
        try {
            emailService.sendBorrowRejected(
                req.getMemberEmail(), req.getMemberName(), req.getBookTitles());
            notificationService.notifyBorrowRejected(req.getMemberId(), req.getBookTitles());
        } catch (Exception e) {
            System.out.println("⚠️ Rejection notification failed: " + e.getMessage());
        }
 
        return ResponseEntity.ok("Request rejected");
    }
 
    // ── GET my borrowings ─────────────────────────────────────────────────────
    @GetMapping("/borrowings/my/{memberId}")
    public List<Borrowing> getMyBorrowings(@PathVariable Long memberId) {
        List<Borrowing> list = borrowingRepo.findByMemberId(memberId);
        LocalDateTime now = LocalDateTime.now();
        for (Borrowing b : list) {
            if ("BORROWED".equals(b.getStatus())
                    && b.getDueDate() != null
                    && b.getDueDate().isBefore(now)) {
                long daysOverdue = ChronoUnit.DAYS.between(b.getDueDate(), now);
                if (daysOverdue < 1) daysOverdue = 1;
                b.setFineAmount(daysOverdue * 10.0);
                b.setStatus("OVERDUE");
                borrowingRepo.save(b);
            }
        }
        return list;
    }
 
    @GetMapping("/borrowings/all")
    public List<Borrowing> getAllBorrowings() { return borrowingRepo.findAll(); }
 
    // ── PUT return book ───────────────────────────────────────────────────────
    @PutMapping("/borrowings/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        Borrowing b = borrowingRepo.findById(id).orElse(null);
        if (b == null) return ResponseEntity.notFound().build();
        if ("RETURNED".equals(b.getStatus()))
            return ResponseEntity.badRequest().body("Book already returned");
 
        LocalDateTime now = LocalDateTime.now();
        if (b.getDueDate() != null && b.getDueDate().isBefore(now)) {
            long daysOverdue = ChronoUnit.DAYS.between(b.getDueDate(), now);
            b.setFineAmount(daysOverdue * 10.0);
        } else {
            b.setFineAmount(0.0);
        }
        b.setReturnedAt(now);
        b.setStatus("RETURNED");
        borrowingRepo.save(b);
 
        Book book = bookRepo.findById(b.getBookId()).orElse(null);
        if (book != null) {
            book.setAvailableCopies((book.getAvailableCopies() != null ? book.getAvailableCopies() : 0) + 1);
            bookRepo.save(book);
        }
 
        double totalUnpaid = borrowingRepo.findByMemberId(b.getMemberId()).stream()
            .filter(bw -> !bw.isFinePaid() && bw.getFineAmount() > 0)
            .mapToDouble(Borrowing::getFineAmount).sum();
 
        String msg = "Book returned. Fine: ₹" + String.format("%.0f", b.getFineAmount());
        if (totalUnpaid >= 500) {
            User member = userRepo.findById(b.getMemberId()).orElse(null);
            if (member != null) { member.setApproved(false); userRepo.save(member); }
            msg += ". Account BLOCKED — total fines ≥ ₹500";
        }
        return ResponseEntity.ok(msg);
    }
 
    // ── PUT pay fine ──────────────────────────────────────────────────────────
    @PutMapping("/borrowings/{memberId}/pay-fine")
    public ResponseEntity<?> payFine(@PathVariable Long memberId) {
        double totalPaid = 0;
        for (Borrowing b : borrowingRepo.findByMemberId(memberId)) {
            if (!b.isFinePaid() && b.getFineAmount() > 0) {
                totalPaid += b.getFineAmount();
                b.setFinePaid(true);
                borrowingRepo.save(b);
            }
        }
        User member = userRepo.findById(memberId).orElse(null);
        if (member != null) { member.setApproved(true); userRepo.save(member); }
 
        // Send fine cleared email + in-app notification
        try {
            if (member != null && totalPaid > 0) {
                emailService.sendFineCleared(member.getEmail(), member.getName(), totalPaid);
                notificationService.notifyFineCleared(memberId, totalPaid);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Fine cleared notification failed: " + e.getMessage());
        }
 
        return ResponseEntity.ok("Fine cleared. Member unblocked.");
    }
 
    // ── GET fines summary ─────────────────────────────────────────────────────
    @GetMapping("/borrowings/{memberId}/fines")
    public ResponseEntity<?> getMemberFines(@PathVariable Long memberId) {
        List<Borrowing> list = borrowingRepo.findByMemberId(memberId);
        double total = list.stream().filter(b -> !b.isFinePaid())
                           .mapToDouble(Borrowing::getFineAmount).sum();
        Map<String, Object> result = new HashMap<>();
        result.put("totalFine",  total);
        result.put("borrowings", list);
        return ResponseEntity.ok(result);
    }
 
    // ── PUT renew book ────────────────────────────────────────────────────────
    // Extends due date by 7 days. Only allowed once per borrow. Not if overdue.
    // URL: PUT /api/borrow/borrowings/{id}/renew
    @PutMapping("/borrowings/{id}/renew")
    public ResponseEntity<?> renewBook(@PathVariable Long id) {
        Borrowing b = borrowingRepo.findById(id).orElse(null);
        if (b == null) return ResponseEntity.notFound().build();
 
        if (!"BORROWED".equals(b.getStatus()))
            return ResponseEntity.badRequest().body("Only BORROWED books can be renewed");
 
        if (b.isRenewed())
            return ResponseEntity.badRequest().body("ALREADY_RENEWED");
 
        if (b.getDueDate() != null && b.getDueDate().isBefore(LocalDateTime.now()))
            return ResponseEntity.badRequest().body("OVERDUE — cannot renew overdue books");
 
        // Extend by 7 days from current due date
        LocalDateTime newDueDate = b.getDueDate().plusDays(7);
        b.setDueDate(newDueDate);
        b.setRenewed(true);
        borrowingRepo.save(b);
 
        // Send renewal email + in-app notification
        try {
            User member = userRepo.findById(b.getMemberId()).orElse(null);
            if (member != null) {
                emailService.sendRenewalConfirmation(
                    member.getEmail(), member.getName(),
                    b.getBookTitle(), newDueDate);
                notificationService.notifyRenewal(
                    b.getMemberId(), b.getBookTitle(),
                    newDueDate.format(DATE_FMT));
            }
        } catch (Exception e) {
            System.out.println("⚠️ Renewal notification failed: " + e.getMessage());
        }
 
        return ResponseEntity.ok(Map.of(
            "message",    "Book renewed successfully",
            "newDueDate", newDueDate.toString()
        ));
    }
}