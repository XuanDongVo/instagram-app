import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";


const LAPTOP_IP = "192.168.1.5";


const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:8080/api";
  }

  if (Platform.OS === "android" && !Constants.appOwnership) {
    return "http://10.0.2.2:8080/api";
  }

  if (Platform.OS === "android") {
    return `http://${LAPTOP_IP}:8080/api`;
  }

  if (Platform.OS === "ios" && !Constants.appOwnership) {
    return "http://localhost:8080/api";
  }

  if (Platform.OS === "ios") {
    return `http://${LAPTOP_IP}:8080/api`;
  }

  return `http://${LAPTOP_IP}:8080/api`;
};

const BASE_URL = getBaseUrl();
console.log("🔍 BASE_URL đang dùng:", BASE_URL);


export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - thêm token xác thực và xử lý request
// api.interceptors.request.use(
//   (
//     config: import("axios").InternalAxiosRequestConfig
//   ): import("axios").InternalAxiosRequestConfig => {
//     const token = AsyncStorage.getItem("accessToken");
//     if (token && config.headers) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }

//     // Thêm header cho mobile app
//     if (Platform.OS === "android" || Platform.OS === "ios") {
//       if (config.headers) {
//         config.headers["X-Mobile-App"] = "true";
//         config.headers["X-Platform"] = Platform.OS;
//       }
//     }

//     return config;
//   },
//   (error: AxiosError): Promise<never> => {
//     console.error("Lỗi khi gửi request:", error);
//     return Promise.reject(error);
//   }
// );

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      
      // List of endpoints that don't need authentication
      const publicEndpoints = [
        "/auth/register",
        "/auth/login", 
        "/auth/refresh-token",
        "/auth/send-otp",
        "/auth/verify-otp",
        "/auth/reset-password",
        "/auth/check-email"
      ];

      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        config.url?.includes(endpoint)
      );

      // Add authorization header for protected endpoints
      if (!isPublicEndpoint && token && token !== "null" && token !== "undefined" && token.trim() !== "") {
        if (!config.headers) config.headers = {} as AxiosRequestHeaders;
        config.headers["Authorization"] = `Bearer ${token.trim()}`;
      }

      // Add platform headers for mobile
      if (Platform.OS === "android" || Platform.OS === "ios") {
        if (!config.headers) config.headers = {} as AxiosRequestHeaders;
        config.headers["X-Mobile-App"] = "true";
        config.headers["X-Platform"] = Platform.OS;
        config.headers["X-App-Version"] = Constants.expoConfig?.version || "1.0.0";
      }

      // Add request timestamp for debugging  
      (config as any).metadata = { startTime: Date.now() };

      return config;
    } catch (error) {
      console.error("Request interceptor error:", error);
      return config;
    }
  },
  (error) => {
    console.error("Request interceptor failed:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // Log successful responses
    const duration = (response.config as any)?.metadata?.startTime 
      ? Date.now() - (response.config as any).metadata.startTime 
      : 0;
    

    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
      error.config || {};

    // Check for 401 Unauthorized and avoid infinite retry loop
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/login") &&
      !originalRequest.url?.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (refreshToken && refreshToken !== "null" && refreshToken !== "undefined") {
          // Call refresh token API
          const response = await axios.post(`${BASE_URL}/v1/auth/refresh-token`, {
            refreshToken: refreshToken.trim(),
          });

          // Check if response follows ApiResponse structure
          const responseData = response.data;
          let accessToken, newRefreshToken;

          if (responseData.success && responseData.data) {
            accessToken = responseData.data.accessToken;
            newRefreshToken = responseData.data.refreshToken || refreshToken; 
          } else if (responseData.accessToken) {
            // If backend returns AuthResponse directly
            accessToken = responseData.accessToken;
            newRefreshToken = responseData.refreshToken || refreshToken;
          } else {
            throw new Error("Invalid refresh token response structure");
          }

          if (accessToken) {
            // Store new tokens
            await AsyncStorage.setItem("accessToken", accessToken);
            if (newRefreshToken && newRefreshToken !== refreshToken) {
              await AsyncStorage.setItem("refreshToken", newRefreshToken);
            }

            // Retry original request with new token
            if (!originalRequest.headers) {
              originalRequest.headers = {} as AxiosRequestHeaders;
            }
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
        return Promise.reject(new Error("Session expired. Please login again."));
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error. Please check your connection.");
      return Promise.reject(new Error("Network error. Please check your connection."));
    }

    // Handle other HTTP errors
    if (error.response.status >= 500) {
      console.error("Server error:", error.response.status);
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    return Promise.reject(error);
  }
);

export class ApiService {
  static async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await AsyncStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem("refreshToken", refreshToken);
    }
  }

  static async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove(["accessToken", "refreshToken", "user"]);
  }

  static async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem("accessToken");
  }

  static async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem("refreshToken");
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem("accessToken");
    return !!(token && token !== "null" && token !== "undefined" && token.trim() !== "");
  }

  static async get<T>(endpoint: string, params?: unknown): Promise<T> {
    const response = await api.get<T>(endpoint, { params });
    return response.data;
  }

  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  }

  static async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await api.put<T>(endpoint, data);
    return response.data;
  }

  static async delete<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await api.delete<T>(endpoint, { data });
    return response.data;
  }

  static async logout(): Promise<void> {
    try {
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      await ApiService.clearTokens();
    }
  }
}

export default api;

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}
