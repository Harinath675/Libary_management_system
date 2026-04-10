// package com.Spring.demo.controller;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.Spring.demo.LoginRequest.LoginRequest;
// import com.Spring.demo.entity.User;
// import com.Spring.demo.service.UserService;

// @RestController
// @RequestMapping("/api/auth")
// public class AuthController {

//     @Autowired
//     private UserService userService;

//     @PostMapping("/register")
//     public User register(@RequestBody User user) {
//         return userService.registerUser(user);
//     }

//     @PostMapping("/login")
//     public User login(@RequestBody LoginRequest loginRequest) {
//         return userService.login(
//                 loginRequest.getEmail(),
//                 loginRequest.getPassword()
//         );
//     }

// }

package com.Spring.demo.controller;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Spring.demo.LoginRequest.LoginRequest;
import com.Spring.demo.entity.User;
import com.Spring.demo.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest loginRequest) {
        return userService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
    }
@PostMapping("/change-password")
public ResponseEntity<String> changePassword(@RequestBody Map<String, String> req) {
    String email           = req.get("email");
    String currentPassword = req.get("currentPassword");
    String newPassword     = req.get("newPassword");
    try {
        userService.changePassword(email, currentPassword, newPassword);
        return ResponseEntity.ok("Password updated successfully!");
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}

    // 🔥 ADD THIS METHOD
    @PostMapping("/verify")
    public String verifyOtp(@RequestParam String email,
                            @RequestParam String otp) {
        return userService.verifyOtp(email, otp);
    }
    @GetMapping("/test")
public String test() {
    return "Backend Connected Successfully!";
}
}