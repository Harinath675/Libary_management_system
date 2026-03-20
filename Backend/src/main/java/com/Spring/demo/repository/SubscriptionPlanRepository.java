// ─── SubscriptionPlanRepository.java ─────────────────────────────────────────
// Path: Backend/src/main/java/com/Spring/demo/repository/SubscriptionPlanRepository.java

package com.Spring.demo.repository;

import com.Spring.demo.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    List<SubscriptionPlan> findByActiveTrue();
    Optional<SubscriptionPlan> findByPlanType(String planType);
}
