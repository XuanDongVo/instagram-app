package com.example.dto.response.post;

import com.example.dto.response.user.UserResponse;
import com.example.entity.Comment;
import com.example.entity.Like;
import com.example.entity.PostImages;
import com.example.entity.User;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PostResponse {
    private String id;
    private String content;
    private LocalDateTime createAt;
    private List<PostImages> images;
    private int comments;
    private int likes;
    private boolean liked;
    private boolean savedPost;
    private UserResponse user;
}
