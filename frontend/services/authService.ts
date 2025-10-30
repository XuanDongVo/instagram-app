import { ApiService } from "./api"; 
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

const login = (data: LoginProps): Promise<AuthResponse> => {
  return ApiService.post<AuthResponse>(`${API_URL}/login`, data);
};

const register = (data: RegisterProps): Promise<AuthResponse> => {
  return ApiService.post<AuthResponse>(`${API_URL}/register`, data);
};

const checkMail = (data: CheckMailProps): Promise<string> => {
  return ApiService.get<string>(`${API_URL}/check-email`, data);
};

const sendOtp = (data: SendOtpProps): Promise<string> => {
  return ApiService.post<string>(`${API_URL}/send-otp`, data);
};
  
const verifyOtp = (data: VerifyOtpProps): Promise<void> => {
  return ApiService.post<void>(`${API_URL}/verify-otp`, data);
};

const resetPassword = (data: ResetPasswordProps): Promise<void> => {
  return ApiService.post<void>(`${API_URL}/reset-password`, data);
};

export const authService = {
  login,
  register,
  checkMail,
  sendOtp,
  verifyOtp,
  resetPassword,
};