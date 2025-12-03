import { Timestamp } from "firebase/firestore";
import { ExtendedMessageData } from "./messages";
import { CurrentUser } from "./user";

// Enum cho các loại tin nhắn
export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  FILE = "file",
  EMOJI = "emoji",
}

// Enum cho trạng thái tin nhắn
export enum MessageStatus {
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

// Enum cho loại chat
export enum ChatType {
  PRIVATE = "private", 
}

// Enum cho trạng thái người dùng
export enum UserStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  AWAY = "away",
  BUSY = "busy",
}

// Interface cho thông tin file đính kèm
export interface MediaAttachment {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width?: number; 
  height?: number; 
  duration?: number; 
}

export interface FirebaseMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string; 
  attachments?: MediaAttachment[];
  status: MessageStatus;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  isEdited: boolean;
  originalContent?: string; 
  replyToMessageId?: string; 
  reactions?: MessageReaction[]; 
  readBy?: MessageReadStatus[];
  isDeleted: boolean;
  deletedAt?: Timestamp;
  isRecalled: boolean;
  recalledAt?: Timestamp;
}

// Interface cho reaction tin nhắn
export interface MessageReaction {
  userId: string;
  userName: string;
  emoji: string;
  createdAt: Timestamp;
}

// Interface cho trạng thái đọc tin nhắn
export interface MessageReadStatus {
  userId: string;
  readAt: Timestamp;
}

// Interface cho phòng chat Firebase
export interface FirebaseChat {
  id: string;
  type: ChatType;
  participants: ChatParticipant[]; 
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    type: MessageType;
    timestamp: Timestamp;
  };
  isActive: boolean; 
  settings?: ChatSettings;
}

// Interface cho thành viên chat
export interface ChatParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: Timestamp;
  lastSeen?: Timestamp;
  isActive: boolean;
}

// Interface cho cài đặt chat
export interface ChatSettings {
  muteNotifications: boolean;
  messageDeleteTime?: number; 
  maxFileSize: number; 
  allowedFileTypes: string[];
}

// Interface cho trạng thái người dùng
export interface UserPresence {
  userId: string;
  status: UserStatus;
  lastSeen: Timestamp;
  isTyping: boolean;
  typingInChat?: string; 
}

// Interface cho thông báo typing
export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Timestamp;
}

// Interface cho push notification
export interface ChatNotification {
  id: string;
  chatId: string;
  messageId: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  createdAt: Timestamp;
  isRead: boolean;
  readAt?: Timestamp;
}

// Interface cho lịch sử tìm kiếm
export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  type: "user" | "message" | "chat";
  timestamp: Timestamp;
}

// Interface cho kết quả tìm kiếm
export interface SearchResult {
  type: "user" | "message" | "chat";
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  timestamp?: Timestamp;
  matchedText?: string; 
}

// Interface cho cài đặt chat của user
export interface UserChatSettings {
  userId: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
    showPreview: boolean;
  };
  privacy: {
    readReceipts: boolean;
    lastSeen: boolean;
    onlineStatus: boolean;
    allowAddToGroups: "everyone" | "contacts" | "nobody";
  };
  security: {
    twoStepVerification: boolean;
    blockedUsers: string[];
    autoDeleteMessages: boolean;
    autoDeleteDays: number;
  };
  appearance: {
    theme: "light" | "dark" | "auto";
    fontSize: "small" | "medium" | "large";
    chatWallpaper?: string;
  };
}

// Interface cho báo cáo
export interface ChatReport {
  id: string;
  reportedBy: string;
  reportedUser?: string;
  reportedMessage?: string;
  reportedChat?: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  resolvedBy?: string;
}

// Interface cho API calls
export interface SendMessageRequest {
  chatId: string;
  type: MessageType;
  content: string;
  attachments?: Omit<MediaAttachment, "id" | "url">[];
  replyToMessageId?: string;
}

export interface CreateChatRequest {
  type: ChatType;
  participantIds: string[]; // Luôn là 2 người
}

export interface UpdateMessageRequest {
  messageId: string;
  content?: string;
  status?: MessageStatus;
}

// Interface cho realtime events
export interface ChatEvent {
  type:
    | "message_sent"
    | "message_read"
    | "user_typing"
    | "user_joined"
    | "user_left"
    | "chat_updated";
  chatId: string;
  userId: string;
  data?: any;
  timestamp: Timestamp;
}

// Interface cho pagination
export interface MessagePagination {
  chatId: string;
  limit: number;
  before?: Timestamp;
  after?: Timestamp; 
}

export interface ChatPagination {
  userId: string;
  limit: number;
  lastChatId?: string;
}

// Interface cho analytics
export interface ChatAnalytics {
  chatId: string;
  totalMessages: number;
  totalParticipants: number;
  activeParticipants: number;
  messagesPerDay: Record<string, number>;
  topSenders: { userId: string; messageCount: number }[];
  mediaShared: number;
  averageResponseTime: number; 
}

export interface UseChatReturn {
  messages: ExtendedMessageData[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  sendImage: (imageUri: string) => Promise<void>;
  editMessage: (messageId: string, newText: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  recallMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string) => Promise<void>;
  changeReaction: (messageId: string, newEmoji: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  isTyping: boolean;
  setIsTyping: (typing: boolean) => void;
  otherUserTyping: boolean;
}

export interface UseChatProps {
  chatId: string;
  currentUser: CurrentUser;
  otherUserId: string;
}

export interface UseChatListProps {
  currentUser: CurrentUser;
}

export interface ChatListItem {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  timestamp: string;
  isOnline?: boolean;
  unreadCount?: number;
  otherUserId?: string; 
}

export interface UseChatListReturn {
  chats: ChatListItem[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  createChat: (otherUserId: string, otherUserName: string) => Promise<string>;
  searchUsers: (query: string) => Promise<any[]>;
  findExistingChat: (otherUserId: string) => ChatListItem | undefined;
}
