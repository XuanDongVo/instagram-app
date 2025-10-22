import firestore from "@react-native-firebase/firestore";
import {
  FirebaseUser,
  FirebaseConversation,
  FirebaseMessage,
} from "../types/firebase";

export class FirebaseChatService {
  // ==================== USER METHODS ====================

  /**
   * Tạo hoặc cập nhật user trong Firestore
   */
  static async createUser(
    user: Omit<FirebaseUser, "createdAt" | "updatedAt">
  ): Promise<void> {
    const userRef = firestore().collection("users").doc(user.id);
    await userRef.set(
      {
        ...user,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  /**
   * Cập nhật trạng thái online/offline
   */
  static async updateUserOnlineStatus(
    userId: string,
    isOnline: boolean
  ): Promise<void> {
    const userRef = firestore().collection("users").doc(userId);
    await userRef.update({
      isOnline,
      lastSeen: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Lấy thông tin user theo ID
   */
  static async getUser(userId: string): Promise<FirebaseUser | null> {
    const userDoc = await firestore().collection("users").doc(userId).get();
    if (userDoc.exists) {
      return { id: userDoc.id, ...userDoc.data() } as FirebaseUser;
    }
    return null;
  }

  // ==================== CONVERSATION METHODS ====================

  static async createConversation(
    participants: string[],
    type: "direct" | "group" = "direct",
    title?: string
  ): Promise<string> {
    const conversationData: Omit<FirebaseConversation, "id" | "lastMessage"> = {
      participants,
      type,
      title,
      unreadCounts: participants.reduce((acc, userId) => {
        acc[userId] = 0;
        return acc;
      }, {} as Record<string, number>),
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await firestore()
      .collection("conversations")
      .add(conversationData);
    return docRef.id;
  }

  static subscribeToUserConversations(
    userId: string,
    callback: (conversations: FirebaseConversation[]) => void
  ): () => void {
    return firestore()
      .collection("conversations")
      .where("participants", "array-contains", userId)
      .orderBy("updatedAt", "desc")
      .onSnapshot((snapshot) => {
        const conversations: FirebaseConversation[] = [];
        snapshot.forEach((doc) => {
          conversations.push({
            id: doc.id,
            ...doc.data(),
          } as FirebaseConversation);
        });
        callback(conversations);
      });
  }

  // ==================== MESSAGE METHODS ====================

  static async sendTextMessage(
    conversationId: string,
    senderId: string,
    text: string,
    replyTo?: { messageId: string; text: string; senderId: string }
  ): Promise<string> {
    const messageData: Omit<FirebaseMessage, "id"> = {
      conversationId,
      senderId,
      type: "text",
      content: { text },
      timestamp: firestore.FieldValue.serverTimestamp(),
      status: "sent",
      isEdited: false,
      isRecalled: false,
      replyTo,
    };

    const messagesRef = firestore()
      .collection("conversations")
      .doc(conversationId)
      .collection("messages");
    const messageDoc = await messagesRef.add(messageData);

    await this.updateConversationLastMessage(conversationId, {
      id: messageDoc.id,
      text,
      senderId,
      timestamp: firestore.FieldValue.serverTimestamp(),
      type: "text",
    });

    return messageDoc.id;
  }

  static async sendImageMessage(
    conversationId: string,
    senderId: string,
    imageUrl: string,
    imageThumbnail: string,
    imageMetadata: {
      width: number;
      height: number;
      size: number;
      format: string;
    }
  ): Promise<string> {
    const messageData: Omit<FirebaseMessage, "id"> = {
      conversationId,
      senderId,
      type: "image",
      content: {
        imageUrl,
        imageThumbnail,
        imageMetadata,
        text: "📷 Hình ảnh",
      },
      timestamp: firestore.FieldValue.serverTimestamp(),
      status: "sent",
      isEdited: false,
      isRecalled: false,
    };

    const messagesRef = firestore()
      .collection("conversations")
      .doc(conversationId)
      .collection("messages");
    const messageDoc = await messagesRef.add(messageData);

    await this.updateConversationLastMessage(conversationId, {
      id: messageDoc.id,
      text: "📷 Hình ảnh",
      senderId,
      timestamp: firestore.FieldValue.serverTimestamp(),
      type: "image",
    });

    return messageDoc.id;
  }

  static subscribeToMessages(
    conversationId: string,
    callback: (messages: FirebaseMessage[]) => void,
    limitCount: number = 50
  ): () => void {
    return firestore()
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .orderBy("timestamp", "desc")
      .limit(limitCount)
      .onSnapshot((snapshot) => {
        const messages: FirebaseMessage[] = [];
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() } as FirebaseMessage);
        });
        callback(messages.reverse());
      });
  }

  static async editMessage(
    conversationId: string,
    messageId: string,
    newText: string
  ): Promise<void> {
    const messageRef = firestore()
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .doc(messageId);

    await messageRef.update({
      "content.text": newText,
      isEdited: true,
      editedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  static async recallMessage(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    const messageRef = firestore()
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .doc(messageId);

    await messageRef.update({
      isRecalled: true,
      "content.text": "Tin nhắn đã được thu hồi",
      "content.imageUrl": null,
    });
  }

  static async deleteMessage(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    const messageRef = firestore()
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .doc(messageId);
    await messageRef.delete();
  }

  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    const conversationRef = firestore()
      .collection("conversations")
      .doc(conversationId);
    await conversationRef.update({
      [`unreadCounts.${userId}`]: 0,
    });
  }

  private static async updateConversationLastMessage(
    conversationId: string,
    lastMessage: FirebaseConversation["lastMessage"]
  ): Promise<void> {
    const conversationRef = firestore()
      .collection("conversations")
      .doc(conversationId);
    await conversationRef.update({
      lastMessage,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }
}
