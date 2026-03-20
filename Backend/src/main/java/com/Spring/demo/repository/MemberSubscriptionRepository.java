// ─── MemberSubscriptionRepository.java ───────────────────────────────────────
// Path: Backend/src/main/java/com/Spring/demo/repository/MemberSubscriptionRepository.java

package com.Spring.demo.repository;

import com.Spring.demo.entity.MemberSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MemberSubscriptionRepository extends JpaRepository<MemberSubscription, Long> {
    Optional<MemberSubscription> findTopByMemberIdAndStatusOrderBySubscribedAtDesc(Long memberId, String status);
    List<MemberSubscription> findByMemberId(Long memberId);
    List<MemberSubscription> findByStatus(String status);
}
