import { api } from "./api";
import { PostRequest, PostResponse } from "@/types/post";
import { ApiResponse } from "./api";

export class PostService {
  static async getAllPosts(): Promise<ApiResponse<PostResponse[]>> {
    try {
      const response = await api.get<ApiResponse<PostResponse[]>>(
        "/v1/post/all",
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      throw error;
    }
  }

  static async createPost(data: PostRequest): Promise<ApiResponse<any>> {
    try {
      const response = await api.post<ApiResponse<any>>("/v1/post", data);
      return response.data;
    } catch (error: any) {
      console.error(
        "Lỗi khi lưu bài viết:",
        error?.response?.data || error.message
      );
      throw error;
    }
  }

  static async getPost(userId: string): Promise<ApiResponse<PostResponse[]>> {
    try {
      const response = await api.get<ApiResponse<PostResponse[]>>("/v1/post", {
        params: {
          id: userId,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      throw error;
    }
  }

  static async getMinePost(
    userId: string
  ): Promise<ApiResponse<PostResponse[]>> {
    try {
      const response = await api.get<ApiResponse<PostResponse[]>>(
        "/v1/post/minePost",
        {
          params: {
            id: userId,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      throw error;
    }
  }

  static async getAllPost(): Promise<ApiResponse<PostResponse[]>> {
    try {
      const response = await api.get<ApiResponse<PostResponse[]>>(
        "/v1/post/all",
        {}
      );
      return response.data;
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      throw error;
    }
  }

  static async deletePost(
    postId: string
  ): Promise<ApiResponse<PostResponse[]>> {
    try {
      const response = await api.delete<ApiResponse<PostResponse[]>>(
        `/v1/post/${postId}`,
        {
          params: {
            id: postId,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      throw error;
    }
  }

  static async updatePostStatus(
    postId: string,
    action: "hide" | "active"
  ): Promise<ApiResponse<string>> {
    try {
      const response = await api.put<ApiResponse<string>>(
        `/v1/post/${postId}`,
        null,
        {
          params: {
            action: action,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(error?.response?.data || error.message);
      throw error;
    }
  }
}

export default PostService;
