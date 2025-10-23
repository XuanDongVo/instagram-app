import { SavedPostRequest } from "@/types/post";
import { ApiResponse, ApiService } from "./api";

export class savedPostService {
  static async getSavedPostsByUserId(
    userId: string
  ): Promise<SavedPostRequest[]> {
    try {
      const response = await ApiService.get<ApiResponse<SavedPostRequest[]>>(
        `/api/v1/saved-posts?id=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      return [];
    }
  }

  static async savePost(savedPost: SavedPostRequest): Promise<void> {
    try {
      await ApiService.post<ApiResponse<any>>(
        `/api/v1/saved-posts/save`,
        savedPost
      );
    } catch (error) {
      console.error("Error saving post:", error);
    }
  }

  static async unsavePost(savedPost: SavedPostRequest): Promise<void> {
    try {
      await ApiService.delete<ApiResponse<any>>(`/api/v1/saved-posts/delete`, {
        data: savedPost,
      });
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
  }
}
