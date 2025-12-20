import { api } from "./api";
import { PostRequest } from "@/types/post";
import { ApiResponse } from "./api";

export class PostService {
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
}

export default PostService;
