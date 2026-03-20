package com.Spring.demo.controller;

import com.Spring.demo.entity.*;
import com.Spring.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    @Autowired SubscriptionPlanRepository planRepo;
    @Autowired MemberSubscriptionRepository memberSubRepo;
    @Autowired UserRepository userRepo;

    // ── Seed default plans if not exist ──────────────────────────────────────
    @PostConstruct
    public void seedPlans() {
        if (planRepo.findByPlanType("STANDARD").isEmpty()) {
            SubscriptionPlan standard = new SubscriptionPlan();
            standard.setPlanType("STANDARD");
            standard.setPlanName("Standard Plan");
            standard.setPrice(99.0);
            standard.setDurationDays(30);
            standard.setMaxBooks(6);
            standard.setDescription("Borrow up to 6 books per month");
            planRepo.save(standard);
        }
        if (planRepo.findByPlanType("PRO").isEmpty()) {
            SubscriptionPlan pro = new SubscriptionPlan();
            pro.setPlanType("PRO");
            pro.setPlanName("Pro Plan");
            pro.setPrice(299.0);
            pro.setDurationDays(30);
            pro.setMaxBooks(999);
            pro.setDescription("Unlimited books per month");
            planRepo.save(pro);
        }
    }

    // ── Get all active plans (public) ─────────────────────────────────────────
    @GetMapping("/plans")
    public List<SubscriptionPlan> getPlans() {
        return planRepo.findByActiveTrue();
    }

    // ── Admin: Update plan settings ───────────────────────────────────────────
    @PutMapping("/plans/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable Long id, @RequestBody SubscriptionPlan updated) {
        return planRepo.findById(id).map(plan -> {
            plan.setPrice(updated.getPrice());
            plan.setDurationDays(updated.getDurationDays());
            plan.setDescription(updated.getDescription());
            plan.setMaxBooks(updated.getMaxBooks());
            plan.setPlanName(updated.getPlanName());
            planRepo.save(plan);
            return ResponseEntity.ok("Plan updated");
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Member: Subscribe to a plan ───────────────────────────────────────────
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody Map<String, Object> body) {
        Long memberId = Long.valueOf(body.get("memberId").toString());
        Long planId   = Long.valueOf(body.get("planId").toString());

        User member = userRepo.findById(memberId).orElse(null);
        if (member == null) return ResponseEntity.badRequest().body("Member not found");

        SubscriptionPlan plan = planRepo.findById(planId).orElse(null);
        if (plan == null) return ResponseEntity.badRequest().body("Plan not found");

        // Check if already has active subscription
        Optional<MemberSubscription> existing = memberSubRepo
            .findTopByMemberIdAndStatusOrderBySubscribedAtDesc(memberId, "ACTIVE");
        if (existing.isPresent() && existing.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("ALREADY_SUBSCRIBED:" + existing.get().getPlanType());
        }

        MemberSubscription sub = new MemberSubscription();
        sub.setMemberId(memberId);
        sub.setMemberName(member.getName());
        sub.setMemberEmail(member.getEmail());
        sub.setPlanId(planId);
        sub.setPlanType(plan.getPlanType());
        sub.setPlanName(plan.getPlanName());
        sub.setMaxBooks(plan.getMaxBooks());
        sub.setExpiresAt(LocalDateTime.now().plusDays(plan.getDurationDays()));
        sub.setAmountPaid(plan.getPrice());
        memberSubRepo.save(sub);

        return ResponseEntity.ok("Subscribed to " + plan.getPlanName() + " successfully!");
    }

    // ── Member: Get my active subscription ───────────────────────────────────
    @GetMapping("/my/{memberId}")
    public ResponseEntity<?> getMySub(@PathVariable Long memberId) {
        Optional<MemberSubscription> sub = memberSubRepo
            .findTopByMemberIdAndStatusOrderBySubscribedAtDesc(memberId, "ACTIVE");

        if (sub.isEmpty()) return ResponseEntity.ok(Map.of("status", "NONE"));

        MemberSubscription s = sub.get();
        // Check if expired
        if (s.getExpiresAt().isBefore(LocalDateTime.now())) {
            s.setStatus("EXPIRED");
            memberSubRepo.save(s);
            return ResponseEntity.ok(Map.of("status", "EXPIRED"));
        }
        return ResponseEntity.ok(s);
    }

    // ── Admin/Librarian: Get all member subscriptions ─────────────────────────
    @GetMapping("/all")
    public List<MemberSubscription> getAllSubs() {
        return memberSubRepo.findAll();
    }

    // ── Member: Get subscription history ─────────────────────────────────────
    @GetMapping("/history/{memberId}")
    public List<MemberSubscription> getSubHistory(@PathVariable Long memberId) {
        return memberSubRepo.findByMemberId(memberId);
    }
}
