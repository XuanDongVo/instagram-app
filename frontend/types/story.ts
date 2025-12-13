import { UserResponse, UserSearchResponse } from "./user";

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface StoryUser {
  userId: string;
  userName: string;
  fullName?: string;
  profileImage?: string;
  stories: StoryResponse[];
  hasStory: boolean;
  isViewed: boolean;
}

export interface StoryListProps {
  storyUsers: StoryUser[];
  currentUserId?: string | null;
  showAddButton?: boolean;
  onAddPress?: () => void;
  onStoryPress: (userId: string, isMyStory: boolean) => void;
}

export interface StoryResponse {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  createdAt: string;
  expiresAt: string;
  viewCount: number;
  viewed: boolean;
  user: UserResponse;
}

export interface StoryViewResponse {
  id: string;
  viewer: UserResponse;
  viewedAt: string;
}

export interface StoryRequest {
  userId: string;
  mediaUrl: string;
  mediaType: MediaType;
}

export interface CreateStoryRequest {
  userId: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
}

export interface ViewStoryRequest {
  storyId: string;
  viewerId: string;
}

export interface DeleteStoryRequest {
  storyId: string;
  userId: string;
}

export interface UserStoryAvatarProps {
  user: UserSearchResponse;
  currentUserId?: string | null;
  onPress?: (userId: string, isMyStory: boolean) => void;
}
