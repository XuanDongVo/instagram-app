import { api, ApiResponse } from "./api";
import { UserSearchResponse } from "@/types/user";


class UserService {
  /**
   * Tìm kiếm user theo tên
   * @param name - Tên user cần tìm
   * @returns List<UserSearchResponse> - Danh sách user (có hoặc không có story)
   */
  async searchUsers(name: string): Promise<UserSearchResponse[]> {
    try {
      const response = await api.get<ApiResponse<UserSearchResponse[]>>(
        `/v1/users/search?name=${encodeURIComponent(name)}`
      );

      if (response && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error searching users:", error);
      if (error.response?.status === 404 || error.response?.data?.status === 404) {
        return [];
      }
      throw error;
    }
  }
}

export const userService = new UserService();
