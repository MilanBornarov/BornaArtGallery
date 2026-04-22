package com.artgallery.repository;

import com.artgallery.model.Artwork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, Long>, JpaSpecificationExecutor<Artwork> {
    List<Artwork> findByFeaturedTrue();

    @Query("""
        select a from Artwork a
        where lower(coalesce(a.titleMk, '')) like lower(concat('%', :query, '%'))
           or lower(coalesce(a.titleEn, '')) like lower(concat('%', :query, '%'))
           or lower(coalesce(a.category, '')) like lower(concat('%', :query, '%'))
        """)
    List<Artwork> searchByLocalizedTitleOrCategory(@Param("query") String query);
}
