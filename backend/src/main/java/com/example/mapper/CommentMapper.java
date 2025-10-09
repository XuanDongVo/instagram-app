package com.example.mapper;
import java.util.List;

import com.example.dto.response.user.CommentResponseDTO;
import com.example.entity.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentMapper {
    private final UserMapper userMapper;

    public CommentResponseDTO mapToDto(Comment comment, List<Comment> replies) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setSender(userMapper.toUserResponse(comment.getSender()));
        dto.setCreateAt(comment.getCreateAt().toString());

        // đệ quy
        if (replies != null) {
            dto.setReplies(replies.stream().map(reply -> this.mapToDto(reply, reply.getReplies())).toList());
        }

        return dto;
    }

}