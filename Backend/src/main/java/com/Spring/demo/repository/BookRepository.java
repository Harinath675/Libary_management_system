package com.Spring.demo.repository;

import com.Spring.demo.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Search by title or author
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.title)  LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Book> searchBooks(@Param("q") String q);

    // Filter by department (case-insensitive)
    List<Book> findByDepartmentIgnoreCase(String department);

    // Filter by department AND search keyword
    @Query("SELECT b FROM Book b WHERE " +
           "LOWER(b.department) = LOWER(:dept) AND (" +
           "LOWER(b.title)  LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%',:q,'%')))")
    List<Book> searchByDepartment(@Param("dept") String dept, @Param("q") String q);

    // All distinct departments — used to populate the filter dropdown on frontend
    @Query("SELECT DISTINCT b.department FROM Book b WHERE b.department IS NOT NULL ORDER BY b.department")
    List<String> findAllDepartments();
}
