package com.example.dto.response.user;

import com.example.repository.user.UserRepository;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostDTO {
    private String id;
    private String content;
    private LocalDateTime createdAt;
    private List<String> imageUrls;
    private int likeCount;
    private int commentCount;
    private List<UserResponse> likedUsers;
}
