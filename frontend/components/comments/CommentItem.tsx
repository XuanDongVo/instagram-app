import React, { useState } from 'react';
import CommentActionSheet from './CommentActionSheet';
import EditCommentModal from './EditCommentModal';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Utils } from '@/utils/Utils';
import { CommentItemProps } from '../../types/comment';
import { CommentService } from '@/services/commentService';

export default function CommentItem({
  comment,
  onReply,
  onDelete,
  onToggleLike,
  currentUserId,
  isReply = false,
  parentComment,
}: CommentItemProps) {
  const handleLike = () => {
    onToggleLike(comment.id);
  };

  const isOwnComment = comment.sender.id === currentUserId;
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [localContent, setLocalContent] = useState(comment.content);

  const handlePress = () => {
    if (isOwnComment) setShowActionSheet(true);
  };

  const handleSaveEdit = async (content: string, commentId: string) => {
    try {
      await CommentService.updateComment({ commentId, content });
      setLocalContent(content);
    } catch (error) {
      console.error('Lỗi khi sửa bình luận:', error);
    }
    setShowEditModal(false);
  };

  return (
    <>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={[styles.container, isReply && styles.replyContainer]}>
          {/* Avatar */}
          <TouchableOpacity activeOpacity={0.7}>
            {comment.sender.profileImage ? (
              <Image
                source={{ uri: comment.sender.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={18} color="#888" />
              </View>
            )}
          </TouchableOpacity>


          {/* Content */}
          <View style={styles.content}>
            {/* Username and content */}
            <View style={styles.messageContainer}>
              <Text style={styles.username}>
                {comment.sender.userName}
              </Text>
              <Text style={styles.messageText}>
                {isReply && parentComment && (
                  <Text style={styles.replyToText}>
                    @{parentComment.sender.userName}{' '}
                  </Text>
                )}
               {localContent}
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <Text style={styles.timeText}>
                {Utils.formatTimeFromString(comment.createdAt)}
              </Text>

              {/* Luôn hiển thị lượt thích, kể cả = 0 */}
              <Text style={styles.likesText}>
                {comment.likesCount || 0} lượt thích
              </Text>

              <TouchableOpacity
                onPress={() => onReply(comment)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>
                  Trả lời
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Like button và long press để xóa */}
          <TouchableOpacity
            onPress={handleLike}

            style={styles.likeButton}
          >
            <Ionicons
              name={comment.isLiked ? 'heart' : 'heart-outline'}
              size={12}
              color={comment.isLiked ? '#FF3040' : '#888'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {/* Custom Action Sheet cho comment của mình */}
      {isOwnComment && (
        <>
          <CommentActionSheet
            visible={showActionSheet}
            onEdit={() => {
              setShowActionSheet(false);
              setShowEditModal(true);
            }}
            onDelete={() => {
              setShowActionSheet(false);
              if (onDelete) onDelete(comment.id);
            }}
            onCancel={() => setShowActionSheet(false)}
          />
          <EditCommentModal
            visible={showEditModal}
            initialValue={comment.content}
            onSave={(newContent) => handleSaveEdit(newContent, comment.id)}
            onCancel={() => setShowEditModal(false)}
          />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  replyContainer: {
    marginLeft: 0,
    paddingVertical: 8,
    paddingLeft: 20,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  content: {
    flex: 1,
  },
  messageContainer: {
    // backgroundColor: '#F2F2F2',
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 6,
    // paddingVertical: 8,
    marginBottom: 8,
  },
  username: {
    fontWeight: '600',
    fontSize: 13,
    color: '#000',
  },
  messageText: {
    fontSize: 14,
    color: '#000',
    lineHeight: 18,
  },
  replyToText: {
    color: '#0095F6',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -3,
    paddingHorizontal: 12,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
    marginRight: 12,
  },
  likesText: {
    color: '#888',
    fontSize: 12,
    marginRight: 12,
    fontWeight: '600',
  },
  actionButton: {
    marginRight: 12,
  },
  actionText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteText: {
    color: '#FF3040',
    fontSize: 12,
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 8,
  },
  likeButton: {
    padding: 8,
    marginLeft: 8,
  },
});