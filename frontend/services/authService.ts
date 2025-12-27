import { ApiService, ApiResponse } from "./api"; 
import {
  LoginProps,
  RegisterProps,
  SendOtpProps,
  VerifyOtpProps,
  ResetPasswordProps,
  AuthResponse,
  CheckMailProps,
} from "../types/user";

const API_URL = "/v1/auth";

const login = async (data: LoginProps): Promise<AuthResponse> => {
  const response = await ApiService.post<ApiResponse<AuthResponse>>(`${API_URL}/login`, data);
  
  // Handle both ApiResponse wrapper and direct AuthResponse
  const authData = response.data || response;
  
  if (authData.accessToken) {
    // Store tokens automatically
    await ApiService.setTokens(authData.accessToken, authData.refreshToken);
  }
  
  return authData;
};

const register = async (data: RegisterProps): Promise<AuthResponse> => {
  const response = await ApiService.post<ApiResponse<AuthResponse>>(`${API_URL}/register`, data);
  
  // Handle both ApiResponse wrapper and direct AuthResponse
  const authData = response.data || response;
  
  if (authData.accessToken) {
    // Store tokens automatically
    await ApiService.setTokens(authData.accessToken, authData.refreshToken);
  }
  
  return authData;
};

const checkMail = (data: CheckMailProps): Promise<ApiResponse<string>> => {
  return ApiService.get<ApiResponse<string>>(`${API_URL}/check-email`, data);
};

const sendOtp = (data: SendOtpProps): Promise<ApiResponse<string>> => {
  return ApiService.post<ApiResponse<string>>(`${API_URL}/send-otp`, data);
};
  
const verifyOtp = (data: VerifyOtpProps): Promise<ApiResponse<void>> => {
  return ApiService.post<ApiResponse<void>>(`${API_URL}/verify-otp`, data);
};

const resetPassword = (data: ResetPasswordProps): Promise<ApiResponse<void>> => {
  return ApiService.post<ApiResponse<void>>(`${API_URL}/reset-password`, data);
};

const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint if it exists
    await ApiService.post(`${API_URL}/logout`, {});
  } catch (error) {
    console.error("Backend logout failed:", error);
  } finally {
    // Always clear local tokens
    await ApiService.clearTokens();
  }
};

const refreshToken = async (): Promise<AuthResponse> => {
  const refreshToken = await ApiService.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await ApiService.post<ApiResponse<AuthResponse>>(`${API_URL}/refresh-token`, {
    refreshToken
  });
  
  const authData = response.data || response;
  
  if (authData.accessToken) {
    await ApiService.setTokens(authData.accessToken, authData.refreshToken || refreshToken);
  }
  
  return authData;
};

export const authService = {
  login,
  register,
  checkMail,
  sendOtp,
  verifyOtp,
  resetPassword,
  logout,
  refreshToken,
};