import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { chatService } from "../services/chatService";
import { userFirebaseService } from "../services/userFirebaseService";
import {
  ChatType,
  FirebaseMessage,
  MessageType,
  UserStatus,
} from "../types/chat";
import { ExtendedMessageData } from "../types/messages";

interface CurrentUser {
  id: string;
  name: string;
  avatar?: string;
  email: string;
}

interface UseChatProps {
  chatId: string;
  currentUser: CurrentUser;
  otherUserId: string;
}

interface UseChatReturn {
  messages: ExtendedMessageData[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  sendImage: (imageUri: string) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  recallMessage: (messageId: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  otherUserTyping: boolean;
}

export function useChat({
  chatId,
  currentUser,
  otherUserId,
}: UseChatProps): UseChatReturn {
  const [messages, setMessages] = useState<ExtendedMessageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const unsubscribeMessages = useRef<(() => void) | null>(null);
  const unsubscribeTyping = useRef<(() => void) | null>(null);
  const typingTimeout = useRef<number | null>(null);

  // Convert Firebase message to ExtendedMessageData
  const convertFirebaseMessage = useCallback(
    (fbMessage: FirebaseMessage & { id: string }): ExtendedMessageData => {
      return {
        id: fbMessage.id,
        chatId: fbMessage.chatId,
        senderId: fbMessage.senderId,
        senderName: fbMessage.senderName,
        text: fbMessage.content,
        timestamp: fbMessage.createdAt.toDate().toISOString(),
        isMe: fbMessage.senderId === currentUser.id,
        avatar: fbMessage.senderAvatar,
        type: fbMessage.type,
        imageUrl: fbMessage.attachments?.[0]?.url,
        status: fbMessage.status,
        isEdited: fbMessage.isEdited,
        originalText: fbMessage.originalContent,
        createdAt: fbMessage.createdAt.toDate(),
        updatedAt: fbMessage.updatedAt?.toDate(),
        replyToMessageId: fbMessage.replyToMessageId,
        reactions: fbMessage.reactions?.map((r) => ({
          userId: r.userId,
          emoji: r.emoji,
        })),
        attachments: fbMessage.attachments?.map((a) => ({
          url: a.url,
          type: a.mimeType,
          fileName: a.fileName,
        })),
      };
    },
    [currentUser.id]
  );

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;

    setLoading(true);

    try {
      const unsubscribe = chatService.getChatMessages({
        chatId,
        limit: 50,
      });

      // Mock implementation - replace with real Firebase listener
      unsubscribeMessages.current = () => {
        // Real implementation will be here
      };

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }

    return () => {
      if (unsubscribeMessages.current) {
        unsubscribeMessages.current();
      }
    };
  }, [chatId]);

  // Listen to typing indicators
  useEffect(() => {
    if (!chatId) return;

    try {
      const unsubscribe = chatService.listenToTypingIndicators(chatId);

      // Mock implementation
      unsubscribeTyping.current = () => {
        // Real implementation
      };
    } catch (err) {
      console.error("Error listening to typing:", err);
    }

    return () => {
      if (unsubscribeTyping.current) {
        unsubscribeTyping.current();
      }
    };
  }, [chatId, currentUser.id]);

  // Send text message
  const sendMessage = useCallback(
    async (text: string) => {
      try {
        setError(null);
        await chatService.sendMessage(
          currentUser.id,
          currentUser.name,
          currentUser.avatar,
          {
            chatId,
            type: MessageType.TEXT,
            content: text,
          }
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        throw err;
      }
    },
    [chatId, currentUser]
  );

  // Send image
  const sendImage = useCallback(
    async (imageUri: string) => {
      try {
        setError(null);

        // Create form data for upload
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: `image_${Date.now()}.jpg`,
        } as any);

        await chatService.sendMessage(
          currentUser.id,
          currentUser.name,
          currentUser.avatar,
          {
            chatId,
            type: MessageType.IMAGE,
            content: "Đã gửi một hình ảnh",
            attachments: [
              {
                fileName: `image_${Date.now()}.jpg`,
                fileSize: 0, // Will be calculated
                mimeType: "image/jpeg",
              },
            ],
          }
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send image";
        setError(errorMessage);
        throw err;
      }
    },
    [chatId, currentUser]
  );

