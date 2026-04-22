package com.artgallery.controller;

import com.artgallery.dto.ArtworkDto;
import com.artgallery.dto.ArtworkStatusDto;
import com.artgallery.model.Artwork;
import com.artgallery.service.ArtworkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping({"/artworks", "/api/artworks"})
@RequiredArgsConstructor
public class ArtworkController {

    private final ArtworkService artworkService;

    @GetMapping
    public ResponseEntity<List<Artwork>> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(artworkService.search(search));
        }
        return ResponseEntity.ok(artworkService.getAll());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Artwork>> getFeatured() {
        return ResponseEntity.ok(artworkService.getFeatured());
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Artwork>> filter(
            @RequestParam(required = false) BigDecimal width,
            @RequestParam(required = false) BigDecimal height,
            @RequestParam(required = false) BigDecimal minWidth,
            @RequestParam(required = false) BigDecimal maxWidth,
            @RequestParam(required = false) BigDecimal minHeight,
            @RequestParam(required = false) BigDecimal maxHeight,
            @RequestParam(required = false) Boolean square,
            @RequestParam(required = false) String orientation
    ) {
        return ResponseEntity.ok(artworkService.filter(
                width,
                height,
                minWidth,
                maxWidth,
                minHeight,
                maxHeight,
                square,
                orientation
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Artwork> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(artworkService.getById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Artwork> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("data") String dataJson) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(artworkService.upload(file, dataJson));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Artwork> update(@PathVariable Long id, @RequestBody @Valid ArtworkDto dto) {
        return ResponseEntity.ok(artworkService.update(id, dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Artwork> replaceImage(@PathVariable Long id, @RequestPart("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(artworkService.replaceImage(id, file));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/featured")
    public ResponseEntity<Artwork> toggleFeatured(@PathVariable Long id) {
        return ResponseEntity.ok(artworkService.toggleFeatured(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Artwork> updateStatus(@PathVariable Long id, @RequestBody @Valid ArtworkStatusDto dto) {
        return ResponseEntity.ok(artworkService.updateStatus(id, dto.getStatus()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        artworkService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
