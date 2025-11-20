import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseApp } from "../firebaseConfig";

import {
  ChatPagination,
  ChatParticipant,
  ChatType,
  CreateChatRequest,
  FirebaseChat,
  FirebaseMessage,
  MessagePagination,
  MessageStatus,
  SendMessageRequest,
  TypingIndicator,
  UserStatus,
} from "../types/chat";

class ChatService {
  private db;
  private storage;

  constructor() {
    const app = getFirebaseApp();
    this.db = getFirestore(app);
    this.storage = getStorage(app);
  }

  // ===== CHAT MANAGEMENT =====

  /**
   * Tạo chat mới (chỉ private chat 1-1)
   */
  async createChat(
    currentUserId: string,
    request: CreateChatRequest
  ): Promise<string> {
    // Kiểm tra chỉ có 2 người tham gia
    if (request.participantIds.length !== 2) {
      throw new Error("Private chat must have exactly 2 participants");
    }

    // Kiểm tra currentUserId có trong participants không
    if (!request.participantIds.includes(currentUserId)) {
      throw new Error("Current user must be in participants");
    }

    const chatData: Omit<FirebaseChat, "id"> = {
      type: ChatType.PRIVATE,
      participants: request.participantIds.map(
        (userId) =>
          ({
            userId,
            userName: "", // Sẽ được update sau
            joinedAt: serverTimestamp() as Timestamp,
            isActive: true,
          } as ChatParticipant)
      ),
      createdBy: currentUserId,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      isActive: true,
      settings: {
        muteNotifications: false,
        maxFileSize: 10, // 10MB
        allowedFileTypes: [
          "image/jpeg",
          "image/png",
          "image/gif",
          "audio/mpeg",
        ],
      },
    };

    const docRef = await addDoc(collection(this.db, "chats"), chatData);
    return docRef.id;
  }

