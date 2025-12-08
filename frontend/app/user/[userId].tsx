import React from "react";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import UserProfileScreen from "@/components/profile/UserProfileScreen";

export default function UserPage() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  if (!userId) return <Text>Không tìm thấy userId</Text>;

  return <UserProfileScreen userId={userId} />;
}
