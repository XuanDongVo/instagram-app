import { Timestamp } from "firebase/firestore";
import { MessageType, UserStatus } from "../types/chat";

/**
 * Firebase Chat Utilities
 */

export class ChatUtils {
  /**
   * Chuyển đổi Firebase Timestamp thành Date
   */
  static timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  /**
   * Chuyển đổi Date thành Firebase Timestamp
   */
  static dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  /**
   * Format thời gian hiển thị
   */
  static formatMessageTime(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Vừa xong";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
  }

  /**
   * Format thời gian chi tiết (trong chat)
   */
  static formatDetailedTime(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() ===
      date.toDateString();

    const timeString = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return timeString;
    } else if (isYesterday) {
      return `Hôm qua ${timeString}`;
    } else {
      const dateString = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
      return `${dateString} ${timeString}`;
    }
  }

  /**
   * Tạo ID unique cho chat 1-1
   */
  static generatePrivateChatId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `private_${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Kiểm tra loại file
   */
  static getFileType(mimeType: string): MessageType {
    if (mimeType.startsWith("image/")) {
      return MessageType.IMAGE;
    } else if (mimeType.startsWith("audio/")) {
      return MessageType.AUDIO;
    } else {
      return MessageType.FILE;
    }
  }

  /**
   * Validate kích thước file
   */
  static validateFileSize(fileSize: number, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSize <= maxSizeBytes;
  }

  /**
   * Format kích thước file
   */
  static formatFileSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  /**
   * Lấy extension từ fileName
   */
  static getFileExtension(fileName: string): string {
    return fileName.split(".").pop()?.toLowerCase() || "";
  }

  /**
   * Kiểm tra file có được phép upload không
   */
  static isAllowedFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Tạo preview text cho tin nhắn cuối
   */
  static createMessagePreview(
    content: string,
    type: MessageType,
    senderName?: string
  ): string {
    const prefix = senderName ? `${senderName}: ` : "";

    switch (type) {
      case MessageType.IMAGE:
        return `${prefix}📷 Hình ảnh`;
      case MessageType.AUDIO:
        return `${prefix}🎵 Tin nhắn thoại`;
      case MessageType.FILE:
        return `${prefix}📎 File`;
      case MessageType.EMOJI:
        return `${prefix}${content}`;
      default:
        return `${prefix}${
          content.length > 50 ? content.substring(0, 50) + "..." : content
        }`;
    }
  }

  /**
   * Kiểm tra user có online không từ lastSeen
   */
  static isUserOnline(lastSeen: Timestamp, status: UserStatus): boolean {
    if (status === UserStatus.ONLINE) return true;
    if (status === UserStatus.OFFLINE) return false;

    // Kiểm tra lastSeen trong vòng 5 phút gần đây
    const now = new Date();
    const lastSeenDate = lastSeen.toDate();
    const diffInMs = now.getTime() - lastSeenDate.getTime();
    const diffInMinutes = diffInMs / (1000 * 60);

    return diffInMinutes <= 5;
  }

  /**
   * Tạo notification title và body
   */
  static createNotificationContent(
    senderName: string,
    messageContent: string,
    messageType: MessageType
  ) {
    const title = senderName;

    let body = "";
    switch (messageType) {
      case MessageType.IMAGE:
        body = `${senderName} đã gửi một hình ảnh`;
        break;
      case MessageType.AUDIO:
        body = `${senderName} đã gửi tin nhắn thoại`;
        break;
      case MessageType.FILE:
        body = `${senderName} đã gửi một file`;
        break;
      default:
        body = messageContent;
    }

    return { title, body };
  }

  /**
   * Debounce function cho typing indicator
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function cho scroll events
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Tạo placeholder avatar từ tên
   */
  static generateAvatarPlaceholder(name: string): string {
    const initials = name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();

    // Tạo màu background dựa trên tên
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#FFB6C1",
      "#20B2AA",
      "#87CEEB",
      "#F0E68C",
    ];

    const colorIndex = name.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" fill="${backgroundColor}" rx="20"/>
        <text x="20" y="28" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">${initials}</text>
      </svg>
    `)}`;
  }

  /**
   * Validate message content
   */
  static validateMessageContent(
    content: string,
    type: MessageType
  ): { isValid: boolean; error?: string } {
    if (type === MessageType.TEXT) {
      if (!content || content.trim().length === 0) {
        return { isValid: false, error: "Tin nhắn không được để trống" };
      }
      if (content.length > 1000) {
        return {
          isValid: false,
          error: "Tin nhắn không được vượt quá 1000 ký tự",
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Clean HTML và escape special characters
   */
  static sanitizeMessageContent(content: string): string {
    return content
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  /**
   * Parse emoji shortcodes (ví dụ: :smile: -> 😀)
   */
  static parseEmojis(content: string): string {
    const emojiMap: Record<string, string> = {
      ":smile:": "😀",
      ":heart:": "❤️",
      ":thumbsup:": "👍",
      ":thumbsdown:": "👎",
      ":fire:": "🔥",
      ":eyes:": "👀",
      // Thêm các emoji khác...
    };

    let parsedContent = content;
    Object.entries(emojiMap).forEach(([shortcode, emoji]) => {
      parsedContent = parsedContent.replace(new RegExp(shortcode, "g"), emoji);
    });

    return parsedContent;
  }
}

/**
 * Constants cho Firebase Chat
 */
export const CHAT_CONSTANTS = {
  MESSAGE_LIMIT_PER_LOAD: 20,
  MAX_FILE_SIZE_MB: 10,
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_TIMEOUT_MS: 3000,
  ONLINE_TIMEOUT_MINUTES: 5,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_AUDIO_TYPES: ["audio/mpeg", "audio/wav", "audio/ogg"],
  ALLOWED_FILE_TYPES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
} as const;

/**
 * Firebase Security Rules Templates (cho private chat only)
 */
export const FIREBASE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Private chat rules - chỉ 2 người tham gia mới có thể truy cập
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants.map(p => p.userId) &&
        resource.data.type == 'private';
    }
    
    // Message rules cho private chat
    match /messages/{messageId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/chats/$(resource.data.chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants.map(p => p.userId);
      
      allow create: if request.auth != null &&
        request.auth.uid == resource.data.senderId &&
        exists(/databases/$(database)/documents/chats/$(resource.data.chatId));
        
      allow update: if request.auth != null &&
        request.auth.uid == resource.data.senderId;
    }
    
    // Presence rules
    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Typing indicators
    match /typing/{typingId} {
      allow read, write: if request.auth != null;
    }
  }
}`;
