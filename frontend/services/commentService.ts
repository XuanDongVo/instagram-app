import { ApiResponse, ApiService } from "./api";
import { Comment, CommentRequest, ModifyCommentRequest } from "../types/post";

export class CommentService {
  // Lấy danh sách bình luận
  static async getComments(postId: string): Promise<Comment[]> {
    try {
      const response = await ApiService.get<ApiResponse<Comment[]>>(
        `/api/v1/comments/post/${postId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  // Tạo bình luận mới
  static async createComment(CommentRequest: CommentRequest): Promise<void> {
    try {
      const response = await ApiService.post<ApiResponse<any>>(
        `/api/v1/comments/`,
        CommentRequest
      );
      return response.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  // xóa bình luận
  static async deleteComment(commentId: string): Promise<void> {
    try {
      const response = await ApiService.delete<ApiResponse<any>>(
        `/api/v1/comments/delete/${commentId}`,
        { data: null }
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  // Cập nhật bình luận
  static async updateComment(
    modifyComment: ModifyCommentRequest
  ): Promise<void> {
    try {
      const response = await ApiService.put<ApiResponse<any>>(
        `/api/v1/comments/modify`,
        modifyComment
      );
      return response.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }
}
