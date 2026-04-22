package com.artgallery.service;

import com.artgallery.model.Artwork;
import com.artgallery.model.Favorite;
import com.artgallery.model.User;
import com.artgallery.repository.ArtworkRepository;
import com.artgallery.repository.FavoriteRepository;
import com.artgallery.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;

    public List<Favorite> getForUser(String email) {
        User user = getUser(email);
        return favoriteRepository.findByUserId(user.getId());
    }

    public Favorite add(String email, Long artworkId) {
        User user = getUser(email);
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artwork not found"));

        if (favoriteRepository.existsByUserIdAndArtworkId(user.getId(), artworkId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Artwork is already in favorites");
        }

        Favorite favorite = Favorite.builder().user(user).artwork(artwork).build();
        return favoriteRepository.save(favorite);
    }

    public void remove(String email, Long artworkId) {
        User user = getUser(email);
        favoriteRepository.deleteByUserIdAndArtworkId(user.getId(), artworkId);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
