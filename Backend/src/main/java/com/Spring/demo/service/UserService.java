// package com.Spring.demo.service;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import com.Spring.demo.entity.Role;
// import com.Spring.demo.entity.User;
// import com.Spring.demo.repository.UserRepository;

// @Service
// public class UserService {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     public User registerUser(User user) {

//         // Encrypt password before saving
//         user.setPassword(passwordEncoder.encode(user.getPassword()));

//         // Default role
//         if (user.getRole() == null) {
//             user.setRole(Role.MEMBER);
//         }

//         return userRepository.save(user);
//     }
//     public User login(String email, String password) {

//     User user = userRepository.findByEmail(email)
//             .orElseThrow(() -> new RuntimeException("User not found"));

//     if (!passwordEncoder.matches(password, user.getPassword())) {
//         throw new RuntimeException("Invalid password");
//     }

//     return user;
// }

// }

// package com.Spring.demo.service;

// import java.time.LocalDateTime;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import com.Spring.demo.entity.Role;
// import com.Spring.demo.entity.User;
// import com.Spring.demo.repository.UserRepository;

// @Service
// public class UserService {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @Autowired
//     private EmailService emailService;

//     // ✅ REGISTER USER WITH OTP FOR MEMBER
//     public User registerUser(User user) {

//         // Encrypt password
//         user.setPassword(passwordEncoder.encode(user.getPassword()));

//         if (user.getRole() == Role.MEMBER) {

//             // Generate 6-digit OTP
//             String otp = String.valueOf((int)(100000 + Math.random() * 900000));

//             user.setOtp(otp);
//             user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
//             user.setVerified(false);

//             // Debug (check console)
//             System.out.println("Generated OTP: " + otp);

//             // Send OTP email
//             emailService.sendOtp(user.getEmail(), otp);

//         } else {
//             // Admin & Librarian auto verified
//             user.setVerified(true);
//         }

//         return userRepository.save(user);
//     }

//     // ✅ VERIFY OTP
//     public String verifyOtp(String email, String otp) {

//         User user = userRepository.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("User not found"));

//         if (user.getOtp() == null) {
//             throw new RuntimeException("No OTP generated");
//         }

//         if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
//             throw new RuntimeException("OTP expired");
//         }

//         if (!user.getOtp().equals(otp)) {
//             throw new RuntimeException("Invalid OTP");
//         }

//         user.setVerified(true);
//         user.setOtp(null);
//         user.setOtpExpiry(null);

//         userRepository.save(user);

//         return "Email verified successfully";
//     }

//     // ✅ LOGIN
//     public User login(String email, String password) {

//         User user = userRepository.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("Invalid email"));

//         if (!passwordEncoder.matches(password, user.getPassword())) {
//             throw new RuntimeException("Invalid password");
//         }

//         if (!user.isVerified()) {
//             throw new RuntimeException("Please verify your email first");
//         }

//         return user;
//     }
// }



// package com.Spring.demo.service;

// import java.time.LocalDateTime;
// import java.util.Optional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import com.Spring.demo.entity.Role;
// import com.Spring.demo.entity.User;
// import com.Spring.demo.repository.UserRepository;

// @Service
// public class UserService {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @Autowired
//     private EmailService emailService;

//     // ✅ REGISTER USER WITH OTP FOR MEMBER
//     public User registerUser(User user) {

//         // 🔥 Check if email already exists
//         Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

//         if (existingUser.isPresent()) {

//             if (existingUser.get().isVerified()) {
//                 throw new RuntimeException("Email already registered");
//             } else {
//                 throw new RuntimeException("Email already registered. Please verify OTP.");
//             }
//         }

//         // Encrypt password
//         user.setPassword(passwordEncoder.encode(user.getPassword()));

//         if (user.getRole() == Role.MEMBER) {

//             // Generate 6-digit OTP
//             String otp = String.valueOf((int) (100000 + Math.random() * 900000));

//             user.setOtp(otp);
//             user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
//             user.setVerified(false);

//             System.out.println("Generated OTP: " + otp);

//             // 🔥 Save first
//             userRepository.save(user);

//             // 🔥 Then send email
//             emailService.sendOtp(user.getEmail(), otp);

//             return user;

//         } else {
//             // Admin & Librarian auto verified
//             user.setVerified(true);
//             return userRepository.save(user);
//         }
//     }

//     // ✅ VERIFY OTP
//     public String verifyOtp(String email, String otp) {

