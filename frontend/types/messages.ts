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
  message: MessageData;
  onLongPress?: (message: MessageData) => void;
}

export interface ChatMessageListProps {
  messages: MessageData[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onMessageLongPress?: (message: MessageData) => void;
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
}

export interface MessageActionType {
  id: "edit" | "recall" | "delete";
  title: string;
  icon: string;
  color?: string;
}

export interface MessageActionModalProps {
  visible: boolean;
  message: MessageData | null;
  onClose: () => void;
  onEdit?: (message: MessageData) => void;
  onRecall?: (message: MessageData) => void;
  onDelete?: (message: MessageData) => void;
}
