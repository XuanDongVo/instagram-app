import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../../types/post';
import { useComments } from '../../hooks/useComments';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';

interface CommentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  userId: string;
  initialComments?: Comment[];
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;

export default function CommentBottomSheet({
  visible,
  onClose,
  postId,
  userId,
  initialComments = [],
}: CommentBottomSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;

  const {
    comments,
    loading,
    error,
    loadComments,
    addComment,
    deleteComment,
  } = useComments({
    postId,
    userId,
    initialComments,
  });

  // Flatten comments và replies đệ quy để hiển thị cùng level
  const flattenComments = (comments: Comment[]): Comment[] => {
    const flattened: Comment[] = [];
    
    const processComment = (
      comment: Comment, 
      directParent?: Comment,  // Comment mà nó đang reply trực tiếp
      originalParent?: Comment // Comment gốc đầu tiên
    ) => {
      // Thêm comment hiện tại
      flattened.push({
        ...comment,
        isReply: !!directParent,
        parentComment: directParent, // Comment được reply trực tiếp
        originalParent: originalParent || directParent // Comment gốc đầu tiên
      });
      
      // Xử lý đệ quy tất cả replies
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => {
          processComment(
            reply, 
            comment, 
            originalParent || comment 
          );
        });
      }
    };
    
    comments.forEach(comment => {
      processComment(comment);
    });
    
    return flattened;
  };

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Load comments
      loadComments();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: BOTTOM_SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, loadComments]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: BOTTOM_SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setReplyingTo(null);
      setNewComment('');
    });
  };

  const handleSubmitComment = async (content: string, parentCommentId?: string) => {
    if (!content.trim()) return;

    try {
      await addComment(content.trim(), parentCommentId);
      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: gestureTranslateY } }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      
      if (translationY > 100 || velocityY > 500) {
        handleClose();
      } else {
        Animated.spring(gestureTranslateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <GestureHandlerRootView style={styles.container}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableOpacity 
            style={styles.overlayTouch} 
            activeOpacity={1} 
            onPress={handleClose}
          />
          
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
          >
            <Animated.View style={[
              styles.bottomSheet, 
              { 
                transform: [{ translateY }] 
              }
            ]}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Bình luận</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              {/* Drag Indicator */}
              <PanGestureHandler
                onGestureEvent={onPanGestureEvent}
                onHandlerStateChange={onPanHandlerStateChange}
              >
                <Animated.View style={[
                  styles.dragIndicatorContainer,
                  { transform: [{ translateY: gestureTranslateY }] }
                ]}>
                  <View style={styles.dragIndicator} />
                </Animated.View>
              </PanGestureHandler>

            <KeyboardAvoidingView
              style={styles.keyboardAvoid}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              {/* Comments List */}
              <ScrollView
                style={styles.commentsContainer}
                showsVerticalScrollIndicator={false}
              >
                {loading ? (
                  <View style={styles.emptyStateContainer}>
                    <Text style={styles.loadingText}>
                      Đang tải bình luận...
                    </Text>
                  </View>
                ) : comments.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Ionicons name="chatbubble-outline" size={48} color="#C4C4C4" />
                    <Text style={styles.emptyStateText}>
                      Chưa có bình luận nào.{'\n'}Hãy là người đầu tiên bình luận!
                    </Text>
                  </View>
                ) : (
                  flattenComments(comments).map((comment, index) => (
                    <CommentItem
                      key={`${comment.id || index}`}
                      comment={comment}
                      onReply={handleReply}
                      onDelete={handleDeleteComment}
                      currentUserId={userId}
                      isReply={(comment as any).isReply}
                      parentComment={(comment as any).parentComment}
                    />
                  ))
                )}
              </ScrollView>

              {/* Comment Input */}
              <CommentInput
                value={newComment}
                onChangeText={setNewComment}
                onSubmit={handleSubmitComment}
                replyingTo={replyingTo}
                onCancelReply={() => setReplyingTo(null)}
                placeholder={
                  replyingTo 
                    ? `Trả lời ${replyingTo.user?.userName || 'user'}...`
                    : "Viết bình luận..."
                }
              />
            </KeyboardAvoidingView>
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E1E1E1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#C4C4C4',
    borderRadius: 2,
  },
  keyboardAvoid: {
    flex: 1,
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  emptyStateText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});