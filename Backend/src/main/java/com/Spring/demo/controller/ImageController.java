package com.Spring.demo.controller;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

// Separate controller just for serving images
// URL: GET /images/covers/{filename}
// Completely avoids conflict with /api/books/{id}
@RestController
@CrossOrigin(origins = "*")
public class ImageController {

    @Value("${app.upload.dir:uploads/books}")
    private String uploadDir;

    @GetMapping("/images/covers/{filename:.+}")
    public ResponseEntity<Resource> serveCover(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, "covers", filename)
                                 .toAbsolutePath()
                                 .normalize();

            System.out.println("📂 Looking for: " + filePath);
            System.out.println("📂 Exists: " + Files.exists(filePath));

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable())
                return ResponseEntity.notFound().build();

            String contentType = "image/jpeg";
            if (filename.toLowerCase().endsWith(".png"))  contentType = "image/png";
            if (filename.toLowerCase().endsWith(".webp")) contentType = "image/webp";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}