package com.example.mapper;
import java.util.List;

import com.example.dto.response.user.CommentResponseDTO;
import com.example.entity.Comment;
import com.example.repository.comment.CommentLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentMapper {
    private final UserMapper userMapper;
    private final CommentLikeRepository commentLikeRepository;

    public CommentResponseDTO mapToDto(Comment comment, List<Comment> replies) {
        return mapToDto(comment, replies, null);
    }

    public CommentResponseDTO mapToDto(Comment comment, List<Comment> replies, String currentUserId) {
        CommentResponseDTO dto = new CommentResponseDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setSender(userMapper.toUserResponse(comment.getSender()));
        dto.setCreatedAt(comment.getCreateAt().toString());
        dto.setUpdatedAt(null); 
        
        // Set likes information
        dto.setLikesCount(commentLikeRepository.countLikesByCommentId(comment.getId()));
        dto.setIsLiked(currentUserId != null && 
            commentLikeRepository.existsByCommentIdAndUserId(comment.getId(), currentUserId));

        // đệ quy
        if (replies != null) {
            dto.setReplies(replies.stream()
                .map(reply -> this.mapToDto(reply, reply.getReplies(), currentUserId))
                .toList());
        }

        return dto;
    }
}