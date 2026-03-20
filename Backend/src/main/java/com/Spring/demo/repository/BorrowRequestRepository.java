// ─── BorrowRequestRepository.java ───────────────────────────────────────────
// Path: Backend/src/main/java/com/Spring/demo/repository/BorrowRequestRepository.java

package com.Spring.demo.repository;

import com.Spring.demo.entity.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    List<BorrowRequest> findByMemberId(Long memberId);
    List<BorrowRequest> findByStatus(String status);
    long countByMemberIdAndStatus(Long memberId, String status);
}
