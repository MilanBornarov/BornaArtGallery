package com.artgallery.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "artworks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artwork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title_mk")
    private String titleMk;

    @Column(name = "title_en")
    private String titleEn;

    @Column(name = "description_mk", columnDefinition = "TEXT")
    private String descriptionMk;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    private String category;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "cloudinary_public_id", length = 255)
    private String cloudinaryPublicId;

    @Column(name = "is_featured", nullable = false)
    private boolean featured;

    private Integer year;

    @Min(value = 0, message = "Width must be non-negative")
    private BigDecimal width;

    @Min(value = 0, message = "Height must be non-negative")
    private BigDecimal height;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null || this.status.isBlank()) {
            this.status = "AVAILABLE";
        }
    }

    @JsonProperty("title")
    public String getTitle() {
        return titleMk != null && !titleMk.isBlank() ? titleMk : titleEn;
    }

    @JsonProperty("description")
    public String getDescription() {
        return descriptionMk != null && !descriptionMk.isBlank() ? descriptionMk : descriptionEn;
    }
}
