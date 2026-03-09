// // src/main/java/com/Spring/demo/service/BookService.java
// package com.Spring.demo.service;

// import java.util.List;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import com.Spring.demo.entity.Book;
// import com.Spring.demo.repository.BookRepository;

// @Service
// public class BookService {

//     @Autowired
//     private BookRepository bookRepository;

//     // ✅ ADD A NEW BOOK
//     public Book addBook(Book book) {

//         // Prevent duplicate ISBNs (if ISBN is provided)
//         if (book.getIsbn() != null && !book.getIsbn().isBlank()) {
//             bookRepository.findByIsbn(book.getIsbn()).ifPresent(existing -> {
//                 throw new RuntimeException("A book with this ISBN already exists");
//             });
//         }

//         // availableCopies starts equal to totalCopies when first added
//         book.setAvailableCopies(book.getTotalCopies());

//         return bookRepository.save(book);
//     }

//     // ✅ GET ALL BOOKS
//     public List<Book> getAllBooks() {
//         return bookRepository.findAll();
//     }

//     // ✅ GET SINGLE BOOK BY ID
//     public Book getBookById(Long id) {
//         return bookRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Book not found"));
//     }

//     // ✅ UPDATE A BOOK
//     public Book updateBook(Long id, Book updatedData) {
//         Book book = getBookById(id); // reuse above — throws if not found

//         book.setTitle(updatedData.getTitle());
//         book.setAuthor(updatedData.getAuthor());
//         book.setGenre(updatedData.getGenre());
//         book.setIsbn(updatedData.getIsbn());
//         book.setTotalCopies(updatedData.getTotalCopies());

//         // Important: don't blindly overwrite availableCopies
//         // Recalculate: available = total - (total - available before edit)
//         // i.e. preserve how many are currently borrowed
//         int currentlyBorrowed = book.getTotalCopies() - book.getAvailableCopies();
//         int newAvailable = updatedData.getTotalCopies() - currentlyBorrowed;
//         book.setAvailableCopies(Math.max(0, newAvailable)); // never go negative

//         return bookRepository.save(book);
//     }

//     // ✅ DELETE A BOOK
//     public String deleteBook(Long id) {
//         if (!bookRepository.existsById(id)) {
//             throw new RuntimeException("Book not found");
//         }
//         bookRepository.deleteById(id);
//         return "Book deleted successfully";
//     }

//     // ✅ SEARCH BOOKS
//     public List<Book> searchBooks(String query) {
//         // Search by title OR author — combine both result lists
//         List<Book> byTitle = bookRepository.findByTitleContainingIgnoreCase(query);
//         List<Book> byAuthor = bookRepository.findByAuthorContainingIgnoreCase(query);

//         // Merge without duplicates
//         byAuthor.forEach(b -> {
//             if (byTitle.stream().noneMatch(t -> t.getId().equals(b.getId()))) {
//                 byTitle.add(b);
//             }
//         });

//         return byTitle;
//     }
// }