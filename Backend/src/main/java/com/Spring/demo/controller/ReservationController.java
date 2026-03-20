package com.Spring.demo.controller;

import com.Spring.demo.entity.Reservation;
import com.Spring.demo.repository.ReservationRepository;
import com.Spring.demo.repository.BookRepository;
import com.Spring.demo.repository.UserRepository;
import com.Spring.demo.entity.Book;
import com.Spring.demo.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

// ─────────────────────────────────────────────────────────────────────────────
// ReservationController.java
//
// PURPOSE: Handles book RESERVATIONS — when a member wants a book that has
//          ZERO available copies. They join a waitlist.
//
// THIS IS DIFFERENT FROM BorrowRequestController:
//   Reservation  = book is UNAVAILABLE (0 copies) → member joins waitlist
//   BorrowRequest = book is AVAILABLE (≥1 copy)   → member requests to borrow now
//
// ENDPOINTS:
//   POST /api/reservations/request          — Member reserves an unavailable book
//   GET  /api/reservations/my/{memberId}    — Member views their own reservations
//   GET  /api/reservations/all              — Admin/Librarian views all reservations
//   PUT  /api/reservations/{id}/status      — Admin/Librarian approves or rejects
// ─────────────────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    @Autowired ReservationRepository reservationRepo;
    @Autowired BookRepository        bookRepo;
    @Autowired UserRepository        userRepo;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/reservations/request
    // Body: { "bookId": 5, "memberId": 3 }
    //
    // Member reserves an unavailable book.
    // Validates: book exists, book is actually unavailable,
    //            member hasn't already reserved this book.
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/request")
    public ResponseEntity<?> requestReservation(@RequestBody Map<String, Object> body) {

        // Parse IDs safely (Jackson sends numbers as Integer, not Long)
        Long bookId;
        Long memberId;
        try {
            bookId   = Long.parseLong(body.get("bookId").toString());
            memberId = Long.parseLong(body.get("memberId").toString());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid bookId or memberId");
        }

        // Load book
        Book book = bookRepo.findById(bookId).orElse(null);
        if (book == null)
            return ResponseEntity.badRequest().body("Book not found");

        // Load member
        User member = userRepo.findById(memberId).orElse(null);
        if (member == null)
            return ResponseEntity.badRequest().body("Member not found");

        // Check if already reserved by this member
        boolean alreadyReserved = reservationRepo
            .existsByMemberIdAndBookIdAndStatus(memberId, bookId, "PENDING");
        if (alreadyReserved)
            return ResponseEntity.badRequest().body("You already have a pending reservation for this book");

        // Create the reservation record
        Reservation r = new Reservation();
        r.setMemberId(memberId);
        r.setMemberName(member.getName());
        r.setMemberEmail(member.getEmail());
        r.setBookId(bookId);
        r.setBookTitle(book.getTitle());
        r.setBookAuthor(book.getAuthor());
        r.setBookDepartment(book.getDepartment());
        r.setStatus("PENDING");
        r.setRequestedAt(LocalDateTime.now());

        reservationRepo.save(r);
        return ResponseEntity.ok("Reservation submitted successfully");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/reservations/my/{memberId}
    // Returns all reservations made by this specific member.
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/my/{memberId}")
    public List<Reservation> getMyReservations(@PathVariable Long memberId) {
        return reservationRepo.findByMemberId(memberId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/reservations/all
    // Returns ALL reservations — used by Admin and Librarian dashboards.
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/all")
    public List<Reservation> getAllReservations() {
        return reservationRepo.findAll();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUT /api/reservations/{id}/status?status=APPROVED
    // PUT /api/reservations/{id}/status?status=REJECTED
    //
    // Admin or Librarian approves or rejects a PENDING reservation.
    // ─────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        Reservation r = reservationRepo.findById(id).orElse(null);
        if (r == null)
            return ResponseEntity.notFound().build();

        r.setStatus(status);  // "APPROVED" or "REJECTED"
        reservationRepo.save(r);
        return ResponseEntity.ok("Reservation " + status.toLowerCase());
    }
}