//         User user = userRepository.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("User not found"));

//         // If already verified
//         if (user.isVerified()) {
//             return "User already verified";
//         }

//         if (user.getOtp() == null) {
//             return "No OTP generated for this user";
//         }

//         if (user.getOtpExpiry() == null) {
//             return "OTP expiry missing";
//         }

//         if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
//             return "OTP expired";
//         }

//         if (!user.getOtp().equals(otp)) {
//             return "Invalid OTP";
//         }

//         user.setVerified(true);
//         user.setOtp(null);
//         user.setOtpExpiry(null);

//         userRepository.save(user);

//         return "Email verified successfully";
//     }

//     // ✅ LOGIN
//     public User login(String email, String password) {

//         User user = userRepository.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("Invalid email"));

//         if (!passwordEncoder.matches(password, user.getPassword())) {
//             throw new RuntimeException("Invalid password");
//         }

//         if (!user.isVerified()) {
//             throw new RuntimeException("Please verify your email before login");
//         }

//         return user;
//     }
// }

// package com.Spring.demo.service;

// import java.time.LocalDateTime;
// import java.util.Optional;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Service;

// import com.Spring.demo.entity.Role;
// import com.Spring.demo.entity.User;
// import com.Spring.demo.repository.UserRepository;

// @Service
// public class UserService {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @Autowired
//     private EmailService emailService;

//     // ✅ REGISTER USER (Member → OTP, Admin/Librarian → Need Approval)
//     public User registerUser(User user) {

//         Optional<User> existingUser = userRepository.findByEmail(user.getEmail());

//         if (existingUser.isPresent()) {
//             throw new RuntimeException("Email already registered");
//         }

//         user.setPassword(passwordEncoder.encode(user.getPassword()));

//         // 🔥 MEMBER FLOW (OTP Required)
//         if (user.getRole() == Role.MEMBER) {

//             String otp = String.valueOf((int)(100000 + Math.random() * 900000));

//             user.setOtp(otp);
//             user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
//             user.setVerified(false);

//             userRepository.save(user);
//             emailService.sendOtp(user.getEmail(), otp);

//         }
//         // 🔥 ADMIN & LIBRARIAN FLOW (Needs Approval)
//         else {

//             user.setVerified(false);   // Not auto verified
//             user.setOtp(null);
//             user.setOtpExpiry(null);

//             userRepository.save(user);
//         }

//         return user;
//     }

//     // ✅ VERIFY OTP (Only for MEMBER)
//     public String verifyOtp(String email, String otp) {

//         User user = userRepository.findByEmail(email)
//                 .orElseThrow(() -> new RuntimeException("User not found"));

//         if (user.getRole() != Role.MEMBER) {
//             return "Only members require OTP verification";
//         }

//         if (user.getOtp() == null) {
//             return "No OTP generated";
//         }

//         if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
//             return "OTP expired";
//         }

//         if (!user.getOtp().equals(otp)) {
//             return "Invalid OTP";
//         }

//         user.setVerified(true);
//         user.setOtp(null);
//         user.setOtpExpiry(null);

//         userRepository.save(user);

//         return "Email verified successfully";
//     }

//     // ✅ LOGIN (Blocked if not verified)
//     // public User login(String email, String password) {

//     //     User user = userRepository.findByEmail(email)
//     //             .orElseThrow(() -> new RuntimeException("Invalid email"));

//     //     if (!passwordEncoder.matches(password, user.getPassword())) {
//     //         throw new RuntimeException("Invalid password");
//     //     }

//     //     if (!user.isVerified()) {

//     //         if (user.getRole() == Role.MEMBER) {
//     //             throw new RuntimeException("Please verify your email first");
//     //         } else {
//     //             throw new RuntimeException("Your account is pending admin approval");
//     //         }
//     //     }

//     //     return user;
//     // }
//     private boolean verified;   // for OTP
// private boolean approved;   // for Admin/Librarian approval
// public boolean isVerified() { return verified; }
// public boolean isApproved() { return approved; }
//    public User login(String email, String password) {

//     User user = userRepository.findByEmail(email)
//             .orElseThrow(() -> new RuntimeException("Invalid email"));

//     if (!passwordEncoder.matches(password, user.getPassword())) {
//         throw new RuntimeException("Invalid password");
//     }

//     // MEMBER must verify OTP
//     if (user.getRole() == Role.MEMBER && !user.isVerified()) {
//         throw new RuntimeException("Please verify your email first");
//     }

