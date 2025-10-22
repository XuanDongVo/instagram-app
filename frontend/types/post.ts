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
