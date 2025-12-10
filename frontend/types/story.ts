import { UserResponse } from "./user";

export enum MediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}

export interface StoryUser {
  userId: string;
  userName: string;
  profileImage?: string;
  stories: StoryResponse[];
  hasStory: boolean;
  isViewed: boolean;
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
