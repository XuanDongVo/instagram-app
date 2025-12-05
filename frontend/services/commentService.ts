import { ApiResponse, ApiService } from "./api";
import { Comment, CommentRequest, ModifyCommentRequest } from "../types/comment";

export class CommentService {
  // Lấy danh sách bình luận
  static async getComments(postId: string, currentUserId?: string): Promise<Comment[]> {
    try {
      const url = currentUserId 
        ? `/api/v1/comments/post/${postId}?currentUserId=${currentUserId}`
        : `/api/v1/comments/post/${postId}`;
        
      const response = await ApiService.get<ApiResponse<Comment[]>>(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  // Tạo bình luận mới
  static async createComment(CommentRequest: CommentRequest): Promise<Comment> {
    try {
      const response = await ApiService.post<ApiResponse<Comment>>(
        `/api/v1/comments/`,
        CommentRequest
      );
      return response.data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  // Like/Unlike bình luận
  static async toggleLike(commentId: string, userId: string): Promise<Comment> {
    try {
      const response = await ApiService.post<ApiResponse<Comment>>(
        `/api/v1/comments/${commentId}/like?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  }

  // Lấy số lượng likes của bình luận
  static async getLikesCount(commentId: string): Promise<number> {
    try {
      const response = await ApiService.get<ApiResponse<number>>(
        `/api/v1/comments/${commentId}/likes/count`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching likes count:", error);
      throw error;
    }
  }

  // Kiểm tra trạng thái like của user
  static async getLikeStatus(commentId: string, userId: string): Promise<boolean> {
    try {
      const response = await ApiService.get<ApiResponse<boolean>>(
        `/api/v1/comments/${commentId}/likes/status?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching like status:", error);
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
  ): Promise<Comment> {
    try {
      const response = await ApiService.put<ApiResponse<Comment>>(
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
