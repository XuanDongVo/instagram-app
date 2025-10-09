package com.example.dto.response.user;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentResponseDTO {
    private String id;
    private String content;
    private UserResponse sender;
    private String createAt;
    private List<CommentResponseDTO> replies;
}