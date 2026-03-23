package com.Spring.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // ← ADD THIS

public class LibreryApplication {

	public static void main(String[] args) {
		SpringApplication.run(LibreryApplication.class, args);
	}

}
