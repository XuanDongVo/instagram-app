import { UserResponse } from "./user";

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

export interface PostRequest {
  content: string;
  images: string[];
  userId: string;
}

export interface PostImages {
  imageUrl: string;
}

export interface PostGridProps {
  posts: PostResponse[];
  onPostPress?: (post: PostResponse) => void;
}
