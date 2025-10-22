import axios, {
  AxiosInstance,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const BASE_URL = "http://10.0.2.2:8080/api";
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor - thêm token xác thực và xử lý request
api.interceptors.request.use(
  (
    config: import("axios").InternalAxiosRequestConfig
  ): import("axios").InternalAxiosRequestConfig => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Thêm header cho mobile app
    if (Platform.OS === "android" || Platform.OS === "ios") {
      if (config.headers) {
        config.headers["X-Mobile-App"] = "true";
        config.headers["X-Platform"] = Platform.OS;
      }
    }

    return config;
  },
  (error: AxiosError): Promise<never> => {
    console.error("Lỗi khi gửi request:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error: AxiosError): Promise<any> => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } =
      error.config || {};

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (refreshToken) {
          const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, newRefreshToken } = response.data;
          await AsyncStorage.setItem("accessToken", accessToken);
          await AsyncStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        console.error("Không thể refresh token:", refreshError);

        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");

        // navigation.navigate('Login');
      }
    }

    if (!error.response) {
      console.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.");
    }

    return Promise.reject(error);
  }
);

export class ApiService {
  // GET request
  static async get<T>(endpoint: string, params?: unknown): Promise<T> {
    try {
      const response = await api.get<T>(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // POST request
  static async post<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await api.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // PUT request
  static async put<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await api.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await api.delete<T>(endpoint);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // PATCH request
  static async patch<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      const response = await api.patch<T>(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  // Xử lý lỗi chung
  private static handleError(error: AxiosError): void {
    if (error.response) {
      console.error(
        "Server error:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("Network error:", error.request);
    } else {
      console.error("Request error:", error.message);
    }
  }
}

export default api;
