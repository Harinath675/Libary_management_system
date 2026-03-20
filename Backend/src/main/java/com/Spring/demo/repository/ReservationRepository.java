package com.Spring.demo.repository;

import com.Spring.demo.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

// ─────────────────────────────────────────────────────────────────────────────
// ReservationRepository.java
// Spring Data JPA auto-implements all methods from their names — no SQL needed.
// ─────────────────────────────────────────────────────────────────────────────
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // All reservations for a specific member (shown in Member dashboard)
    List<Reservation> findByMemberId(Long memberId);

    // All reservations filtered by status (e.g. all PENDING)
    List<Reservation> findByStatus(String status);

    // Check if a member already has a PENDING reservation for a specific book
    // Used to prevent duplicate reservations
    // SQL: SELECT COUNT(*) > 0 FROM reservations
    //      WHERE member_id=? AND book_id=? AND status=?
    boolean existsByMemberIdAndBookIdAndStatus(Long memberId, Long bookId, String status);
}
