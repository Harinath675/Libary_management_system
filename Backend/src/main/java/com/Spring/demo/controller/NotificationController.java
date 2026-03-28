package com.Spring.demo.controller;

import com.Spring.demo.entity.Notification;
import com.Spring.demo.repository.NotificationRepository;
import com.Spring.demo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ─────────────────────────────────────────────────────────────────────────────
// NotificationController.java
//
// ENDPOINTS:
//   GET  /api/notifications/{userId}          — all notifications (newest first)
//   GET  /api/notifications/{userId}/unread   — unread only
//   GET  /api/notifications/{userId}/count    — unread count (for bell badge)
//   PUT  /api/notifications/{userId}/read-all — mark all as read
//   PUT  /api/notifications/{id}/read         — mark single notification as read
//   DELETE /api/notifications/{userId}/clear  — delete all notifications
// ─────────────────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired NotificationRepository notificationRepo;
    @Autowired NotificationService    notificationService;

    // ── GET all notifications for user ────────────────────────────────────────
    @GetMapping("/{userId}")
    public List<Notification> getAll(@PathVariable Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // ── GET unread count — used for bell badge ────────────────────────────────
    @GetMapping("/{userId}/count")
    public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
        long count = notificationRepo.countByUserIdAndIsReadFalse(userId);
        return ResponseEntity.ok(Map.of("unread", count));
    }

    // ── PUT mark all as read ──────────────────────────────────────────────────
    @PutMapping("/{userId}/read-all")
    public ResponseEntity<?> markAllRead(@PathVariable Long userId) {
        notificationRepo.markAllReadForUser(userId);
        return ResponseEntity.ok("All notifications marked as read");
    }

    // ── PUT mark single notification as read ──────────────────────────────────
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        Notification n = notificationRepo.findById(id).orElse(null);
        if (n == null) return ResponseEntity.notFound().build();
        n.setRead(true);
        notificationRepo.save(n);
        return ResponseEntity.ok("Marked as read");
    }

    // ── DELETE all notifications for user ─────────────────────────────────────
    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<?> clearAll(@PathVariable Long userId) {
        List<Notification> all = notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepo.deleteAll(all);
        return ResponseEntity.ok("All notifications cleared");
    }
}
