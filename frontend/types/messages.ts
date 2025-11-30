import { MessageStatus, MessageType } from "./chat";

export interface MessageData {
  id: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  avatar?: string;
  type?: "text" | "image";
  imageUrl?: string;
  status?: "sent" | "delivered" | "read";
  isEdited?: boolean;
  originalText?: string;
}

// Cải tiến MessageData để tương thích với Firebase
export interface ExtendedMessageData
  extends Omit<MessageData, "type" | "status"> {
  chatId: string;
  senderId: string;
  senderName: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: Date;
  updatedAt?: Date;
  replyToMessageId?: string;
  reactions?: { userId: string; emoji: string }[];
  attachments?: { url: string; type: string; fileName?: string }[];
}

export interface UserData {
  id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}

export interface MessageItemProps {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  timestamp: string;
  isOnline?: boolean;
  hasCamera?: boolean;
  onPress?: () => void;
}

export interface ChatHeaderProps {
  userName: string;
  isOnline?: boolean;
  avatar?: string;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onInfo?: () => void;
}

export interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  onSelectImage?: () => void;
  onSelectCamera?: () => void;
  placeholder?: string;
}

export interface ChatMessageProps {
  message: ExtendedMessageData;
  onLongPress?: (message: ExtendedMessageData) => void;
}

export interface ChatMessageListProps {
  messages: ExtendedMessageData[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onMessageLongPress?: (message: ExtendedMessageData) => void;
}

export interface MessageHeaderProps {
  username: string;
  onVideoCall?: () => void;
  onNewMessage?: () => void;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearchChange?: (text: string) => void;
}

export interface MessageListProps {
  messages: MessageItemProps[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onItemPress?: (item: MessageItemProps) => void;
}

export interface MessageActionType {
  id: "edit" | "recall" | "delete";
  title: string;
  icon: string;
  color?: string;
}

export interface MessageActionModalProps {
  visible: boolean;
  message: ExtendedMessageData | null;
  onClose: () => void;
  onEdit?: (message: ExtendedMessageData) => void;
  onRecall?: (message: ExtendedMessageData) => void;
  onDelete?: (message: ExtendedMessageData) => void;
}
