import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../../types/comment';
import { Utils } from '@/utils/Utils';

interface CommentItemProps {
  comment: Comment;
  onReply: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onToggleLike: (commentId: string) => void;
  currentUserId: string;
  isReply?: boolean;
  parentComment?: Comment;
}

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

  const handleDelete = () => {
    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDelete(comment.id),
        },
      ]
    );
  };


  const isOwnComment = comment.sender.id === currentUserId;

  return (
    <View style={[styles.container, isReply && styles.replyContainer]}>
      {/* Avatar */}
      <TouchableOpacity>
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
            {comment.content}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.timeText}>
            {Utils.formatTimeFromString(comment.createdAt)}
          </Text>

          {comment.likesCount && comment.likesCount > 0 && (
            <Text style={styles.likesText}>
              {comment.likesCount} lượt thích
            </Text>
          )}

          {/* {!isReply && ( */}
            <TouchableOpacity
              onPress={() => onReply(comment)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>
                Trả lời
              </Text>
            </TouchableOpacity>
          {/* )} */}

          {isOwnComment && (
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteText}>
                Xóa
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Like button */}
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
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  messageContainer: {
    backgroundColor: '#F2F2F2',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  username: {
    fontWeight: '600',
    fontSize: 13,
    color: '#000',
    marginBottom: 2,
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
    marginTop: 8,
    paddingHorizontal: 12,
  },
  timeText: {
    color: '#888',
    fontSize: 12,
    marginRight: 16,
  },
  likesText: {
    color: '#888',
    fontSize: 12,
    marginRight: 16,
    fontWeight: '600',
  },
  actionButton: {
    marginRight: 16,
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