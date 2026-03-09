// package com.Spring.demo.config;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.stereotype.Component;

// import com.Spring.demo.entity.Role;
// import com.Spring.demo.entity.User;
// import com.Spring.demo.repository.UserRepository;

// @Component
// public class DataLoader implements CommandLineRunner {

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @Override

// public void run(String... args) {

//     if (userRepository.findByEmail("superadmin@library.com").isEmpty()) {

//         User admin = new User();
//         admin.setName("B.Harinath");
//         admin.setEmail("superadmin@library.com");
//         admin.setPassword(passwordEncoder.encode("Admin@123"));
//         admin.setRole(Role.ADMIN);
//         admin.setVerified(true);
//         admin.setApproved(true);  // ← Make sure this is here!

//         userRepository.save(admin);
//         System.out.println("Default Super Admin Created");
//     }
// }
// }


package com.Spring.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.Spring.demo.entity.Role;
import com.Spring.demo.entity.User;
import com.Spring.demo.repository.UserRepository;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // Delete and recreate superadmin every time to ensure correct values
        userRepository.findByEmail("superadmin@library.com")
                .ifPresent(u -> userRepository.delete(u));

        User admin = new User();
        admin.setName("B.Harinath");
        admin.setEmail("superadmin@library.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        admin.setVerified(true);
        admin.setApproved(true);
        admin.setOtp(null);
        admin.setOtpExpiry(null);

        userRepository.save(admin);
        System.out.println("✅ Super Admin Created: superadmin@library.com / Admin@123");
    }
}