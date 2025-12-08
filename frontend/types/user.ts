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

// Sửa interface UserProfileResponse để khớp với JSON mới
export interface UserProfileResponse {
    userId: string;       // Tên trường mới
    userName: string;     // Tên trường mới
    fullName: string;
    avatarUrl: string | null; // Tên trường mới
    bio: string | null;
    followersCount: number;
    followingCount: number;
    postCount: number;
    followers: any[];
    followings: any[];
    posts: any[];
    following: boolean; // Tên trường thực tế là 'following'
    me: boolean;
}

export type UpdateProfileRequest = {
  username?: string;
  fullName?: string;
  bio?: string;
  // ... các trường có thể cập nhật
};

