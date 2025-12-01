import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { getFirebaseApp } from "../firebaseConfig";

import {
  ChatPagination,
  ChatType,
  FirebaseChat,
  FirebaseMessage,
  MessagePagination,
  MessageStatus,
  SendMessageRequest,
  TypingIndicator,
  UserStatus
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
    currentUserName: string,
    otherUserId: string,
    otherUserName: string
  ): Promise<string> {
    // Kiểm tra tham số
    if (!currentUserId || !otherUserId) {
      throw new Error("Both user IDs are required");
    }

    if (currentUserId === otherUserId) {
      throw new Error("Cannot create chat with yourself");
    }

    // Tạo timestamp một lần để tái sử dụng
    const now = Timestamp.fromDate(new Date());
    
    const chatData: Omit<FirebaseChat, "id"> = {
      type: ChatType.PRIVATE,
      participants: [
        {
          userId: currentUserId,
          userName: currentUserName || "Unknown User",
          joinedAt: now, // Sử dụng timestamp đã tạo sẵn
          isActive: true,
        },
        {
          userId: otherUserId,
          userName: otherUserName || "Unknown User", 
          joinedAt: now, // Sử dụng timestamp đã tạo sẵn
          isActive: true,
        }
      ],
      createdBy: currentUserId,
      createdAt: serverTimestamp() as Timestamp, 
      updatedAt: serverTimestamp() as Timestamp,
      isActive: true,
      settings: {
        muteNotifications: false,
        maxFileSize: 10, 
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
   * Lấy danh sách chat của user (sử dụng callback thay vì return onSnapshot)
   */
  getUserChats(
    userId: string, 
    callback: (chats: (FirebaseChat & { id: string })[]) => void,
    pagination?: ChatPagination
  ) {
    // Query tất cả chat trước, rồi filter client-side
    // Vì Firebase không hỗ trợ array-contains với nested objects
    let q = query(
      collection(this.db, "chats"),
      limit(pagination?.limit || 20)
    );

    return onSnapshot(q, (snapshot) => {
      const chats: (FirebaseChat & { id: string })[] = [];
      snapshot.forEach((docSnap) => {
        const chatData = { id: docSnap.id, ...docSnap.data() } as FirebaseChat & {
          id: string;
        };
        
        // Filter client-side để check user có trong participants không
        const isUserInChat = chatData.participants?.some(
          participant => participant.userId === userId
        );
        
        if (isUserInChat) {
          chats.push(chatData);
        }
      });
      
      // Sort by updatedAt ở client-side
      chats.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime(); // Newest first
      });
      
      // Call callback với kết quả
      callback(chats);
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
      ...(currentUserAvatar && { senderAvatar: currentUserAvatar }), 
      type: request.type,
      content: request.content,
      ...(request.attachments && request.attachments.length > 0 && { 
        attachments: request.attachments.map((att) => ({
          id: "", // Sẽ được generate
          url: "", // Sẽ được upload
          ...att,
        }))
      }),
      status: MessageStatus.SENDING,
      createdAt: serverTimestamp() as Timestamp,
      isEdited: false,
      isRecalled: false, // Mặc định không bị thu hồi
      ...(request.replyToMessageId && { replyToMessageId: request.replyToMessageId }),
      reactions: [], // Empty array - không có serverTimestamp
      readBy: [],    // Empty array - không có serverTimestamp
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
      timestamp: Timestamp.fromDate(new Date()), 
    });

    return docRef.id;
  }

  /**
   * Lấy tin nhắn của chat 
   */
  getChatMessages(
    pagination: MessagePagination,
    currentUserId: string,
    callback: (messages: (FirebaseMessage & { id: string })[]) => void
  ) {
    let q = query(
      collection(this.db, "messages"),
      where("chatId", "==", pagination.chatId),
      limit(pagination.limit)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: (FirebaseMessage & { id: string })[] = [];
      snapshot.forEach((docSnap) => {
        const messageData = { id: docSnap.id, ...docSnap.data() } as FirebaseMessage & {
          id: string;
        };
        
        // Bỏ qua các tin nhắn đã bị xóa
        if (messageData.isDeleted) {
          return;
        }

        // Xử lý recall logic
        if (messageData.isRecalled && messageData.senderId === currentUserId) {
          // Người gửi thấy tin nhắn đã thu hồi (ẩn hoàn toàn)
          return; // Bỏ qua tin nhắn này
        }
        
        messages.push(messageData);
      });
      
      messages.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return aTime.getTime() - bTime.getTime();
      });
      
      callback(messages);
    });
  }

  /**
   * Cập nhật tin nhắn (edit)
   */
  async updateMessage(messageId: string, newContent: string): Promise<void> {
    console.log('chatService.updateMessage called with:', messageId, newContent);
    const messageRef = doc(this.db, "messages", messageId);
    console.log('Getting message snapshot...');
    const messageSnap = await getDoc(messageRef);

    if (messageSnap.exists()) {
      console.log('Message found, updating...');
      const originalContent = messageSnap.data().content;
      await updateDoc(messageRef, {
        content: newContent,
        isEdited: true,
        originalContent: originalContent,
        updatedAt: serverTimestamp(),
      });
      console.log('Message updated successfully');
    } else {
      console.error('Message not found with ID:', messageId);
      throw new Error('Message not found');
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
      content: "Tin nhắn đã được xóa ",
    });
  }

  /**
   * Thu hồi tin nhắn (người gửi sẽ thấy "Tin nhắn đã được thu hồi", người nhận vẫn thấy nội dung gốc)
   */
  async recallMessage(messageId: string): Promise<void> {
    const messageRef = doc(this.db, "messages", messageId);
    await updateDoc(messageRef, {
      isRecalled: true,
      recalledAt: serverTimestamp(),
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
      
      // Chỉ đánh dấu đọc tin nhắn từ người khác (không phải tin nhắn của mình)
      if (message.senderId === currentUserId) {
        return; // Không làm gì với tin nhắn của chính mình
      }
      
      const readBy = message.readBy || [];

      // Kiểm tra xem user đã đọc chưa
      const alreadyRead = readBy.some((r) => r.userId === currentUserId);
      if (!alreadyRead) {
        readBy.push({
          userId: currentUserId,
          readAt: Timestamp.fromDate(new Date()), 
        });

        await updateDoc(messageRef, {
          readBy: readBy,
          status: MessageStatus.READ,
        });
      }
    }
  }

  // ===== USER PRESENCE  =====

  /**
   * Cập nhật trạng thái online/offline trong users collection
   */
  async updateUserPresence(userId: string, status: UserStatus): Promise<void> {
    const userRef = doc(this.db, "users", userId);
    
    // Cập nhật trạng thái trong users collection 
    const updateData = {
      isOnline: status === UserStatus.ONLINE,
      lastSeen: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, updateData, { merge: true });
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
      // Sử dụng setDoc để tạo document nếu chưa có
      await setDoc(typingRef, {
        chatId,
        userId: userId,
        userName: userName,
        isTyping,
        timestamp: serverTimestamp(),
      });
    } else {
      // Xóa document typing khi user ngừng gõ
      try {
        await deleteDoc(typingRef);
      } catch (error) {
        // Document có thể không tồn tại, ignore error
        console.log('Typing document not found (normal):', error);
      }
    }
  }

  /**
   * Lắng nghe trạng thái typing trong chat
   */
  listenToTypingIndicators(
    chatId: string,
    callback: (typingUsers: TypingIndicator[]) => void
  ) {
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
      callback(typingUsers);
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
}

export const chatService = new ChatService();
