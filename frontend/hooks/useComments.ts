import { useState, useCallback } from "react";
import { Comment, CommentRequest, ModifyCommentRequest } from "../types/post";
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

  // Mock data cho testing
  const getMockComments = useCallback((postId: string): Comment[] => {
    return [
      {
        id: "1",
        content: "Great post! Love the content 😍",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        user: {
          id: "user1",
          userName: "john_doe",
          profileImage: undefined,
        },
        likesCount: 12,
        isLiked: false,
        replies: [
          {
            id: "1-1",
            content: "Thanks! Glad you enjoyed it",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            user: {
              id: "user2",
              userName: "original_poster",
              profileImage: undefined,
            },
            likesCount: 3,
            isLiked: true,
            replies: [
              {
                id: "1-1-1",
                content: "You're welcome! Keep up the great work",
                createdAt: new Date(
                  Date.now() - 50 * 60 * 1000
                ).toISOString(),
                user: {
                  id: "user3",
                  userName: "another_user",
                  profileImage: undefined,
                },
                likesCount: 1,
                isLiked: false,
              },
            ],
          },
          {
            id: "1-2",
            content: "I agree, this is amazing!",
            createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            user: {
              id: "user4",
              userName: "second_replier",
              profileImage: undefined,
            },
            likesCount: 2,
            isLiked: true,
            replies: [
              {
                id: "1-2-1",
                content: "Totally! This made my day",
                createdAt: new Date(
                  Date.now() - 40 * 60 * 1000
                ).toISOString(),
                user: {
                  id: "user5",
                  userName: "nested_replier",
                  profileImage: undefined,
                },
                likesCount: 1,
                isLiked: false,
                replies: [
                  {
                    id: "1-2-1-1",
                    content: "Same here! Very inspiring",
                    createdAt: new Date(
                      Date.now() - 30 * 60 * 1000
                    ).toISOString(),
                    user: {
                      id: "user6",
                      userName: "deep_user",
                      profileImage: undefined,
                    },
                    likesCount: 1,
                    isLiked: false,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "2",
        content: "Amazing photography skills! What camera did you use?",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        user: {
          id: "user3",
          userName: "photo_lover",
          profileImage: undefined,
        },
        likesCount: 8,
        isLiked: true,
      },
      {
        id: "3",
        content: "This inspires me to travel more! 🌍✈️",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        user: {
          id: "user4",
          userName: "wanderlust_soul",
          profileImage: undefined,
        },
        likesCount: 15,
        isLiked: false,
      },
      {
        id: "4",
        content: "Can you share the location? Would love to visit someday!",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        user: {
          id: "user5",
          userName: "explorer_mike",
          profileImage: undefined,
        },
        likesCount: 5,
        isLiked: false,
      },
    ];
  }, []);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading comments for postId:", postId);

      // Sử dụng mock data thay vì gọi API
      // TODO: Uncomment dòng dưới khi API sẵn sàng
      // const commentsData = await CommentService.getComments(postId);

      // Mock delay để simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const commentsData = getMockComments(postId);

      setComments(commentsData);
    } catch (err) {
      console.error("Error loading comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId, getMockComments]);

  const addComment = useCallback(
    async (content: string, parentCommentId?: string) => {
      try {
        setError(null);

        // Tạo mock comment mới
        const newComment: Comment = {
          id: `new-${Date.now()}`,
          content: content.trim(),
          createdAt: new Date().toISOString(),
          user: {
            id: userId,
            userName: "current_user", // TODO: Get từ user context
            profileImage: undefined,
          },
          likesCount: 0,
          isLiked: false,
        };

        if (parentCommentId) {
          // Thêm reply vào main comment, không tạo nested
          setComments((prevComments) => {
            const parentComment = prevComments.find(
              (c) => c.id === parentCommentId
            );
            if (parentComment) {
              return prevComments.map((comment) => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment],
                  };
                }
                return comment;
              });
            } else {
              // Nếu reply to một reply, thêm vào main comment
              return prevComments.map((comment) => {
                if (
                  comment.replies?.some((reply) => reply.id === parentCommentId)
                ) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment],
                  };
                }
                return comment;
              });
            }
          });
        } else {
          // Thêm comment mới vào đầu list
          setComments((prevComments) => [newComment, ...prevComments]);
        }

        // TODO: Uncomment khi API sẵn sàng
        // const commentRequest: CommentRequest = {
        //   content: content.trim(),
        //   senderId: userId,
        //   postId: postId,
        //   parentCommentId: parentCommentId || '',
        // };
        // await CommentService.createComment(commentRequest);
        // await loadComments();
      } catch (err) {
        console.error("Error adding comment:", err);
        setError("Failed to add comment");
        throw err;
      }
    },
    [userId]
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

      // Mock delete - remove comment từ state
      setComments((prevComments) =>
        prevComments
          .filter((comment) => comment.id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies?.filter((reply) => reply.id !== commentId),
          }))
      );

      // TODO: Uncomment khi API sẵn sàng
      // await CommentService.deleteComment(commentId);
      // await loadComments();
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
      throw err;
    }
  }, []);

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
    refreshComments,
  };
};
