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

// Function để detect môi trường và trả về BASE_URL phù hợp
const getBaseUrl = () => {
  // Nếu chạy trên web
  if (Platform.OS === "web") {
    return "http://localhost:8080/api";
  }

  // Nếu chạy trên device thật (qua Expo Go với QR code)
  if (Constants.executionEnvironment === "storeClient") {
    // Lấy IP của máy host từ Expo manifest
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    return debuggerHost
      ? `http://${debuggerHost}:8080/api`
      : "http://192.168.1.6:8080/api";
  }

  // Nếu chạy trên Android emulator
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080/api";
  }

  // Nếu chạy trên iOS simulator
  if (Platform.OS === "ios") {
    return "http://localhost:8080/api";
  }

  // Fallback
  return "http://localhost:8080/api";
};

const BASE_URL = getBaseUrl();

console.log(`🌐 API Base URL: ${BASE_URL}`);
console.log(`📱 Platform: ${Platform.OS}`);
console.log(`🔧 Execution Environment: ${Constants.executionEnvironment}`);

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
    const token = await AsyncStorage.getItem("accessToken");

    if (
      // !config.url?.includes("/auth/register") &&
      // !config.url?.includes("/auth/login") &&
      token &&
      token !== "null" &&
      token !== "undefined" &&
      token.trim() !== ""
    ) {
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (Platform.OS === "android" || Platform.OS === "ios") {
      config.headers["X-Mobile-App"] = "true";
      config.headers["X-Platform"] = Platform.OS;
    }

    return config;
  },
  (error) => Promise.reject(error)
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
}

export default api;

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
}
