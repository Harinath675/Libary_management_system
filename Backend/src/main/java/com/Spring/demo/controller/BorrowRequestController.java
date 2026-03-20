package com.Spring.demo.controller;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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

@RestController
@RequestMapping("/api/borrow")
@CrossOrigin(origins = "*")
public class BorrowRequestController {

    @Autowired BorrowRequestRepository borrowRequestRepo;
    @Autowired BorrowingRepository borrowingRepo;
    @Autowired BookRepository bookRepo;
    @Autowired UserRepository userRepo;
    @Autowired MemberSubscriptionRepository subscriptionRepo;

    // ── Member: Submit borrow request (1-3 books) ────────────────────────────
   @PostMapping("/request")
public ResponseEntity<?> submitRequest(@RequestBody Map<String, Object> body) {

    // Jackson sends numbers as Integer not Long — use toString() to convert safely
    Long memberId;
    try {
        memberId = Long.parseLong(body.get("memberId").toString());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Invalid memberId");
    }

    // Jackson sends arrays as List<Integer> not List<Long> — NEVER cast directly
    List<Long> bookIds;
    try {
        List<?> rawIds = (List<?>) body.get("bookIds");
        if (rawIds == null || rawIds.isEmpty())
            return ResponseEntity.badRequest().body("No books selected");
        bookIds = rawIds.stream()
                        .map(item -> Long.parseLong(item.toString()))
                        .collect(Collectors.toList());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Invalid bookIds");
    }

        if (bookIds == null || bookIds.isEmpty())
            return ResponseEntity.badRequest().body("No books selected");
        if (bookIds.size() > 3)
            return ResponseEntity.badRequest().body("You can request at most 3 books at a time");

        // Check if member is blocked
        User member = userRepo.findById(memberId).orElse(null);
        if (member == null) return ResponseEntity.badRequest().body("Member not found");
        if (!member.isApproved()) return ResponseEntity.badRequest().body("Your account is blocked. Please clear your fines.");

        // Check active subscription
        Optional<MemberSubscription> activeSub = subscriptionRepo
            .findTopByMemberIdAndStatusOrderBySubscribedAtDesc(memberId, "ACTIVE");
        if (activeSub.isEmpty())
            return ResponseEntity.badRequest().body("NO_SUBSCRIPTION");

        MemberSubscription sub = activeSub.get();
        // Check subscription not expired
        if (sub.getExpiresAt().isBefore(LocalDateTime.now())) {
            sub.setStatus("EXPIRED");
            subscriptionRepo.save(sub);
            return ResponseEntity.badRequest().body("SUBSCRIPTION_EXPIRED");
        }

        // Check how many books currently borrowed
        long currentlyBorrowed = borrowingRepo.countByMemberIdAndStatus(memberId, "BORROWED");
        if (currentlyBorrowed + bookIds.size() > sub.getMaxBooks())
            return ResponseEntity.badRequest().body("LIMIT_EXCEEDED:" + sub.getMaxBooks() + ":" + currentlyBorrowed);

        // Check pending requests
        long pendingRequests = borrowRequestRepo.countByMemberIdAndStatus(memberId, "PENDING");
        if (pendingRequests > 0)
            return ResponseEntity.badRequest().body("You already have a pending borrow request");

        // Validate all books are available
        List<String> titles = new ArrayList<>();
        for (Long bookId : bookIds) {
            Book book = bookRepo.findById(bookId).orElse(null);
            if (book == null) return ResponseEntity.badRequest().body("Book ID " + bookId + " not found");
            if (book.getAvailableCopies() <= 0)
                return ResponseEntity.badRequest().body("Book '" + book.getTitle() + "' is not available");
            titles.add(book.getTitle());
        }

        // Create borrow request
        BorrowRequest req = new BorrowRequest();
        req.setMemberId(memberId);
        req.setMemberName(member.getName());
        req.setMemberEmail(member.getEmail());
        req.setBookIds(bookIds.stream().map(String::valueOf).reduce((a,b)->a+","+b).orElse(""));
        req.setBookTitles(String.join(", ", titles));
        req.setBookCount(bookIds.size());
        borrowRequestRepo.save(req);

        return ResponseEntity.ok("Borrow request submitted successfully");
    }

    // ── Admin/Librarian: Get all borrow requests ──────────────────────────────
    @GetMapping("/requests/all")
    public List<BorrowRequest> getAllRequests() {
        return borrowRequestRepo.findAll();
    }

    // ── Admin/Librarian: Get pending requests ─────────────────────────────────
    @GetMapping("/requests/pending")
    public List<BorrowRequest> getPendingRequests() {
        return borrowRequestRepo.findByStatus("PENDING");
    }

    // ── Member: Get my borrow requests ───────────────────────────────────────
    @GetMapping("/requests/my/{memberId}")
    public List<BorrowRequest> getMyRequests(@PathVariable Long memberId) {
        return borrowRequestRepo.findByMemberId(memberId);
    }

    // ── Admin/Librarian: Approve request + set due date ───────────────────────
    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        BorrowRequest req = borrowRequestRepo.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();
        if (!"PENDING".equals(req.getStatus()))
            return ResponseEntity.badRequest().body("Request is already " + req.getStatus());

        int dueDays = body.containsKey("dueDays") ? Integer.parseInt(body.get("dueDays").toString()) : 14;
        String approvedBy = body.containsKey("approvedBy") ? body.get("approvedBy").toString() : "Staff";

        LocalDateTime dueDate = LocalDateTime.now().plusDays(dueDays);

        // Update request status
        req.setStatus("APPROVED");
        req.setApprovedAt(LocalDateTime.now());
        req.setDueDate(dueDate);
        req.setApprovedBy(approvedBy);
        borrowRequestRepo.save(req);

