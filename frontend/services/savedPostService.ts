import { SavedPostRequest } from "@/types/post";
import { ApiResponse, ApiService } from "./api";

export class savedPostService {
  static async getSavedPostsByUserId(
    userId: string
  ): Promise<SavedPostRequest[]> {
    try {
      const response = await ApiService.get<ApiResponse<SavedPostRequest[]>>(
        `/v1/saved-post?id=${userId}`
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
        `/v1/saved-post/save`,
        savedPost
      );
    } catch (error) {
      console.error("Error saving post:", error);
    }
  }

  static async unsavePost(savedPost: SavedPostRequest): Promise<void> {
    try {
      await ApiService.delete<ApiResponse<any>>(`/v1/saved-post/delete`, {
        data: savedPost,
      });
    } catch (error) {
      console.error("Error unsaving post:", error);
    }
  }
}