  // Edit message
  const editMessage = useCallback(
    async (messageId: string, newText: string) => {
      try {
        setError(null);
        await chatService.updateMessage(messageId, newText);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to edit message";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  // Delete message (soft delete)
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await chatService.deleteMessage(messageId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete message";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Recall message (same as delete for now)
  const recallMessage = useCallback(async (messageId: string) => {
    try {
      setError(null);
      await chatService.deleteMessage(messageId);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to recall message";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    try {
      // Mark all unread messages as read
      const unreadMessages = messages.filter(
        (m) => !m.isMe && m.status !== "read"
      );
      await Promise.all(
        unreadMessages.map((m) =>
          chatService.markMessageAsRead(currentUser.id, m.id)
        )
      );
    } catch (err) {
      console.error("Failed to mark messages as read:", err);
    }
  }, [messages, currentUser.id]);

  // Handle typing status
  const handleTyping = useCallback(
    (typing: boolean) => {
      setIsTyping(typing);

      // Clear existing timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      // Update typing status
      chatService
        .updateTypingStatus(currentUser.id, currentUser.name, chatId, typing)
        .catch(console.error);

      // Auto-stop typing after 3 seconds
      if (typing) {
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
          chatService
            .updateTypingStatus(currentUser.id, currentUser.name, chatId, false)
            .catch(console.error);
        }, 3000);
      }
    },
    [chatId, currentUser]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
    sendImage,
    editMessage,
    deleteMessage,
    recallMessage,
    markAsRead,
    isTyping,
    setIsTyping: handleTyping,
    otherUserTyping,
  };
}

// Hook for chat list
interface UseChatListProps {
  currentUser: CurrentUser;
}

interface ChatListItem {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  timestamp: string;
  isOnline?: boolean;
  unreadCount?: number;
}

interface UseChatListReturn {
  chats: ChatListItem[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  createChat: (otherUserId: string) => Promise<string>;
  searchUsers: (query: string) => Promise<any[]>;
}

export function useChatList({
  currentUser,
}: UseChatListProps): UseChatListReturn {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load user chats
  useEffect(() => {
    loadChats();
  }, [currentUser.id]);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get chats from Firebase
      const unsubscribe = chatService.getUserChats(currentUser.id, {
        userId: currentUser.id,
        limit: 20,
      });

      // Mock implementation - replace with real listener
      // const mockChats = await getMockChats();
      // setChats(mockChats);

      setLoading(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load chats";
      setError(errorMessage);
      setLoading(false);
    }
  }, [currentUser.id]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  }, [loadChats]);

  const createChat = useCallback(
    async (otherUserId: string): Promise<string> => {
      try {
        const chatId = await chatService.createChat(currentUser.id, {
          type: ChatType.PRIVATE,
          participantIds: [currentUser.id, otherUserId],
        });

        // Refresh chat list
        await loadChats();

        return chatId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create chat";
        setError(errorMessage);
        throw err;
      }
    },
    [currentUser.id, loadChats]
  );

  const searchUsers = useCallback(
    async (query: string) => {
      try {
        return await userFirebaseService.searchUsers(query, currentUser.id);
      } catch (err) {
        console.error("Failed to search users:", err);
        return [];
      }
    },
    [currentUser.id]
  );

  return {
    chats,
    loading,
    error,
    refreshing,
    refresh,
    createChat,
    searchUsers,
  };
}

// Hook for user presence
export function useUserPresence(currentUser: CurrentUser) {
  useEffect(() => {
    // Set user online when app starts
    chatService
      .updateUserPresence(currentUser.id, UserStatus.ONLINE)
      .catch(console.error);

    // Set user offline when app goes to background
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "background" || nextAppState === "inactive") {
        chatService
          .updateUserPresence(currentUser.id, UserStatus.OFFLINE)
          .catch(console.error);
      } else if (nextAppState === "active") {
        chatService
          .updateUserPresence(currentUser.id, UserStatus.ONLINE)
          .catch(console.error);
      }
    };

    // Add app state listener if available
    // AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Set offline on cleanup
      chatService
        .updateUserPresence(currentUser.id, UserStatus.OFFLINE)
        .catch(console.error);

      // Remove listener
      // AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [currentUser.id]);
}

// Image picker utilities
export const useImagePicker = () => {
  const pickImage = useCallback(async (): Promise<string | null> => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return null;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }

      return null;
    } catch (err) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "Failed to pick image");
      return null;
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera is required!"
        );
        return null;
      }

      // Take photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets[0].uri;
      }

      return null;
    } catch (err) {
      console.error("Error taking photo:", err);
      Alert.alert("Error", "Failed to take photo");
      return null;
    }
  }, []);

  return {
    pickImage,
    takePhoto,
  };
};
