import { StoryResponse } from './story';
export interface UserResponse {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  profileImage: string;
  bio: string;
  lastSeen: string;
  isOnline: boolean;
}

export interface RegisterProps {
  email: string;
  password: string;
  userName: string;
  fullName: string;
}

export interface LoginProps {
  email: string;
  password: string;
}

export interface CheckMailProps {
  email: string;
}

export interface SendOtpProps {
  email: string;
}

export interface VerifyOtpProps {
  email: string;
  otp: string;
}

export interface ResetPasswordProps {
  email: string;
  newPassword: string;
}

export interface AuthResponse {
  id : string;
  email: string;
  userName: string;
  fullName: string;
  accessToken: string;
  refreshToken?: string;
}

// Alias for CurrentUser to be used in components
export interface CurrentUser {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  accessToken: string;
  avatar?: string;
}


export interface UserSearchResponse {
  id: string;
  userName: string;
  fullName: string;
  profileImage?: string;
  hasStory: boolean;
  stories: StoryResponse[];
}
