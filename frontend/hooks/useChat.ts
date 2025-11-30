import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { chatService } from "../services/chatService";
import { userFirebaseService } from "../services/userFirebaseService";
import { FirebaseMessage, MessageType, UserStatus } from "../types/chat";
import { ExtendedMessageData } from "../types/messages";
import { CurrentUser } from "../types/user";
import { UseChatReturn, UseChatProps, UseChatListProps, ChatListItem, UseChatListReturn} from "../types/chat";

// Helper function to format time
const formatInstagramTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInMinutes < 1) {
    return "now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks}w`;
  } else {
    // Show date format for older messages
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

// Helper function to safely convert Firebase timestamp
const safeToDate = (timestamp: any): Date => {
  if (!timestamp) {
    return new Date(); 
  }
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
};

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
      const createdAt = safeToDate(fbMessage.createdAt);
      const updatedAt = fbMessage.updatedAt
        ? safeToDate(fbMessage.updatedAt)
        : undefined;

      return {
        id: fbMessage.id,
        chatId: fbMessage.chatId,
        senderId: fbMessage.senderId,
        senderName: fbMessage.senderName,
        text: fbMessage.content,
        timestamp: formatInstagramTime(createdAt),
        isMe: fbMessage.senderId === (currentUser?.id || ""),
        avatar: fbMessage.senderAvatar,
        type: fbMessage.type,
        imageUrl: fbMessage.attachments?.[0]?.url,
        status: fbMessage.status,
        isEdited: fbMessage.isEdited,
        originalText: fbMessage.originalContent,
        createdAt: createdAt,
        updatedAt: updatedAt,
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
    [currentUser?.id]
  );

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = chatService.getChatMessages(
        {
          chatId,
          limit: 50,
        },
        (firebaseMessages) => {
          // Convert Firebase messages to ExtendedMessageData
          const convertedMessages = firebaseMessages.map(
            convertFirebaseMessage
          );

          // Sort messages by timestamp (cũ đến mới để hiển thị đúng trong chat)
          convertedMessages.sort((a, b) => {
            const aTime = a.createdAt?.getTime() || 0;
            const bTime = b.createdAt?.getTime() || 0;
            return aTime - bTime; // Từ cũ đến mới
          });

          setMessages(convertedMessages);
          setLoading(false);
        }
      );

      // Lưu unsubscribe function
      unsubscribeMessages.current = unsubscribe;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }

    return () => {
      if (unsubscribeMessages.current) {
        unsubscribeMessages.current();
        unsubscribeMessages.current = null;
      }
    };
  }, [chatId, convertFirebaseMessage]);

  // Listen to typing indicators
  useEffect(() => {
    if (!chatId || !currentUser?.id) return;

    try {
      const unsubscribe = chatService.listenToTypingIndicators(
        chatId,
        (typingUsers) => {
          // Kiểm tra xem có ai khác đang gõ không (không phải current user)
          const otherUserTyping = typingUsers.some(
            (user) => user.userId !== currentUser.id
          );
          setOtherUserTyping(otherUserTyping);
        }
      );

      unsubscribeTyping.current = unsubscribe;
    } catch (err) {
      console.error("Error listening to typing:", err);
    }

    return () => {
      if (unsubscribeTyping.current) {
        unsubscribeTyping.current();
        unsubscribeTyping.current = null;
      }
    };
  }, [chatId, currentUser?.id]);

  // Send text message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!currentUser?.id) {
        console.error("Cannot send message: user not authenticated");
        return;
      }

      try {
        setError(null);
        await chatService.sendMessage(
          currentUser.id,
          currentUser.fullName || currentUser.userName,
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
      if (!currentUser?.id) {
        console.error("Cannot send image: user not authenticated");
        return;
      }

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
          currentUser.fullName || currentUser.userName,
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
    if (!currentUser?.id) {
      return;
    }

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
  }, [messages, currentUser?.id]);

  // Handle typing status
  const handleTyping = useCallback(
    (typing: boolean) => {
      if (!currentUser?.id) {
        return;
      }

      setIsTyping(typing);

      // Clear existing timeout
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }

      // Update typing status
      chatService
        .updateTypingStatus(
          currentUser.id,
          currentUser.fullName || currentUser.userName,
          chatId,
          typing
        )
        .catch(console.error);

      // Auto-stop typing after 3 seconds
      if (typing) {
        typingTimeout.current = setTimeout(() => {
          setIsTyping(false);
          chatService
            .updateTypingStatus(
              currentUser.id,
              currentUser.fullName || currentUser.userName,
              chatId,
              false
            )
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

export function useChatList({
  currentUser,
}: UseChatListProps): UseChatListReturn {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load user chats
  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupChatListener = () => {
      try {
        setLoading(true);
        setError(null);

        // Get chats from Firebase với callback
        unsubscribe = chatService.getUserChats(
          currentUser.id,
          (firebaseChats) => {
            // Transform Firebase chats to ChatListItem
            const chatItems: ChatListItem[] = firebaseChats.map((chat) => {
              // Tìm participant khác (không phải current user)
              const otherParticipant = chat.participants?.find(
                (p) => p.userId !== currentUser.id
              );

              // Safely get timestamp for last message
              const lastMessageTime = chat.lastMessage?.timestamp
                ? safeToDate(chat.lastMessage.timestamp)
                : chat.updatedAt
                ? safeToDate(chat.updatedAt)
                : new Date();

              return {
                id: chat.id,
                name: otherParticipant?.userName || "Unknown User",
                lastMessage: chat.lastMessage?.content || "No messages yet",
                avatar: otherParticipant?.userAvatar || "",
                timestamp: formatInstagramTime(lastMessageTime), // Format kiểu Instagram
                isOnline: false, // TODO: Get from user presence
                unreadCount: 0, // TODO: Calculate unread count
                otherUserId: otherParticipant?.userId, // Lưu ID của user khác
              };
            });

            setChats(chatItems);
            setLoading(false);
          },
          {
            userId: currentUser.id,
            limit: 20,
          }
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load chats";
        setError(errorMessage);
        setLoading(false);
      }
    };

    setupChatListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.id]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    // Force re-run useEffect by updating a trigger state
    setError(null);
    setRefreshing(false);
  }, []);

  const createChat = useCallback(
    async (otherUserId: string, otherUserName: string): Promise<string> => {
      if (!currentUser || !currentUser.id) {
        throw new Error("User not authenticated");
      }

      try {
        // Kiểm tra xem đã có chat với user này chưa
        const existingChats = chats.filter(
          (chat) => chat.otherUserId === otherUserId
        );
        if (existingChats.length > 0) {
          // Trả về chat ID hiện có
          return existingChats[0].id;
        }

        // Tạo chat mới với đầy đủ tham số theo chatService
        const chatId = await chatService.createChat(
          currentUser.id,
          currentUser.fullName || currentUser.userName,
          otherUserId,
          otherUserName
        );

        // Chat list will auto-update via Firebase listener
        return chatId;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create chat";
        setError(errorMessage);
        throw err;
      }
    },
    [currentUser?.id, chats]
  );

  const searchUsers = useCallback(
    async (query: string) => {
      if (!currentUser || !currentUser.id) {
        return [];
      }

      try {
        return await userFirebaseService.searchUsers(query, currentUser.id);
      } catch (err) {
        console.error("Failed to search users:", err);
        return [];
      }
    },
    [currentUser?.id]
  );

  const findExistingChat = useCallback(
    (otherUserId: string): ChatListItem | undefined => {
      return chats.find((chat) => chat.otherUserId === otherUserId);
    },
    [chats]
  );

  return {
    chats,
    loading,
    error,
    refreshing,
    refresh,
    createChat,
    searchUsers,
    findExistingChat,
  };
}

// Hook for user presence
export function useUserPresence(currentUser: CurrentUser) {
  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      return;
    }

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

    // Listen for app state changes
    const { AppState } = require("react-native");
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      // Cleanup khi component unmount
      if (currentUser && currentUser.id) {
        chatService.updateUserPresence(currentUser.id, UserStatus.OFFLINE);
      }
      subscription?.remove();
    };
  }, [currentUser?.id]);
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
