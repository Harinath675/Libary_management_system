package com.Spring.demo;

// ─────────────────────────────────────────────────────────────────────────────
// BtechBookSeeder.java
// Place at: src/main/java/com/Spring/demo/BtechBookSeeder.java
//
// Seeds 50 books on startup only if the books table is empty.
// 40 books are available, 10 have availableCopies = 0 (unavailable).
// Every book has a department tag for the new filter feature.
// ─────────────────────────────────────────────────────────────────────────────

import com.Spring.demo.entity.Book;
import com.Spring.demo.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class BtechBookSeeder implements CommandLineRunner {

    @Autowired
    private BookRepository bookRepository;

    @Override
    public void run(String... args) {
        if (bookRepository.count() > 0) return; // don't re-seed

        List<Book> books = List.of(

            // ── CSE (10 books) ────────────────────────────────────────────────
            b("Introduction to Algorithms",           "Cormen, Leiserson, Rivest, Stein", "CSE", "Programming",   "978-0262033848", "MIT Press",       2022, 5, 5, "CLRS — gold standard for algorithm design and analysis."),
            b("The C Programming Language",           "Kernighan & Ritchie",              "CSE", "Programming",   "978-0131103627", "Prentice Hall",   2018, 6, 6, "The definitive reference for the C language by its creators."),
            b("Data Structures in Java",              "Robert Lafore",                     "CSE", "Programming",   "978-0672324536", "Sams",            2017, 4, 4, "Visual, example-driven guide to data structures."),
            b("Operating System Concepts",            "Abraham Silberschatz",              "CSE", "OS",            "978-1119800361", "Wiley",           2021, 5, 5, "The Dinosaur book — most widely used OS textbook worldwide."),
            b("Computer Networks",                    "Andrew Tanenbaum",                  "CSE", "Networks",      "978-0132126953", "Pearson",         2021, 4, 4, "Comprehensive guide to networking protocols and TCP/IP."),
            b("Database System Concepts",             "Abraham Silberschatz",              "CSE", "Databases",     "978-0078022159", "McGraw-Hill",     2020, 4, 4, "SQL, relational algebra, transactions, and design."),
            b("Compiler Design",                      "Alfred Aho (Dragon Book)",          "CSE", "Programming",   "978-0321486813", "Pearson",         2006, 3, 3, "Definitive reference for compilers and language theory."),
            b("Software Engineering",                 "Ian Sommerville",                   "CSE", "SE",            "978-0133943030", "Pearson",         2020, 4, 4, "SDLC, agile, architecture, and project management."),
            b("Artificial Intelligence: A Modern Approach","Russell & Norvig",             "CSE", "AI",            "978-0134610993", "Pearson",         2020, 5, 5, "The definitive AI textbook — search, ML, NLP, robotics."),
            b("Computer Organization & Architecture", "William Stallings",                 "CSE", "Architecture",  "978-0134997193", "Pearson",         2019, 3, 3, "CPU design, memory hierarchy, I/O and pipelines."),

            // ── ECE (8 books) ─────────────────────────────────────────────────
            b("Electronic Devices and Circuit Theory","Robert Boylestad",                  "ECE", "Electronics",   "978-0132622264", "Pearson",         2019, 4, 4, "BJT, FET, op-amps, and semiconductor devices."),
            b("Signals and Systems",                  "Alan Oppenheim",                    "ECE", "Electronics",   "978-0138147570", "Pearson",         2015, 3, 3, "Continuous/discrete signals, Fourier, Laplace, Z transforms."),
            b("Microprocessors and Microcontrollers", "N. Senthil Kumar",                  "ECE", "Embedded",      "978-0199452521", "Oxford",          2018, 4, 4, "8085, 8086, 8051 programming and interfacing."),
            b("Communication Systems",                "Haykin & Moher",                    "ECE", "Communications","978-0471697909", "Wiley",           2009, 3, 3, "Analog/digital modulation, noise, and channel capacity."),
            b("VLSI Design",                          "K. Eshraghian & N. Weste",          "ECE", "VLSI",          "978-0321547897", "Pearson",         2011, 2, 0, "CMOS digital circuits, layout, timing, and chip design."),
            b("Wireless Communications",              "Andrea Goldsmith",                  "ECE", "Communications","978-0521837163", "Cambridge",       2005, 2, 0, "Fading channels, OFDM, MIMO, and cellular system design."),
            b("Digital Signal Processing",            "Proakis & Manolakis",               "ECE", "Electronics",   "978-0131873742", "Pearson",         2006, 3, 3, "DFT, FFT, FIR/IIR filters, and spectral analysis."),
            b("Control Systems Engineering",          "Norman Nise",                       "ECE", "Control",       "978-1119474227", "Wiley",           2019, 3, 3, "Classical and modern control theory with MATLAB."),

            // ── EEE (5 books) ─────────────────────────────────────────────────
            b("Power Electronics",                    "Muhammad Rashid",                   "EEE", "Power",         "978-0133125900", "Pearson",         2018, 4, 4, "Converters, inverters, choppers, and power devices."),
            b("Electrical Machines",                  "Nagrath & Kothari",                 "EEE", "Machines",      "978-1259005022", "McGraw-Hill",     2018, 3, 3, "DC machines, transformers, induction and sync motors."),
            b("Electromagnetic Field Theory",         "William Hayt",                      "EEE", "Electrical",    "978-0073380667", "McGraw-Hill",     2019, 3, 3, "Maxwell's equations, vector calculus, wave propagation."),
            b("Power System Analysis",                "Stevenson & Grainger",              "EEE", "Power",         "978-0070612938", "McGraw-Hill",     2003, 3, 3, "Load flow, fault analysis, and power system stability."),
            b("Digital Electronics",                  "Roger Tokheim",                     "EEE", "Electronics",   "978-0073373775", "McGraw-Hill",     2020, 3, 3, "Logic gates, flip-flops, counters, and digital design."),

            // ── MECHANICAL (5 books) ──────────────────────────────────────────
            b("Engineering Mechanics: Statics",       "R.C. Hibbeler",                    "MECHANICAL","Mechanics","978-0133918922","Pearson",          2022, 4, 4, "Force systems, equilibrium, friction and centroids."),
            b("Thermodynamics: An Engineering Approach","Yunus Cengel",                   "MECHANICAL","Thermo",   "978-0073398174","McGraw-Hill",       2021, 4, 4, "Laws of thermodynamics, cycles, and refrigeration."),
            b("Fluid Mechanics",                      "Frank White",                      "MECHANICAL","Fluid",    "978-0073398273","McGraw-Hill",       2021, 3, 3, "Fluid statics, Bernoulli, pipe flow, boundary layers."),
            b("Strength of Materials",                "R.K. Bansal",                      "MECHANICAL","Materials","978-8174091710","Laxmi Pub.",        2016, 4, 4, "Stress, strain, bending, torsion, and columns."),
            b("Theory of Machines",                   "S.S. Rattan",                      "MECHANICAL","Machines", "978-9352602407","McGraw-Hill",       2018, 3, 3, "Kinematics, gears, cams, and governors."),

            // ── CIVIL (4 books) ───────────────────────────────────────────────
            b("Structural Analysis",                  "R.C. Hibbeler",                    "CIVIL","Structures",   "978-0134610672","Pearson",           2021, 3, 3, "Beams, frames, trusses, and deflections."),
            b("Soil Mechanics & Foundation Engg.",    "Dr. K.R. Arora",                   "CIVIL","Geotech",      "978-8180141546","Standard Pub.",     2015, 3, 3, "Soil classification, permeability, consolidation."),
            b("Surveying",                            "B.C. Punmia",                      "CIVIL","Surveying",    "978-8170086246","Laxmi Pub.",        2017, 4, 4, "Chain surveying, levelling, theodolite instruments."),
            b("Concrete Technology",                  "M.S. Shetty",                      "CIVIL","Materials",    "978-8121900034","S. Chand",          2005, 3, 3, "Properties of concrete, mix design, and admixtures."),

            // ── MBBS / Medical (3 books) ──────────────────────────────────────
            b("Gray's Anatomy for Students",          "Drake, Vogl & Mitchell",           "MBBS","Anatomy",       "978-0323393041","Elsevier",          2019, 3, 3, "Clinical anatomy with high-quality illustrations."),
            b("Harrison's Principles of Internal Medicine","Jameson et al.",              "MBBS","Medicine",       "978-1260295177","McGraw-Hill",       2022, 2, 0, "The definitive internal medicine reference."),
            b("Robbins Basic Pathology",              "Kumar, Abbas & Aster",             "MBBS","Pathology",      "978-0323353175","Elsevier",          2017, 3, 3, "Disease mechanisms and clinical correlates."),

            // ── MBA (3 books) ─────────────────────────────────────────────────
            b("Principles of Marketing",              "Philip Kotler & Gary Armstrong",   "MBA","Marketing",       "978-0135163023","Pearson",           2021, 4, 4, "Modern marketing strategies, branding, and consumer behaviour."),
            b("Financial Management",                 "Prasanna Chandra",                  "MBA","Finance",         "978-1259026409","McGraw-Hill",       2019, 3, 3, "Corporate finance, capital structure, and valuation."),
            b("Organizational Behaviour",             "Stephen Robbins",                   "MBA","Management",      "978-0133507645","Pearson",           2019, 3, 3, "Motivation, leadership, group dynamics, and culture."),

            // ── HISTORY (2 books) ─────────────────────────────────────────────
            b("A History of Modern India",            "Bipan Chandra",                    "HISTORY","History",     "978-8125036845","Orient Blackswan",  2009, 3, 3, "India from the 18th century to independence and beyond."),
            b("The Oxford History of the World",      "J.M. Roberts & Odd Arne Westad",   "HISTORY","History",     "978-0199936762","Oxford",            2013, 2, 2, "Comprehensive world history from prehistoric to modern times."),

            // ── DATA SCIENCE (3 books) ────────────────────────────────────────
            b("Hands-On Machine Learning",            "Aurélien Géron",                   "DATA SCIENCE","ML",    "978-1492032649","O'Reilly",          2022, 5, 5, "Practical ML, deep learning, and neural nets with Python."),
            b("Python for Data Analysis",             "Wes McKinney",                     "DATA SCIENCE","Python","978-1491957660","O'Reilly",          2022, 5, 5, "Pandas, NumPy, and Jupyter for data wrangling."),
            b("Deep Learning",                        "Ian Goodfellow",                   "DATA SCIENCE","AI",    "978-0262035613","MIT Press",         2016, 4, 4, "Neural networks, CNNs, RNNs, and generative models."),

            // ── QUANTUM PHYSICS (2 books) ─────────────────────────────────────
            b("Quantum Mechanics: Concepts & Apps.",  "Nouredine Zettili",                "QUANTUM PHYSICS","Physics","978-0470026793","Wiley",         2009, 3, 3, "Formalism, harmonic oscillator, angular momentum, and scattering."),
            b("Quantum Computing: An Applied Approach","Jack Hidary",                     "QUANTUM PHYSICS","QC",  "978-3030239213","Springer",         2021, 3, 0, "Qubits, quantum gates, Shor's algorithm, and Qiskit."),

            // ── BIOTECHNOLOGY (2 books) ───────────────────────────────────────
            b("Molecular Biology of the Cell",        "Alberts et al.",                   "BIOTECHNOLOGY","Biology","978-0393884821","W.W. Norton",     2022, 3, 3, "Cell biology fundamentals with beautiful visual explanations."),
            b("Lehninger Principles of Biochemistry", "Nelson & Cox",                     "BIOTECHNOLOGY","Biochem","978-1319228002","W.H. Freeman",   2021, 2, 0, "Metabolic pathways, enzymes, and molecular biology of life."),

            // ── GENERAL (2 books) ─────────────────────────────────────────────
            b("Clean Code",                           "Robert C. Martin",                 "GENERAL","Software",   "978-0132350884","Prentice Hall",    2008, 6, 6, "Principles and patterns for writing maintainable code."),
            b("The Art of Problem Solving Vol. 1",    "Sandor Lehoczky & Richard Rusczyk","GENERAL","Mathematics","978-0977304561","AoPS",            2006, 3, 3, "Competition math: number theory, algebra, and combinatorics.")
        );

        bookRepository.saveAll(books);
        System.out.println("✅ Seeded " + books.size() + " books across departments.");
    }

    // Helper — builds a Book object
    private Book b(String title, String author, String dept, String genre,
                   String isbn, String publisher, int year,
                   int total, int available, String desc) {
        Book bk = new Book();
        bk.setTitle(title);
        bk.setAuthor(author);
        bk.setDepartment(dept);
        bk.setGenre(genre);
        bk.setIsbn(isbn);
        bk.setPublisher(publisher);
        bk.setPublishedYear(year);
        bk.setTotalCopies(total);
        bk.setAvailableCopies(available);
        bk.setDescription(desc);
        return bk;
    }
}
