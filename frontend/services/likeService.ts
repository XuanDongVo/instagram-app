import { LikeRequest } from "./../types/post";
import { ApiService, ApiResponse } from "./api";

export class LikeService {
  static async likePost(likeRequest: LikeRequest): Promise<void> {
    try {
      await ApiService.post<ApiResponse<any>>(`/api/v1/like`, likeRequest);
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  }

  static async unlikePost(likeRequest: LikeRequest): Promise<void> {
    try {
      await ApiService.delete<ApiResponse<any>>(`/api/v1/like`, {
        likeRequest,
      });
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  }
}
