import { Timestamp } from "firebase/firestore";

// User interface
export interface FirebaseUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  profileImageUrl?: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  fcmToken?: string;
}

// Conversation interface
export interface FirebaseConversation {
  id: string;
  participants: string[];
  type: "direct" | "group";
  title?: string;
  imageUrl?: string;
  lastMessage: {
    id: string;
    text: string;
    senderId: string;
    timestamp: Timestamp;
    type: "text" | "image";
  };
  unreadCounts: {
    [userId: string]: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Message interface
export interface FirebaseMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: "text" | "image";
  content: {
    text?: string;
    imageUrl?: string;
    imageThumbnail?: string;
    imageMetadata?: {
      width: number;
      height: number;
      size: number;
      format: string;
    };
  };
  timestamp: Timestamp;
  status: "sent" | "delivered" | "read";
  editedAt?: Timestamp;
  isEdited: boolean;
  isRecalled: boolean;
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
  };
  reactions?: {
    [emoji: string]: string[];
  };
}

// Notification interface
export interface FirebaseNotification {
  id: string;
  userId: string;
  type: "message" | "mention" | "reaction";
  title: string;
  body: string;
  data: {
    conversationId?: string;
    messageId?: string;
    senderId?: string;
  };
  isRead: boolean;
  createdAt: Timestamp;
}
