import { useState, useCallback } from "react";
import { Comment, CommentRequest, ModifyCommentRequest } from "../types/comment";
import { CommentService } from "../services/commentService";

export interface UseCommentsProps {
  postId: string;
  userId: string;
  initialComments?: Comment[];
}

export interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  loadComments: () => Promise<void>;
  addComment: (content: string, parentCommentId?: string) => Promise<void>;
  updateComment: (commentId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  toggleLike: (commentId: string) => Promise<void>;
  refreshComments: () => Promise<void>;
}

export const useComments = ({
  postId,
  userId,
  initialComments = [],
}: UseCommentsProps): UseCommentsReturn => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading comments for postId:", postId);

      const commentsData = await CommentService.getComments(postId, userId);
      setComments(commentsData);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId, userId]);

  const addComment = useCallback(
    async (content: string, parentCommentId?: string) => {
      try {
        setError(null);

        const commentRequest: CommentRequest = {
          content: content.trim(),
          senderId: userId,
          postId: postId,
          parentCommentId: parentCommentId || '',
        };

        await CommentService.createComment(commentRequest);
        await loadComments();
      } catch (err) {
        console.error("Error adding comment:", err);
        setError("Failed to add comment");
        throw err;
      }
    },
    [userId, postId, loadComments]
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        setError(null);
        const modifyRequest: ModifyCommentRequest = {
          commentId,
          content: content.trim(),
        };

        await CommentService.updateComment(modifyRequest);
        // Refresh comments after updating
        await loadComments();
      } catch (err) {
        console.error("Error updating comment:", err);
        setError("Failed to update comment");
        throw err;
      }
    },
    [loadComments]
  );

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      setError(null);

      await CommentService.deleteComment(commentId);
      // Refresh comments after deleting
      await loadComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
      throw err;
    }
  }, [loadComments]);

  const toggleLike = useCallback(async (commentId: string) => {
    try {
      setError(null);
      
      await CommentService.toggleLike(commentId, userId);
      // Refresh comments to get updated like status
      await loadComments();
    } catch (err) {
      console.error("Error toggling like:", err);
      setError("Failed to update like");
      throw err;
    }
  }, [userId, loadComments]);

  const refreshComments = useCallback(async () => {
    await loadComments();
  }, [loadComments]);

  return {
    comments,
    loading,
    error,
    loadComments,
    addComment,
    updateComment,
    deleteComment,
    toggleLike,
    refreshComments,
  };
};