//     // ADMIN & LIBRARIAN must be approved
//     if ((user.getRole() == Role.ADMIN || user.getRole() == Role.LIBRARIAN)
//             && !user.isApproved()) {
//         throw new RuntimeException("Waiting for Super Admin approval");
//     }

//     return user;
// }
// // ✅ SUPER ADMIN APPROVES ADMIN / LIBRARIAN
// public String approveUser(String email) {

//     User user = userRepository.findByEmail(email)
//             .orElseThrow(() -> new RuntimeException("User not found"));

//     if (user.getRole() == Role.MEMBER) {
//         return "Members don't need approval";
//     }

//     if (user.isApproved()) {
//         return "User already approved";
//     }

//     user.setApproved(true);
//     userRepository.save(user);

//     // Send approval email
//     emailService.sendApprovalMail(user.getEmail(), user.getRole().name());

//     return "User approved successfully";
// }
    // ✅ ADMIN APPROVES USER
//     public String approveUser(String email) {

//     User user = userRepository.findByEmail(email)
//             .orElseThrow(() -> new RuntimeException("User not found"));

//     if (user.getRole() == Role.MEMBER) {
//         return "Members don't need approval";
//     }

//     if (user.isVerified()) {
//         return "User already approved";
//     }

//     user.setVerified(true);
//     userRepository.save(user);

//     // 🔥 Send approval email
//     emailService.sendApprovalMail(user.getEmail(), user.getRole().name());

//     return "User approved successfully";
// }
// }



package com.Spring.demo.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.Spring.demo.entity.Role;
import com.Spring.demo.entity.User;
import com.Spring.demo.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // ✅ REGISTER USER
   public User registerUser(User user) {

    // Check if email already exists
    Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
    if (existingUser.isPresent()) {
        throw new RuntimeException("Email already registered");
    }

    // Encrypt the password before saving
    user.setPassword(passwordEncoder.encode(user.getPassword()));

    // Generate OTP for ALL roles
    // Because we want to verify email is real for everyone
    String otp = String.valueOf((int)(100000 + Math.random() * 900000));
    user.setOtp(otp);
    user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
    user.setVerified(false);  // not verified yet — needs OTP

    if (user.getRole() == Role.MEMBER) {
        // Members are auto-approved, just need OTP
        user.setApproved(true);
    } else {
        // ADMIN & LIBRARIAN need OTP + Admin approval
        user.setApproved(false);
    }

    // Save to database
    userRepository.save(user);

    // Send OTP email to everyone
emailService.sendOtp(user.getEmail(), user.getName(), otp);

    return user;
}

    // ✅ VERIFY OTP (MEMBER ONLY)
    public String verifyOtp(String email, String otp) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        

        if (user.getOtp() == null) {
            return "No OTP generated";
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return "OTP expired";
        }

        if (!user.getOtp().equals(otp)) {
            return "Invalid OTP";
        }

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepository.save(user);

        return "Email verified successfully";
    }

    // ✅ LOGIN
    public User login(String email, String password) {

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Invalid email"));

    if (!passwordEncoder.matches(password, user.getPassword())) {
        throw new RuntimeException("Invalid password");
    }

    // MEMBER must verify OTP
    if (user.getRole() == Role.MEMBER && !user.isVerified()) {
        throw new RuntimeException("Please verify your email first");
    }

    // ADMIN & LIBRARIAN must be approved
    if ((user.getRole() == Role.ADMIN || user.getRole() == Role.LIBRARIAN)
            && !user.isApproved()) {
        throw new RuntimeException("Waiting for Super Admin approval");
    }

    return user;
}

    // ✅ SUPER ADMIN APPROVES ADMIN / LIBRARIAN
    public String approveUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.MEMBER) {
            return "Members don't need approval";
        }

        if (user.isApproved()) {
            return "User already approved";
        }

        user.setApproved(true);
        userRepository.save(user);

emailService.sendWelcome(user.getEmail(), user.getName());

        return "User approved successfully";
    }
    // ✅ GET ALL PENDING USERS (not approved)
public List<User> getPendingUsers() {
    return userRepository.findAll()
            .stream()
            .filter(u -> !u.isApproved() && u.getRole() != Role.MEMBER)
            .collect(java.util.stream.Collectors.toList());
}

// ✅ GET ALL USERS
public List<User> getAllUsers() {
    return userRepository.findAll();
}

}