package com.artgallery.repository;

import com.artgallery.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    boolean existsByUserIdAndArtworkId(Long userId, Long artworkId);

    @Transactional
    void deleteByUserIdAndArtworkId(Long userId, Long artworkId);

    @Transactional
    void deleteByArtworkId(Long artworkId);
}
