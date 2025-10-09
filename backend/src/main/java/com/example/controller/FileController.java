package com.example.controller;

import com.example.dto.ApiResponse;
import com.example.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/file")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<List<String>>> uploadFile(@RequestParam("files") List<MultipartFile> files) {
        List<String> urlImages = new ArrayList<>();
        System.out.println("ok");
        try {
            for (MultipartFile file : files) {
                String urlPath = fileService.uploadImageToCloudinary(file);
                urlImages.add(urlPath);
            }

            return ResponseEntity.ok(
                    ApiResponse.success(HttpStatus.OK.value(), "Tải ảnh thành công", urlImages)
            );

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Tải ảnh thất bại: " + e.getMessage()));
        }
    }

    @GetMapping
    public String test(){
        System.out.println("test");
        return "test";
    }
}