  /**
   * Lấy danh sách chat của user
   */
  getUserChats(userId: string, pagination?: ChatPagination) {
    let q = query(
      collection(this.db, "chats"),
      where("participants", "array-contains-any", [userId]),
      where("isActive", "==", true),
      orderBy("updatedAt", "desc"),
      limit(pagination?.limit || 20)
    );

    if (pagination?.lastChatId) {
      const lastChatDoc = doc(this.db, "chats", pagination.lastChatId);
      q = query(q, startAfter(lastChatDoc));
    }

    return onSnapshot(q, (snapshot) => {
      const chats: (FirebaseChat & { id: string })[] = [];
      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as FirebaseChat & {
          id: string;
        });
      });
      return chats;
    });
  }

  /**
   * Lấy thông tin chi tiết một chat
   */
  async getChatDetails(chatId: string): Promise<FirebaseChat | null> {
    const docRef = doc(this.db, "chats", chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseChat & {
        id: string;
      };
    }
    return null;
  }

  // ===== MESSAGE MANAGEMENT =====

  /**
   * Gửi tin nhắn
   */
  async sendMessage(
    currentUserId: string,
    currentUserName: string,
    currentUserAvatar: string | undefined,
    request: SendMessageRequest
  ): Promise<string> {
    const messageData: Omit<FirebaseMessage, "id"> = {
      chatId: request.chatId,
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      type: request.type,
      content: request.content,
      attachments: request.attachments?.map((att) => ({
        id: "", // Sẽ được generate
        url: "", // Sẽ được upload
        ...att,
      })),
      status: MessageStatus.SENDING,
      createdAt: serverTimestamp() as Timestamp,
      isEdited: false,
      replyToMessageId: request.replyToMessageId,
      reactions: [],
      readBy: [],
      isDeleted: false,
    };

    // Upload attachments nếu có
    if (request.attachments && request.attachments.length > 0) {
      messageData.attachments = await this.uploadAttachments(
        request.attachments,
        request.chatId
      );
    }

    const docRef = await addDoc(collection(this.db, "messages"), messageData);

    // Update trạng thái thành SENT
    await updateDoc(docRef, {
      status: MessageStatus.SENT,
    });

    // Update last message của chat
    await this.updateChatLastMessage(request.chatId, {
      id: docRef.id,
      content: request.content,
      senderId: currentUserId,
      senderName: currentUserName,
      type: request.type,
      timestamp: serverTimestamp() as Timestamp,
    });

    return docRef.id;
  }

  /**
   * Lấy tin nhắn của chat với pagination
   */
  getChatMessages(pagination: MessagePagination) {
    let q = query(
      collection(this.db, "messages"),
      where("chatId", "==", pagination.chatId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(pagination.limit)
    );

    if (pagination.before) {
      q = query(q, where("createdAt", "<", pagination.before));
    }
    if (pagination.after) {
      q = query(q, where("createdAt", ">", pagination.after));
    }

    return onSnapshot(q, (snapshot) => {
      const messages: (FirebaseMessage & { id: string })[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as FirebaseMessage & {
          id: string;
        });
      });
      return messages.reverse(); // Để hiển thị từ cũ đến mới
    });
  }

  /**
   * Cập nhật tin nhắn (edit)
   */
  async updateMessage(messageId: string, newContent: string): Promise<void> {
    const messageRef = doc(this.db, "messages", messageId);
    const messageSnap = await getDoc(messageRef);

    if (messageSnap.exists()) {
      const originalContent = messageSnap.data().content;
      await updateDoc(messageRef, {
        content: newContent,
        isEdited: true,
        originalContent: originalContent,
        updatedAt: serverTimestamp(),
      });
    }
  }

  /**
   * Xóa tin nhắn
   */
  async deleteMessage(messageId: string): Promise<void> {
    const messageRef = doc(this.db, "messages", messageId);
    await updateDoc(messageRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      content: "Tin nhắn đã được thu hồi",
    });
  }

  /**
   * Đánh dấu tin nhắn đã đọc
   */
  async markMessageAsRead(
    currentUserId: string,
    messageId: string
  ): Promise<void> {
    const messageRef = doc(this.db, "messages", messageId);
    const messageSnap = await getDoc(messageRef);

    if (messageSnap.exists()) {
      const message = messageSnap.data() as FirebaseMessage;
      const readBy = message.readBy || [];

      // Kiểm tra xem user đã đọc chưa
      const alreadyRead = readBy.some((r) => r.userId === currentUserId);
      if (!alreadyRead) {
        readBy.push({
          userId: currentUserId,
          readAt: serverTimestamp() as Timestamp,
        });

        await updateDoc(messageRef, {
          readBy: readBy,
          status: MessageStatus.READ,
        });
      }
    }
  }

  // ===== USER PRESENCE =====

  /**
   * Cập nhật trạng thái online/offline
   */
  async updateUserPresence(userId: string, status: UserStatus): Promise<void> {
    const presenceData = {
      userId: userId,
      status,
      lastSeen: serverTimestamp(),
      isTyping: false,
    };

    const presenceRef = doc(this.db, "presence", userId);
    await updateDoc(presenceRef, presenceData);
  }

  /**
   * Cập nhật trạng thái đang typing
   */
  async updateTypingStatus(
    userId: string,
    userName: string,
    chatId: string,
    isTyping: boolean
  ): Promise<void> {
    const typingRef = doc(this.db, "typing", `${chatId}_${userId}`);
    if (isTyping) {
      await updateDoc(typingRef, {
        chatId,
        userId: userId,
        userName: userName,
        isTyping,
        timestamp: serverTimestamp(),
      });
    } else {
      await deleteDoc(typingRef);
    }
  }

  /**
   * Lắng nghe trạng thái typing trong chat
   */
  listenToTypingIndicators(chatId: string) {
    const q = query(
      collection(this.db, "typing"),
      where("chatId", "==", chatId),
      where("isTyping", "==", true)
    );

    return onSnapshot(q, (snapshot) => {
      const typingUsers: TypingIndicator[] = [];
      snapshot.forEach((doc) => {
        typingUsers.push(doc.data() as TypingIndicator);
      });
      return typingUsers;
    });
  }

  // ===== UTILITY METHODS =====

  /**
   * Upload file attachments (chỉ hỗ trợ ảnh và audio)
   */
  private async uploadAttachments(attachments: any[], chatId: string) {
    const uploadPromises = attachments.map(async (attachment, index) => {
      // Kiểm tra loại file cho phép
      if (
        !attachment.mimeType.startsWith("image/") &&
        !attachment.mimeType.startsWith("audio/")
      ) {
        throw new Error("Chỉ hỗ trợ ảnh và file âm thanh");
      }

      const fileName = `${chatId}/${Date.now()}_${index}_${
        attachment.fileName
      }`;
      const storageRef = ref(this.storage, `chat-attachments/${fileName}`);

      // Giả sử attachment.file là File object
      const snapshot = await uploadBytes(storageRef, attachment.file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        id: `${Date.now()}_${index}`,
        url: downloadURL,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration,
      };
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Cập nhật tin nhắn cuối cùng của chat
   */
  private async updateChatLastMessage(
    chatId: string,
    lastMessage: any
  ): Promise<void> {
    const chatRef = doc(this.db, "chats", chatId);
    await updateDoc(chatRef, {
      lastMessage,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Cleanup khi component unmount
   */
  cleanup(userId?: string) {
    // Xóa typing indicators
    if (userId) {
      // Có thể thêm logic cleanup ở đây
    }
  }
}

export const chatService = new ChatService();
