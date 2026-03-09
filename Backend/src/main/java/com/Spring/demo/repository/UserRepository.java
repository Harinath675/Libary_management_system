// package com.Spring.demo.repository;

// import java.util.Optional;

// import org.springframework.data.jpa.repository.JpaRepository;

// import com.Spring.demo.entity.User;

// public interface UserRepository extends JpaRepository<User, Long> {

//     Optional<User> findByEmail(String email);
// }
// package com.Spring.demo.repository;

// import java.util.List;
// import java.util.Optional;

// import org.springframework.data.jpa.repository.JpaRepository;

// import com.Spring.demo.entity.User;

// public interface UserRepository extends JpaRepository<User, Long> {

//     Optional<User> findByEmail(String email);

//     // 🔥 Add this
//    List<User> findByIsVerifiedFalse();
// }

package com.Spring.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Spring.demo.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // ✅ Changed from findByIsVerifiedFalse → findByVerifiedFalse
    List<User> findByVerifiedFalse();
}