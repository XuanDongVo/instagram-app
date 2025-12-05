package com.example.service.comment;

import com.example.dto.request.CommentRequestDTO;
import com.example.dto.response.user.CommentResponseDTO;
import com.example.entity.Comment;
import com.example.entity.CommentLike;
import com.example.entity.Post;
import com.example.entity.User;
import com.example.mapper.CommentMapper;
import com.example.repository.comment.CommentLikeRepository;
import com.example.repository.comment.CommentRepository;
import com.example.repository.post.PostRepository;
import com.example.repository.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final CommentMapper commentMapper;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public List<CommentResponseDTO> getCommentInPost(String postId) {
        return getCommentInPost(postId, null);
    }

    public List<CommentResponseDTO> getCommentInPost(String postId, String currentUserId) {
        List<Comment> parentComments = commentRepository.findParentCommentsByPostId(postId);

        return parentComments.stream()
                .map(comment -> convertCommentToResponse(comment, currentUserId)).toList();
    }

    // Chuyển đổi Comment -> CommentResponse và lấy replies
    private CommentResponseDTO convertCommentToResponse(Comment parentComment) {
        return convertCommentToResponse(parentComment, null);
    }

    private CommentResponseDTO convertCommentToResponse(Comment parentComment, String currentUserId) {
        List<Comment> replies = commentRepository.findRepliesByParentId(parentComment.getId());
        return commentMapper.mapToDto(parentComment, replies, currentUserId);
    }

    public CommentResponseDTO addComment(CommentRequestDTO commentRequestDTO){
        User user = userRepository.findById(commentRequestDTO.getSenderId()).orElseThrow(EntityNotFoundException::new);
        Post post = postRepository.findById(commentRequestDTO.getPostId()).orElseThrow(EntityNotFoundException::new);
        Comment comment = new Comment();
        comment.setSender(user);
        comment.setPost(post);
        comment.setContent(commentRequestDTO.getContent());
        if(commentRequestDTO.getParentCommentId() != null && !commentRequestDTO.getParentCommentId().trim().isEmpty()){
            Comment commentParent = commentRepository.findById(commentRequestDTO.getParentCommentId()).orElseThrow(EntityNotFoundException::new);
            comment.setParentComment(commentParent);
        }
        commentRepository.save(comment);
        return convertCommentToResponse(comment, commentRequestDTO.getSenderId());
    }

    public CommentResponseDTO modifyComment(String commentId, String content){
        Optional<Comment> comment = commentRepository.findById(commentId);
        if(comment.isEmpty()){
           throw new EntityNotFoundException();
        }

        Comment curentComment = comment.get();
        curentComment.setContent(content);
        commentRepository.save(curentComment);
        return convertCommentToResponse(curentComment);
    }

    public void deleteComment(String commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(EntityNotFoundException::new);
        commentRepository.delete(comment);
    }

    @Transactional
    public CommentResponseDTO toggleLike(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found"));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentIdAndUserId(commentId, userId);

        if (existingLike.isPresent()) {
            // Unlike: remove existing like
            commentLikeRepository.delete(existingLike.get());
        } else {
            // Like: create new like
            CommentLike newLike = new CommentLike();
            newLike.setComment(comment);
            newLike.setUser(user);
            commentLikeRepository.save(newLike);
        }

        return convertCommentToResponse(comment, userId);
    }

    public boolean isCommentLikedByUser(String commentId, String userId) {
        return commentLikeRepository.existsByCommentIdAndUserId(commentId, userId);
    }

    public Long getCommentLikesCount(String commentId) {
        return commentLikeRepository.countLikesByCommentId(commentId);
    }
}
