import { UserSearchResponse } from "./user";

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

export interface UserSearchItemProps {
  user: UserSearchResponse;
  currentUserId?: string | null;
  onPress: (userId: string) => void;
}