export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  sender: {
    id: string;
    userName: string;
    profileImage?: string;
  };
  replies?: Comment[];
  likesCount?: number;
  isLiked?: boolean;
  isReply?: boolean;
  parentComment?: Comment;
  originalParent?: Comment;
}

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