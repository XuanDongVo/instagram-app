import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Comment } from '../../types/comment';

interface CommentInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: (content: string, parentCommentId?: string) => void;
  replyingTo: Comment | null;
  onCancelReply: () => void;
  placeholder?: string;
}

export default function CommentInput({
  value,
  onChangeText,
  onSubmit,
  replyingTo,
  onCancelReply,
  placeholder = "Viết bình luận...",
}: CommentInputProps) {
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;

    onSubmit(value.trim(), replyingTo?.id);
    onChangeText('');
    inputRef.current?.blur();
  };

  const handleCancelReply = () => {
    onCancelReply();
    inputRef.current?.blur();
  };

  return (
    <View style={styles.container}>
      {/* Reply indicator */}
      {replyingTo && (
        <View style={styles.replyIndicator}>
          <Text style={styles.replyText}>
            Đang trả lời {replyingTo.user.userName}
          </Text>
          
          <TouchableOpacity
            onPress={handleCancelReply}
            style={styles.cancelReplyButton}
          >
            <Ionicons name="close" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input area */}
      <View style={styles.inputArea}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={18} color="#888" />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#888"
            multiline
            style={styles.textInput}
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            blurOnSubmit={false}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!value.trim()}
          style={[styles.sendButton, { backgroundColor: value.trim() ? '#0095F6' : '#E1E1E1' }]}
        >
          <Ionicons
            name="send"
            size={16}
            color={value.trim() ? '#FFFFFF' : '#888'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: '#E1E1E1',
  },
  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
  },
  replyText: {
    color: '#666',
    fontSize: 13,
    flex: 1,
  },
  cancelReplyButton: {
    padding: 4,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 14,
    color: '#000',
    minHeight: 20,
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});