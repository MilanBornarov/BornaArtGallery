package com.artgallery.service;

import com.artgallery.config.AppProperties;
import com.artgallery.dto.ArtworkDto;
import com.artgallery.model.Artwork;
import com.artgallery.repository.ArtworkRepository;
import com.artgallery.repository.FavoriteRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ArtworkService {

    private static final Set<String> ALLOWED_CATEGORIES = Set.of(
            "Landscapes",
            "Abstract",
            "Floral",
            "Animals",
            "Figurative",
            "Boats",
            "Frames"
    );

    private final ArtworkRepository artworkRepository;
    private final FavoriteRepository favoriteRepository;
    private final ObjectMapper objectMapper;
    private final CloudinaryService cloudinaryService;
    private final TranslationService translationService;
    private final AppProperties appProperties;

    public List<Artwork> getAll() {
        return artworkRepository.findAll().stream()
                .sorted(Comparator.comparing(Artwork::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<Artwork> getFeatured() {
        return artworkRepository.findByFeaturedTrue().stream()
                .sorted(Comparator.comparing(Artwork::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Artwork getById(Long id) {
        return artworkRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Artwork not found"));
    }

    public List<Artwork> search(String query) {
        String normalized = query == null ? null : query.trim();
        if (normalized == null || normalized.isBlank()) {
            return getAll();
        }
        if (normalized.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search query is too long");
        }

        return artworkRepository.searchByLocalizedTitleOrCategory(normalized).stream()
                .sorted(Comparator.comparing(Artwork::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<Artwork> filter(
            BigDecimal width,
            BigDecimal height,
            BigDecimal minWidth,
            BigDecimal maxWidth,
            BigDecimal minHeight,
            BigDecimal maxHeight,
            Boolean square,
            String orientation
    ) {
        validateDimensions(width, height, minWidth, maxWidth, minHeight, maxHeight, orientation);

        Specification<Artwork> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();

            if (width != null) {
                predicates.add(criteriaBuilder.equal(root.get("width"), width));
            }
            if (height != null) {
                predicates.add(criteriaBuilder.equal(root.get("height"), height));
            }
            if (minWidth != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("width"), minWidth));
            }
            if (maxWidth != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("width"), maxWidth));
            }
            if (minHeight != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("height"), minHeight));
            }
            if (maxHeight != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("height"), maxHeight));
            }
            if (Boolean.TRUE.equals(square)) {
                predicates.add(criteriaBuilder.equal(root.get("width"), root.get("height")));
            }
            if (orientation != null && !orientation.isBlank()) {
                String normalizedOrientation = orientation.trim().toLowerCase(Locale.ROOT);
                if ("portrait".equals(normalizedOrientation)) {
                    predicates.add(criteriaBuilder.greaterThan(root.get("height"), root.get("width")));
                } else if ("landscape".equals(normalizedOrientation)) {
                    predicates.add(criteriaBuilder.greaterThan(root.get("width"), root.get("height")));
                }
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };

        return artworkRepository.findAll(specification).stream()
                .sorted(Comparator.comparing(Artwork::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public Artwork upload(MultipartFile file, String dataJson) throws IOException {
        ArtworkDto dto = parseArtworkDto(dataJson);
        NormalizedArtwork normalized = normalizeAndValidate(dto);
        CloudinaryService.UploadResult upload = cloudinaryService.uploadArtworkImage(file);

        Artwork artwork = Artwork.builder()
                .titleMk(normalized.titleMk())
                .titleEn(normalized.titleEn())
                .descriptionMk(normalized.descriptionMk())
                .descriptionEn(normalized.descriptionEn())
                .category(normalized.category())
                .year(dto.getYear())
                .width(dto.getWidth())
                .height(dto.getHeight())
                .featured(dto.isFeatured())
                .status(normalized.status())
                .facebookLink(appProperties.getContact().getFacebookLink())
                .imageUrl(upload.imageUrl())
                .cloudinaryPublicId(upload.publicId())
                .build();

        return artworkRepository.save(artwork);
    }

    public Artwork update(Long id, ArtworkDto dto) {
        NormalizedArtwork normalized = normalizeAndValidate(dto);

        Artwork artwork = getById(id);
        artwork.setTitleMk(normalized.titleMk());
        artwork.setTitleEn(normalized.titleEn());
        artwork.setDescriptionMk(normalized.descriptionMk());
        artwork.setDescriptionEn(normalized.descriptionEn());
        artwork.setCategory(normalized.category());
        artwork.setYear(dto.getYear());
        artwork.setWidth(dto.getWidth());
        artwork.setHeight(dto.getHeight());
        artwork.setFeatured(dto.isFeatured());
        artwork.setStatus(normalized.status());
        artwork.setFacebookLink(appProperties.getContact().getFacebookLink());

        return artworkRepository.save(artwork);
    }

    public Artwork replaceImage(Long id, MultipartFile file) throws IOException {
        Artwork artwork = getById(id);

        if (artwork.getCloudinaryPublicId() != null && !artwork.getCloudinaryPublicId().isBlank()) {
            cloudinaryService.deleteImage(artwork.getCloudinaryPublicId());
        }

        CloudinaryService.UploadResult upload = cloudinaryService.uploadArtworkImage(file);
        artwork.setImageUrl(upload.imageUrl());
        artwork.setCloudinaryPublicId(upload.publicId());

        return artworkRepository.save(artwork);
    }

    public Artwork toggleFeatured(Long id) {
        Artwork artwork = getById(id);
        artwork.setFeatured(!artwork.isFeatured());
        return artworkRepository.save(artwork);
    }

    public Artwork updateStatus(Long id, String status) {
        String normalizedStatus = normalizeStatus(status);
        Artwork artwork = getById(id);
        artwork.setStatus(normalizedStatus);
        return artworkRepository.save(artwork);
    }

    @Transactional
    public void delete(Long id) throws IOException {
        Artwork artwork = getById(id);

        favoriteRepository.deleteByArtworkId(id);

        if (artwork.getCloudinaryPublicId() != null && !artwork.getCloudinaryPublicId().isBlank()) {
            cloudinaryService.deleteImage(artwork.getCloudinaryPublicId());
        }

        artworkRepository.delete(artwork);
    }

    private ArtworkDto parseArtworkDto(String dataJson) {
        try {
            return objectMapper.readValue(dataJson, ArtworkDto.class);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Artwork payload is invalid");
        }
    }

    private NormalizedArtwork normalizeAndValidate(ArtworkDto dto) {
        validateArtworkDimensions(dto.getWidth(), dto.getHeight());

        String mkTitle = normalizeLocalizedText(dto.getTitleMk(), dto.getTitle(), 150, true, "title");
        String mkDescription = normalizeLocalizedText(dto.getDescriptionMk(), dto.getDescription(), 5000, false, "description");
        String enTitle = normalizeEnglishText(dto.getTitleEn(), mkTitle, "title", 150);
        String enDescription = normalizeEnglishText(dto.getDescriptionEn(), mkDescription, "description", 5000);
        String category = normalizeCategory(dto.getCategory());
        String status = normalizeStatus(dto.getStatus());

        return new NormalizedArtwork(mkTitle, enTitle, mkDescription, enDescription, category, status);
    }

    private void validateArtworkDimensions(BigDecimal width, BigDecimal height) {
        if (width == null || height == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Width and height are required");
        }
        if (width.compareTo(BigDecimal.ZERO) < 0 || height.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Width and height must be non-negative");
        }
        if (width.compareTo(new BigDecimal("1000")) > 0 || height.compareTo(new BigDecimal("1000")) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dimensions are too large");
        }
    }

    private void validateDimensions(
            BigDecimal width,
            BigDecimal height,
            BigDecimal minWidth,
            BigDecimal maxWidth,
            BigDecimal minHeight,
            BigDecimal maxHeight,
            String orientation
    ) {
        validateNonNegative("Width", width);
        validateNonNegative("Height", height);
        validateNonNegative("Minimum width", minWidth);
        validateNonNegative("Maximum width", maxWidth);
        validateNonNegative("Minimum height", minHeight);
        validateNonNegative("Maximum height", maxHeight);

        if ((width == null) != (height == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Width and height must be provided together");
        }
        if (minWidth != null && maxWidth != null && minWidth.compareTo(maxWidth) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum width cannot be greater than maximum width");
        }
        if (minHeight != null && maxHeight != null && minHeight.compareTo(maxHeight) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Minimum height cannot be greater than maximum height");
        }
        if (orientation != null && !orientation.isBlank()) {
            String normalized = orientation.trim().toLowerCase(Locale.ROOT);
            if (!"portrait".equals(normalized) && !"landscape".equals(normalized)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Orientation must be portrait or landscape");
            }
        }
    }

    private void validateNonNegative(String label, BigDecimal value) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " must be non-negative");
        }
    }

    private String normalizeLocalizedText(String preferred, String fallback, int maxLength, boolean required, String fieldLabel) {
        String candidate = preferred != null && !preferred.isBlank() ? preferred : fallback;
        if (candidate == null || candidate.isBlank()) {
            if (required) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, capitalize(fieldLabel) + " is required");
            }
            return null;
        }

        String normalized = candidate.trim();
        if (normalized.length() > maxLength) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, capitalize(fieldLabel) + " is too long");
        }
        ensureNoMarkup(fieldLabel, normalized);
        return normalized;
    }

    private String normalizeEnglishText(String providedEnglish, String macedonianText, String fieldLabel, int maxLength) {
        String candidate = providedEnglish;
        if (candidate == null || candidate.isBlank()) {
            if (macedonianText == null || macedonianText.isBlank()) {
                return null;
            }
            candidate = translationService.translateMacedonianToEnglish(macedonianText, fieldLabel);
        }

        String normalized = candidate.trim();
        if (normalized.length() > maxLength) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, capitalize(fieldLabel) + " is too long");
        }
        ensureNoMarkup(fieldLabel, normalized);
        return normalized;
    }

    private String normalizeCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }

        String normalized = category.trim();
        ensureNoMarkup("category", normalized);
        if (!ALLOWED_CATEGORIES.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is invalid");
        }
        return normalized;
    }

    private String normalizeStatus(String status) {
        String normalized = status == null ? "AVAILABLE" : status.trim().toUpperCase(Locale.ROOT);
        if (!"AVAILABLE".equals(normalized) && !"SOLD".equals(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is invalid");
        }
        return normalized;
    }

    private void ensureNoMarkup(String fieldLabel, String value) {
        if (value.contains("<") || value.contains(">")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, capitalize(fieldLabel) + " contains unsupported characters");
        }
    }

    private String capitalize(String value) {
        return value.substring(0, 1).toUpperCase(Locale.ROOT) + value.substring(1);
    }

    private record NormalizedArtwork(
            String titleMk,
            String titleEn,
            String descriptionMk,
            String descriptionEn,
            String category,
            String status
    ) {
    }
}
