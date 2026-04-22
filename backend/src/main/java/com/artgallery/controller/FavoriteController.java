package com.artgallery.controller;

import com.artgallery.dto.FavoriteRequest;
import com.artgallery.model.Favorite;
import com.artgallery.service.FavoriteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<Favorite>> getMyFavorites(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getForUser(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@RequestBody @Valid FavoriteRequest body, Authentication authentication) {
        return ResponseEntity.ok(favoriteService.add(authentication.getName(), body.getArtworkId()));
    }

    @DeleteMapping("/{artworkId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long artworkId, Authentication authentication) {
        favoriteService.remove(authentication.getName(), artworkId);
        return ResponseEntity.noContent().build();
    }
}
