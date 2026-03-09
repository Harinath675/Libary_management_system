/*package com.Spring.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}
// */

// 2222222222222
// package com.Spring.demo.entity;

// import java.time.LocalDateTime;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.EnumType;
// import jakarta.persistence.Enumerated;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.Table;
// import lombok.Getter;
// import lombok.Setter;

// @Entity
// @Table(name = "users")
// @Getter
// @Setter
// public class User {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     private String name;

//     @Column(unique = true)
//     private String email;

//     private String password;

//     @Enumerated(EnumType.STRING)
//     private Role role;

//     private boolean verified;

//     private boolean approved;

//     private String otp;

//     private LocalDateTime otpExpiry;
// }


// package com.Spring.demo.entity;

// import java.time.LocalDateTime;

// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.EnumType;
// import jakarta.persistence.Enumerated;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.Table;

// @Entity
// @Table(name = "users")
// public class User {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     private String name;

//     @Column(unique = true)
//     private String email;

//     private String password;

//     @Enumerated(EnumType.STRING)
//     private Role role;

//     private boolean verified;   // OTP verification
//     private boolean approved;   // Admin approval

//     private String otp;
//     private LocalDateTime otpExpiry;

//     // ====== GETTERS & SETTERS ======

//     public boolean isVerified() {
//         return verified;
//     }

//     public void setVerified(boolean verified) {
//         this.verified = verified;
//     }

//     public boolean isApproved() {
//         return approved;
//     }

//     public void setApproved(boolean approved) {
//         this.approved = approved;
//     }

//     // Generate other getters/setters for name, email, password, etc.
// }

package com.Spring.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "verified", nullable = false)
    private boolean verified = false;

    @Column(name = "approved", nullable = false)
    private boolean approved = false;

    private String otp;

    private LocalDateTime otpExpiry;
}
