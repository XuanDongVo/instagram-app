export * from "./chat";
export * from "./messages";
export * from "./post";
export * from "./user";
export * from "./story";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    nextCursor?: string;
  };
}

// Firebase Error Types
export interface FirebaseError {
  code: string;
  message: string;
  customData?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}
