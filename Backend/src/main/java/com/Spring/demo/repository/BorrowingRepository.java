// ─── BorrowingRepository.java ────────────────────────────────────────────────
// Path: Backend/src/main/java/com/Spring/demo/repository/BorrowingRepository.java

package com.Spring.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Spring.demo.entity.Borrowing;


public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {
    
    List<Borrowing> findByMemberId(Long memberId);
    List<Borrowing> findByStatus(String status);
    List<Borrowing> findByMemberIdAndStatus(Long memberId, String status);
    long countByMemberIdAndStatus(Long memberId, String status);
}
