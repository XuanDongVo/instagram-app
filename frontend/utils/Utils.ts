import { Timestamp } from "firebase/firestore";
import { MessageType, UserStatus } from "../types/chat";



export class Utils {
  // Helper function to format time for data
  static formatTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
  
    if (diffInMinutes < 1) {
      return "bây giờ";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} phút`;
    } else if (diffInHours < 24) {
      return `${diffInHours} giờ`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày`;
    } else if (diffInWeeks < 4) {
      return `${diffInWeeks} tuần`;
    } else {
      // Show date format for older messages
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  // Helper function to format time from string (for API responses)
  static formatTimeFromString = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return Utils.formatTime(date);
    } catch (error) {
      console.error('Error parsing date string:', dateString, error);
      return dateString; // Fallback to original string
    }
  };


}