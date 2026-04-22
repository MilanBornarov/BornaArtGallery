package com.artgallery.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final UploadValidationService uploadValidationService;

    @Value("${cloudinary.folder}")
    private String folder;

    public UploadResult uploadArtworkImage(MultipartFile file) throws IOException {
        uploadValidationService.validateArtworkImage(file);

        Map<?, ?> response = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "public_id", "artwork-" + UUID.randomUUID(),
                "resource_type", "image",
                "overwrite", false,
                "invalidate", true,
                "transformation", "q_auto,f_auto"
        ));
        return new UploadResult((String) response.get("secure_url"), (String) response.get("public_id"));
    }

    public void deleteImage(String publicId) throws IOException {
        if (publicId == null || publicId.isBlank()) {
            return;
        }
        cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image", "invalidate", true));
    }

    public record UploadResult(String imageUrl, String publicId) {}
}
