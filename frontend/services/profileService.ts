import { ApiService, ApiResponse, api } from "./api";
import {
  UserProfileResponse,
  UpdateProfileRequest,
  UserResponse,
} from "../types/user";
import { AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "/v1/users";

const getAuthConfig = async (): Promise<AxiosRequestConfig> => {
  const token = await AsyncStorage.getItem("accessToken");
  if (!token)
    throw new Error("Không tìm thấy access token. Vui lòng đăng nhập lại.");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ========================== PROFILE =============================

const getUserProfile = async (id: string): Promise<UserProfileResponse> => {
  const config = await getAuthConfig();
  console.log( `${API_URL}/profile?id=${id}`)
  const res = await ApiService.get<ApiResponse<UserProfileResponse>>(
    `${API_URL}/profile?id=${id}`,
    config
  );

  if (res.status !== 200) throw new Error(res.message || "Lỗi tải profile");
  return res.data;
};

const updateProfile = async (
  id: string,
  data: UpdateProfileRequest
): Promise<UserResponse> => {
  const res = await ApiService.put<ApiResponse<UserResponse>>(
    `${API_URL}/updateProfile?id=${id}`,
    data
  );

  if (res.status !== 200) throw new Error(res.message || "Cập nhật thất bại");
  return res.data;
};

const uploadProfileImage = async (
  id: string,
  file: { uri: string; type: string; name: string }
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file as any);

  const config: AxiosRequestConfig = {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(await getAuthConfig()).headers,
    },
  };

  const res = await api.post<ApiResponse<string>>(
    `${API_URL}/uploadProfileImage?id=${id}`,
    formData,
    config
  );

  if (res.status !== 200)
    throw new Error(res.data.message || "Upload ảnh thất bại");
  return res.data.data;
};



// ========================== FOLLOW =============================

const followUser = async (
  currentUserId: string,
  targetId: string
): Promise<void> => {
  const res = await ApiService.post<ApiResponse<any>>(
    `${API_URL}/follow?id=${currentUserId}&targetId=${targetId}`,
    {}
  );

  if (res.status !== 200) throw new Error(res.message || "Follow thất bại");
};

const unfollowUser = async (
  currentUserId: string,
  targetId: string
): Promise<void> => {
  const res = await ApiService.post<ApiResponse<any>>(
    `${API_URL}/unfollow?id=${currentUserId}&targetId=${targetId}`,
    {}
  );

  if (res.status !== 200) throw new Error(res.message || "Unfollow thất bại");
};

// ========================== FOLLOWERS LIST =============================

// Followers
const getFollowers = async (id: string): Promise<UserResponse[]> => {
  const config = await getAuthConfig();

  const res = await ApiService.get<ApiResponse<UserResponse[]>>(
    `${API_URL}/followers?id=${id}`,
    config
  );

  if (res.status !== 200)
    throw new Error(res.message || "Không tải được followers");
  return res.data;
};

// Following
const getFollowing = async (id: string): Promise<UserResponse[]> => {
  const config = await getAuthConfig();

  const res = await ApiService.get<ApiResponse<UserResponse[]>>(
    `${API_URL}/following?id=${id}`,
    config
  );

  if (res.status !== 200)
    throw new Error(res.message || "Không tải được following");
  return res.data;
};

// ========================== SEARCH =============================

const searchUsers = async (name: string): Promise<UserResponse[]> => {
  const config = await getAuthConfig();

  const res = await ApiService.get<ApiResponse<UserResponse[]>>(
    `${API_URL}/search?name=${name}`,
    config
  );

  if (res.status !== 200) throw new Error(res.message || "Không tìm kiếm được");
  return res.data;
};

const removeFollower = async (currentUserId: string, followerId: string) => {
  const config = await getAuthConfig();

  const res = await ApiService.delete<ApiResponse<UserProfileResponse>>(
    `/v1/users/removeFollowers?id=${currentUserId}&followerId=${followerId}`,
    config
  );

  if (res.status !== 200)
    throw new Error(res.message || "Xóa follower thất bại");

  return res.data; // trả về profile đã cập nhật
};

// ========================== EXPORT =============================

export const profileService = {
  getUserProfile,
  updateProfile,
  uploadProfileImage,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
  removeFollower,
};
