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
export interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (content: string, parentCommentId?: string) => void;
  replyingTo: Comment | null;
  onCancelReply: () => void;
  placeholder?: string;
}

export interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onToggleLike: (commentId: string) => void;
  currentUserId: string;
  isReply?: boolean;
  parentComment?: Comment;
}

export interface CommentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  userId: string;
  initialComments?: Comment[];
}
export interface EditCommentModalProps {
  visible: boolean;
  initialValue: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}
