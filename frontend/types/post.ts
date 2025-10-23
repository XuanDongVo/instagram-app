import { UserResponse } from "./user";

// ==================== COMMENT  ====================
export interface Comment {}

export interface CommentRequest {
  content: string;
  senderId: string;
  postId: string;
  parentCommentId: string;
}

export interface ModifyCommentRequest {
  commentId: string;
  content: string;
}

// ==================== LIKE ====================
export interface LikeRequest {
  postId: string;
  userId: string;
}

// ==================== SAVED POST ====================
export interface SavedPostRequest {
  postId: string;
  userId: string;
}

// ==================== POST ====================
export interface PostResponse {
  id: string;
  content: string;
  createAt: string;
  images: PostImages[];
  comments: number;
  likes: number;
  liked: boolean;
  savedPost: boolean;
  user: UserResponse;
}

export interface PostImages {
  id: string;
  imageUrl: string;
}
