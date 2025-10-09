package com.example.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileService {

    private final Cloudinary cloudinary;
    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png");

    public String uploadImageToCloudinary(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;

        validateFile(file);
        // tạo tên file
        String publicValue = generatePublicValue(file.getOriginalFilename());
        // phần mở rộng của file
        String extension = getFileName(file.getOriginalFilename())[1];
        File fileUpload = convert(file);
        try {
//            cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
            Map<?, ?> uploadResult = cloudinary.uploader().upload(fileUpload, ObjectUtils.asMap("public_id", publicValue));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new IOException("Failed to upload file to Cloudinary", e);
        } finally {
            if (fileUpload.exists()) {
                if (!fileUpload.delete()) {
                    System.err.println("Warning: Failed to delete temporary file " + fileUpload.getAbsolutePath());
                }
            }
        }

//        return  cloudinary.url().generate(StringUtils.join(publicValue, ".", extension));
    }

    public void deleteImageInCloudinary(String imageUrl) throws IOException {
        String publicId = extractPublicIdFromUrl(imageUrl);
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("/upload/")) {
            return null;
        }

        String[] parts = imageUrl.split("/upload/");
        if (parts.length < 2) {
            return null;
        }

        String publicIdWithExtension = parts[1];
        int dotIndex = publicIdWithExtension.lastIndexOf(".");
        return dotIndex != -1 ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;
    }

    public void validateFile(MultipartFile file) {
        String extension = getFileName(file.getOriginalFilename())[1].toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("File format not supported: " + extension);
        }
    }

    public File convert(MultipartFile file) throws IOException {
        assert file.getOriginalFilename() != null;
        File covertFile = new File(StringUtils.join(generatePublicValue(file.getOriginalFilename()), ".",
                getFileName(file.getOriginalFilename())[1]));
        try (InputStream is = file.getInputStream()) {
            Files.copy(is, covertFile.toPath());
        }
        return covertFile;
    }

    public String generatePublicValue(String originalName) {
        String fileName = getFileName(originalName)[0];
        return StringUtils.join(UUID.randomUUID().toString(), "_", fileName);
    }

    public String[] getFileName(String originalName) {
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex == -1 || dotIndex == originalName.length() - 1) {
            throw new IllegalArgumentException("Invalid file name: missing extension.");
        }
        String name = originalName.substring(0, dotIndex);
        String extension = originalName.substring(dotIndex + 1);
        return new String[] { name, extension };
    }

}