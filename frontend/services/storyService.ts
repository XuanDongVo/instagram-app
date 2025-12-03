import { api, ApiResponse } from "./api";
import {
  StoryResponse,
  StoryViewResponse,
  CreateStoryRequest,
} from "../types/story";

class StoryService {
  private baseUrl = "/v1/stories";

  /**
   * Tạo story mới
   * POST /api/v1/stories
   */
  async createStory(
    request: CreateStoryRequest
  ): Promise<ApiResponse<StoryResponse>> {
    const response = await api.post<ApiResponse<StoryResponse>>(
      this.baseUrl,
      request
    );
    return response.data;
  }

  /**
   * Lấy danh sách story của chính mình
   * GET /api/v1/stories/my-stories?userId={userId}
   */
  async getMyStories(userId: string): Promise<ApiResponse<StoryResponse[]>> {
    const response = await api.get<ApiResponse<StoryResponse[]>>(
      `${this.baseUrl}/my-stories`,
      {
        params: { userId },
      }
    );
    return response.data;
  }

  /**
   * Lấy stories từ những người đang follow
   * GET /api/v1/stories/following?userId={userId}
   */
  async getStoriesFromFollowing(
    userId: string
  ): Promise<ApiResponse<StoryResponse[]>> {
    const response = await api.get<ApiResponse<StoryResponse[]>>(
      `${this.baseUrl}/following`,
      {
        params: { userId },
      }
    );
    return response.data;
  }

  /**
   * Lấy tất cả stories đang hoạt động
   * GET /api/v1/stories?userId={userId}
   */
  async getAllActiveStories(
    userId: string
  ): Promise<ApiResponse<StoryResponse[]>> {
    const response = await api.get<ApiResponse<StoryResponse[]>>(
      this.baseUrl,
      {
        params: { userId },
      }
    );
    return response.data;
  }

  /**
   * Xem một story
   * POST /api/v1/stories/{storyId}/view?viewerId={viewerId}
   */
  async viewStory(
    storyId: string,
    viewerId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
      `${this.baseUrl}/${storyId}/view`,
      null,
      {
        params: { viewerId },
      }
    );
    return response.data;
  }

  /**
   * Lấy danh sách người xem story
   * GET /api/v1/stories/{storyId}/views
   */
  async getStoryViews(
    storyId: string
  ): Promise<ApiResponse<StoryViewResponse[]>> {
    const response = await api.get<ApiResponse<StoryViewResponse[]>>(
      `${this.baseUrl}/${storyId}/views`
    );
    return response.data;
  }

  /**
   * Xóa story
   * DELETE /api/v1/stories/{storyId}?userId={userId}
   */
  async deleteStory(
    storyId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    const response = await api.delete<ApiResponse<void>>(
      `${this.baseUrl}/${storyId}`,
      {
        params: { userId },
      }
    );
    return response.data;
  }
}

export const storyService = new StoryService();
export default storyService;
