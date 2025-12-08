import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { profileService } from "../../services/profileService";
import { UserProfileResponse } from "../../types/user";

interface Props {
  userId: string;
}

export default function UserProfileScreen({ userId }: Props) {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Lấy userId của chính user đang đăng nhập
  useEffect(() => {
    const fetchCurrentUserId = async () => {
      try {
        const id = await SecureStore.getItemAsync("userId");
        setCurrentUserId(id);
      } catch (err) {
        console.log("SecureStore error:", err);
      }
    };
    fetchCurrentUserId();
  }, []);

  // Lấy profile của userId được truyền vào
  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    setLoading(true);

    profileService
      .getUserProfile(userId)
      .then((data) => {
        if (mounted) {
          setProfile(data);
        }
      })
      .catch((err) => {
        console.log("Lỗi tải profile:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userId]);

  if (!currentUserId || loading || !profile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0095f6" />
        <Text style={{ marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  const isMe = profile.userId === currentUserId;

  const handleFollow = async () => {
    try {
      await profileService.followUser(currentUserId, profile.userId);
      setProfile({
        ...profile,
        following: true,
        followersCount: profile.followersCount + 1,
      });
    } catch (e) {
      console.log("Follow error:", e);
    }
  };

  const handleUnfollow = async () => {
    try {
      await profileService.unfollowUser(currentUserId, profile.userId);
      setProfile({
        ...profile,
        following: false,
        followersCount: profile.followersCount - 1,
      });
    } catch (e) {
      console.log("Unfollow error:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: profile.avatarUrl || undefined }} style={styles.avatar} />
      <Text style={styles.username}>{profile.userName}</Text>

      {!isMe && (
        <TouchableOpacity
          onPress={profile.following ? handleUnfollow : handleFollow}
          style={[styles.button, profile.following ? styles.followingBtn : styles.followBtn]}
        >
          <Text style={[styles.buttonText, profile.following && { color: "#000" }]}>
            {profile.following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", backgroundColor: "#fff", paddingTop: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10 },
  username: { fontSize: 22, fontWeight: "700", marginBottom: 14 },
  button: { paddingVertical: 8, paddingHorizontal: 28, borderRadius: 8 },
  followBtn: { backgroundColor: "#0095f6" },
  followingBtn: { backgroundColor: "#eee", borderWidth: 1, borderColor: "#ccc" },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
