package com.example.mapper;

import com.example.dto.response.story.StoryResponse;
import com.example.dto.response.story.StoryViewResponse;
import com.example.entity.Story;
import com.example.entity.StoryView;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StoryMapper {
    private final UserMapper userMapper;

    public StoryResponse toStoryResponse(Story story, long viewCount, boolean viewed) {
        return StoryResponse.builder()
                .id(story.getId())
                .mediaUrl(story.getMediaUrl())
                .mediaType(story.getMediaType())
                .createdAt(story.getCreatedAt())
                .expiresAt(story.getExpiresAt())
                .viewCount(viewCount)
                .viewed(viewed)
                .user(userMapper.toUserResponse(story.getUser()))
                .build();
    }

    public StoryViewResponse toStoryViewResponse(StoryView storyView) {
        return StoryViewResponse.builder()
                .id(storyView.getId())
                .viewer(userMapper.toUserResponse(storyView.getViewer()))
                .viewedAt(storyView.getViewedAt())
                .build();
    }
}

