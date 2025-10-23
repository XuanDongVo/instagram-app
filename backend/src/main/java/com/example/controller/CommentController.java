package com.example.controller;

import com.example.dto.ApiResponse;
import com.example.dto.request.CommentRequestDTO;
import com.example.dto.response.user.CommentResponseDTO;
import com.example.service.comment.CommentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.dto.request.ModifyCommentRequestDTO;

import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponseDTO>> addComment(@RequestBody CommentRequestDTO requestDTO) {
        try {
            CommentResponseDTO  commentResponseDTO =  commentService.addComment(requestDTO);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(HttpStatus.CREATED.value(), "Thêm bình luận thành công.", commentResponseDTO));
        } catch (EntityNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Không tìm thấy user hoặc bài viết."));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Thêm bình luận thất bại."));
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<CommentResponseDTO>>> getCommentsByPostId(@PathVariable String postId) {
        try {
            List<CommentResponseDTO> comments = commentService.getCommentInPost(postId);
            return ResponseEntity.ok(
                    ApiResponse.success(HttpStatus.OK.value(), "Lấy danh sách bình luận thành công.", comments)
            );
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Không thể lấy danh sách bình luận."));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable("id") String commentId) {
        try {
            commentService.deleteComment(commentId);
            return ResponseEntity.ok(
                    ApiResponse.success(HttpStatus.OK.value(), "Xoá bình luận thành công.", null)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Không tìm thấy bình luận."));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Xoá bình luận thất bại."));
        }
    }

    @PutMapping("/modify")
    public ResponseEntity<ApiResponse<CommentResponseDTO>> modifyComment(
          @RequestBody ModifyCommentRequestDTO requestDTO) {
        try {

            CommentResponseDTO commentResponseDTO = commentService.modifyComment(requestDTO.getCommentId(), requestDTO.getContent());
            return ResponseEntity.ok(
                    ApiResponse.success(HttpStatus.OK.value(), "Cập nhật bình luận thành công.", commentResponseDTO)
            );
        } catch (EntityNotFoundException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Không tìm thấy bình luận cần sửa."));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Cập nhật bình luận thất bại."));
        }
    }
}
