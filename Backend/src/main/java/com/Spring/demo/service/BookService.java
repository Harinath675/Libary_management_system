package com.Spring.demo.service;

import com.Spring.demo.entity.Book;
import com.Spring.demo.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // Get all books
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // Get book by ID
    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    // Add new book
    public Book addBook(Book book) {
        return bookRepository.save(book);
    }

    // Update book
    public Book updateBook(Long id, Book updatedBook) {
        return bookRepository.findById(id).map(book -> {
            book.setTitle(updatedBook.getTitle());
            book.setAuthor(updatedBook.getAuthor());
            book.setIsbn(updatedBook.getIsbn());
            book.setGenre(updatedBook.getGenre());
            book.setDepartment(updatedBook.getDepartment());
            book.setPublisher(updatedBook.getPublisher());
            book.setPublishedYear(updatedBook.getPublishedYear());
            book.setDescription(updatedBook.getDescription());
            book.setTotalCopies(updatedBook.getTotalCopies());
            book.setAvailableCopies(updatedBook.getAvailableCopies());
            if (updatedBook.getCoverImageUrl() != null
                    && !updatedBook.getCoverImageUrl().isBlank()) {
                book.setCoverImageUrl(updatedBook.getCoverImageUrl());
            }
            return bookRepository.save(book);
        }).orElseThrow(() -> new RuntimeException("Book not found"));
    }

    // Delete book
    public String deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Book not found");
        }
        bookRepository.deleteById(id);
        return "Book deleted successfully";
    }

    // Search by title or author
    public List<Book> searchBooks(String query) {
        return bookRepository.searchBooks(query);
    }

    // Filter by department
    public List<Book> getBooksByDepartment(String department) {
        return bookRepository.findByDepartmentIgnoreCase(department);
    }

    // Search within a department
    public List<Book> searchByDepartment(String department, String query) {
        return bookRepository.searchByDepartment(department, query);
    }

    // Get all distinct departments
    public List<String> getAllDepartments() {
        return bookRepository.findAllDepartments();
    }
}