        // Create individual Borrowing records and decrease available copies
        String[] bookIdArr = req.getBookIds().split(",");
        String[] bookTitleArr = req.getBookTitles().split(",");

        for (int i = 0; i < bookIdArr.length; i++) {
            Long bookId = Long.parseLong(bookIdArr[i].trim());
            Book book = bookRepo.findById(bookId).orElse(null);
            if (book != null) {
                // Decrease available copies
                book.setAvailableCopies(Math.max(0, book.getAvailableCopies() - 1));
                bookRepo.save(book);

                // Create borrowing record
                Borrowing b = new Borrowing();
                b.setMemberId(req.getMemberId());
                b.setMemberName(req.getMemberName());
                b.setMemberEmail(req.getMemberEmail());
                b.setBookId(bookId);
                b.setBookTitle(i < bookTitleArr.length ? bookTitleArr[i].trim() : book.getTitle());
                b.setBookAuthor(book.getAuthor());
                b.setBorrowRequestId(req.getId());
                b.setDueDate(dueDate);
                borrowingRepo.save(b);
            }
        }

        return ResponseEntity.ok("Request approved. Due date: " + dueDate.toLocalDate());
    }

    // ── Admin/Librarian: Reject request ──────────────────────────────────────
    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        BorrowRequest req = borrowRequestRepo.findById(id).orElse(null);
        if (req == null) return ResponseEntity.notFound().build();
        req.setStatus("REJECTED");
        borrowRequestRepo.save(req);
        return ResponseEntity.ok("Request rejected");
    }

    // ── Member: Get my borrowings ─────────────────────────────────────────────
    @GetMapping("/borrowings/my/{memberId}")
    public List<Borrowing> getMyBorrowings(@PathVariable Long memberId) {
        List<Borrowing> list = borrowingRepo.findByMemberId(memberId);
        // Auto-calculate overdue fines
        for (Borrowing b : list) {
            if ("BORROWED".equals(b.getStatus()) && b.getDueDate() != null && b.getDueDate().isBefore(LocalDateTime.now())) {
                long daysOverdue = ChronoUnit.DAYS.between(b.getDueDate(), LocalDateTime.now());
                b.setFineAmount(daysOverdue * 10.0);
                b.setStatus("OVERDUE");
                borrowingRepo.save(b);
            }
        }
        return list;
    }

    // ── Admin/Librarian: Get all borrowings ───────────────────────────────────
    @GetMapping("/borrowings/all")
    public List<Borrowing> getAllBorrowings() {
        return borrowingRepo.findAll();
    }

    // ── Admin/Librarian: Mark book returned ──────────────────────────────────
    @PutMapping("/borrowings/{id}/return")
    public ResponseEntity<?> returnBook(@PathVariable Long id) {
        Borrowing b = borrowingRepo.findById(id).orElse(null);
        if (b == null) return ResponseEntity.notFound().build();

        LocalDateTime now = LocalDateTime.now();

        // Calculate final fine if overdue
        if (b.getDueDate() != null && b.getDueDate().isBefore(now)) {
            long daysOverdue = ChronoUnit.DAYS.between(b.getDueDate(), now);
            b.setFineAmount(daysOverdue * 10.0);
        }

        b.setReturnedAt(now);
        b.setStatus("RETURNED");
        borrowingRepo.save(b);

        // Increase available copies
        Book book = bookRepo.findById(b.getBookId()).orElse(null);
        if (book != null) {
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepo.save(book);
        }

        // Check if total unpaid fines >= 500 → block member
        List<Borrowing> allBorrowings = borrowingRepo.findByMemberId(b.getMemberId());
        double totalUnpaidFine = allBorrowings.stream()
            .filter(bw -> !bw.isFinePaid() && bw.getFineAmount() > 0)
            .mapToDouble(Borrowing::getFineAmount)
            .sum();

        if (totalUnpaidFine >= 500) {
            User member = userRepo.findById(b.getMemberId()).orElse(null);
            if (member != null) {
                member.setApproved(false); // block
                userRepo.save(member);
            }
            return ResponseEntity.ok("Book returned. Fine: ₹" + b.getFineAmount() + ". Member BLOCKED due to total fines ≥ ₹500");
        }

        return ResponseEntity.ok("Book returned successfully. Fine: ₹" + b.getFineAmount());
    }

    // ── Admin/Librarian: Mark fine as paid + unblock member ──────────────────
    @PutMapping("/borrowings/{memberId}/pay-fine")
    public ResponseEntity<?> payFine(@PathVariable Long memberId) {
        List<Borrowing> borrowings = borrowingRepo.findByMemberId(memberId);
        for (Borrowing b : borrowings) {
            if (!b.isFinePaid() && b.getFineAmount() > 0) {
                b.setFinePaid(true);
                borrowingRepo.save(b);
            }
        }
        // Unblock member
        User member = userRepo.findById(memberId).orElse(null);
        if (member != null) {
            member.setApproved(true);
            userRepo.save(member);
        }
        return ResponseEntity.ok("Fine paid. Member unblocked.");
    }

    // ── Get member fine summary ───────────────────────────────────────────────
    @GetMapping("/borrowings/{memberId}/fines")
    public ResponseEntity<?> getMemberFines(@PathVariable Long memberId) {
        List<Borrowing> borrowings = borrowingRepo.findByMemberId(memberId);
        double total = borrowings.stream().filter(b -> !b.isFinePaid()).mapToDouble(Borrowing::getFineAmount).sum();
        Map<String, Object> result = new HashMap<>();
        result.put("totalFine", total);
        result.put("borrowings", borrowings);
        return ResponseEntity.ok(result);
    }
}
