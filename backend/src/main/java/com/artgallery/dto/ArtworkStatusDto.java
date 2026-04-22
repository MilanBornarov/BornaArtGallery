package com.artgallery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ArtworkStatusDto {
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "AVAILABLE|SOLD", message = "Status must be AVAILABLE or SOLD")
    private String status;
}
