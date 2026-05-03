package com.artgallery.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtworkDto {
    @Size(max = 150, message = "Title is too long")
    private String title;
    @Size(max = 150, message = "Title is too long")
    private String titleMk;
    @Size(max = 150, message = "Title is too long")
    private String titleEn;
    @Size(max = 5000, message = "Description is too long")
    private String description;
    @Size(max = 5000, message = "Description is too long")
    private String descriptionMk;
    @Size(max = 5000, message = "Description is too long")
    private String descriptionEn;
    @Size(max = 100, message = "Category is too long")
    private String category;
    @Min(value = 1, message = "Year must be positive")
    @Max(value = 3000, message = "Year is invalid")
    private Integer year;
    @Min(value = 0, message = "Width must be non-negative")
    private BigDecimal width;
    @Min(value = 0, message = "Height must be non-negative")
    private BigDecimal height;
    private boolean featured;
    @Pattern(regexp = "AVAILABLE|SOLD", message = "Status must be AVAILABLE or SOLD")
    @Builder.Default
    private String status = "AVAILABLE";
}
