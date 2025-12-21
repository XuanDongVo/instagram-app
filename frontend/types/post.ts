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
  postImages: string[];
  user_Id: string;
}

export interface PostImages {
  id: string;
  url_image?: string;
}

export interface PostGridProps {
  posts: PostResponse[];
  onPostPress?: (post: PostResponse) => void;
}
