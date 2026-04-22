package com.artgallery.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class FavoriteRequest {
    @NotNull(message = "Artwork id is required")
    @Positive(message = "Artwork id must be positive")
    private Long artworkId;
}
