package com.Spring.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Spring.demo.entity.User;
import com.Spring.demo.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    // ✅ GET all pending users (not approved yet)
    @GetMapping("/pending-users")
    public List<User> getPendingUsers() {
        return userService.getPendingUsers();
    }

    // ✅ GET all users
    @GetMapping("/all-users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // ✅ APPROVE a user
    @PostMapping("/approve")
    public String approveUser(@RequestParam String email) {
        return userService.approveUser(email);
    }
}