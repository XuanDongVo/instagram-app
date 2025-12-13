package com.example.dto.response.user;

import com.example.dto.response.story.StoryResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchResponse {
    private String id;
    private String userName;
    private String fullName;
    private String profileImage;
    private boolean hasStory; 
    private List<StoryResponse> stories;
}
