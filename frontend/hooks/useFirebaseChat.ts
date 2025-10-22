// import { useState, useEffect, useCallback } from "react";
// import { Alert } from "react-native";
// import { ChatService } from "../services/chat-service";
// import {
//   FirebaseMessage,
//   FirebaseConversation,
//   FirebaseUser,
// } from "../types/firebase";
// import { MessageData } from "../types/messages";

// interface ChatState {
//   messages: MessageData[];
//   conversation: FirebaseConversation | null;
//   users: { [userId: string]: FirebaseUser };
//   loading: boolean;
//   error: string | null;
// }

// export const useFirebaseChat = (
//   conversationId: string,
//   currentUserId: string
// ) => {
//   const [state, setState] = useState<ChatState>({
//     messages: [],
//     conversation: null,
//     users: {},
//     loading: false,
//     error: null,
//   });

//   // Convert Firebase Timestamp to readable time
//   const formatTimestamp = (timestamp: any): string => {
//     if (!timestamp) return "";

//     let date: Date;
//     if (timestamp.toDate) {
//       date = timestamp.toDate();
//     } else if (timestamp.seconds) {
//       date = new Date(timestamp.seconds * 1000);
//     } else {
//       date = new Date();
//     }

//     return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   };

//   // Convert Firebase message to UI message format
//   const convertFirebaseMessage = (
//     firebaseMessage: FirebaseMessage
//   ): MessageData => {
//     const isMe = firebaseMessage.senderId === currentUserId;

//     return {
//       id: firebaseMessage.id,
//       text: firebaseMessage.isRecalled
//         ? "Tin nhắn đã được thu hồi"
//         : firebaseMessage.content.text || "",
//       timestamp: formatTimestamp(firebaseMessage.timestamp),
//       isMe,
//       avatar: isMe
//         ? undefined
//         : state.users[firebaseMessage.senderId]?.profileImageUrl,
//       type: firebaseMessage.type,
//       imageUrl: firebaseMessage.content.imageUrl,
//       status: firebaseMessage.status,
//       isEdited: firebaseMessage.isEdited,
//       originalText: firebaseMessage.isEdited
//         ? firebaseMessage.content.text
//         : undefined,
//     };
//   };

//   // Subscribe to messages
//   useEffect(() => {
//     if (!conversationId) return;

//     setState((prev) => ({ ...prev, loading: true }));

//     const unsubscribe = ChatService.subscribeToMessages(
//       conversationId,
//       (firebaseMessages) => {
//         const convertedMessages = firebaseMessages.map(convertFirebaseMessage);
//         setState((prev) => ({
//           ...prev,
//           messages: convertedMessages,
//           loading: false,
//           error: null,
//         }));
//       }
//     );

//     return unsubscribe;
//   }, [conversationId, currentUserId, state.users]);

//   // Send text message
//   const sendMessage = useCallback(
//     async (text: string): Promise<void> => {
//       if (!text.trim() || !conversationId) return;

//       try {
//         setState((prev) => ({ ...prev, loading: true }));
//         await ChatService.sendTextMessage(
//           conversationId,
//           currentUserId,
//           text.trim()
//         );
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error ? error.message : "Failed to send message";
//         setState((prev) => ({ ...prev, error: errorMessage }));
//         Alert.alert("Lỗi", errorMessage);
//       } finally {
//         setState((prev) => ({ ...prev, loading: false }));
//       }
//     },
//     [conversationId, currentUserId]
//   );

//   // Edit message
//   const editMessage = useCallback(
//     async (messageId: string, newText: string): Promise<void> => {
//       if (!newText.trim() || !conversationId) return;

//       try {
//         await ChatService.editMessage(
//           conversationId,
//           messageId,
//           newText.trim()
//         );
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error ? error.message : "Failed to edit message";
//         Alert.alert("Lỗi", errorMessage);
//       }
//     },
//     [conversationId]
//   );

//   // Recall message
//   const recallMessage = useCallback(
//     async (messageId: string): Promise<void> => {
//       if (!conversationId) return;

//       try {
//         await ChatService.recallMessage(conversationId, messageId);
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error ? error.message : "Failed to recall message";
//         Alert.alert("Lỗi", errorMessage);
//       }
//     },
//     [conversationId]
//   );

//   // Delete message
//   const deleteMessage = useCallback(
//     async (messageId: string): Promise<void> => {
//       if (!conversationId) return;

//       try {
//         await ChatService.deleteMessage(conversationId, messageId);
//       } catch (error) {
//         const errorMessage =
//           error instanceof Error ? error.message : "Failed to delete message";
//         Alert.alert("Lỗi", errorMessage);
//       }
//     },
//     [conversationId]
//   );

//   // Mark messages as read
//   const markAsRead = useCallback(async (): Promise<void> => {
//     if (!conversationId) return;

//     try {
//       await ChatService.markMessagesAsRead(conversationId, currentUserId);
//     } catch (error) {
//       console.error("Failed to mark as read:", error);
//     }
//   }, [conversationId, currentUserId]);

//   return {
//     ...state,
//     sendMessage,
//     editMessage,
//     recallMessage,
//     deleteMessage,
//     markAsRead,
//   };
// };
