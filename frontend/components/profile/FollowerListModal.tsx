import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { profileService } from "../../services/profileService";

interface ModalUser {
  id: string;
  username: string;
  avatar: any; // uri hoặc require
  isFollowing: boolean;
}

interface FollowerListModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  fetchUsers: () => Promise<ModalUser[]>;
  currentUserId: string;
  isMyFollowersList?: boolean; // true = followers, false = following
  isMyProfile?: boolean; // true = profile của chính mình
  onRemoveFollower?: (userId: string) => Promise<void>;
  onUnfollow?: (userId: string) => Promise<void>;
}

export default function FollowerListModal({
  visible,
  onClose,
  title,
  fetchUsers,
  currentUserId,
  isMyFollowersList = false,
  isMyProfile = false,
  onRemoveFollower,
  onUnfollow,
}: FollowerListModalProps) {
  const [listUsers, setListUsers] = useState<ModalUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      fetchUsers()
        .then((data) => setListUsers(data))
        .catch((err) => {
          console.error("Lỗi tải danh sách:", err);
          setListUsers([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setListUsers([]);
    }
  }, [visible, fetchUsers]);

  const handleFollowToggle = async (targetId: string, currentlyFollowing: boolean) => {
    setListUsers((prev) =>
      prev.map((u) =>
        u.id === targetId ? { ...u, isFollowing: !currentlyFollowing } : u
      )
    );

    try {
      if (currentlyFollowing) {
        await profileService.unfollowUser(currentUserId, targetId);
        onUnfollow?.(targetId);
      } else {
        await profileService.followUser(currentUserId, targetId);
      }
    } catch (e) {
      // revert nếu lỗi
      setListUsers((prev) =>
        prev.map((u) =>
          u.id === targetId ? { ...u, isFollowing: currentlyFollowing } : u
        )
      );
      Alert.alert("Lỗi", "Không thể thực hiện hành động.");
    }
  };

  const handleRemove = (userId: string, username: string) => {
    Alert.alert(
      "Xóa người theo dõi",
      `Xóa ${username} khỏi danh sách người theo dõi?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await profileService.removeFollower(currentUserId, userId);
              setListUsers((prev) => prev.filter((u) => u.id !== userId));
              onRemoveFollower?.(userId);
            } catch (e) {
              Alert.alert("Lỗi", "Không thể xóa follower.");
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: ModalUser }) => {
    const isMe = item.id === currentUserId;

    return (
      <View style={styles.userRow}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => {
            onClose(); // đóng modal
            router.push({
              pathname: "/user/[userId]",
              params: { userId: item.id },
            });
          }}
        >
          <Image source={item.avatar} style={styles.avatar} />
          <Text style={styles.username}>{item.username}</Text>
        </TouchableOpacity>

        {!isMe && (
          <>
            {isMyProfile ? (
              // Profile chính mình
              isMyFollowersList ? (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemove(item.id, item.username)}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.followButton,
                    item.isFollowing ? styles.followingButton : styles.activeFollowButton,
                  ]}
                  onPress={() => handleFollowToggle(item.id, item.isFollowing)}
                >
                  <Text
                    style={[
                      styles.followButtonText,
                      item.isFollowing ? styles.followingText : styles.activeFollowText,
                    ]}
                  >
                    {item.isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>
              )
            ) : (
              // Profile người khác
              <TouchableOpacity
                style={[
                  styles.followButton,
                  item.isFollowing ? styles.followingButton : styles.activeFollowButton,
                ]}
                onPress={() => handleFollowToggle(item.id, item.isFollowing)}
              >
                <Text
                  style={[
                    styles.followButtonText,
                    item.isFollowing ? styles.followingText : styles.activeFollowText,
                  ]}
                >
                  {item.isFollowing ? "Following" : "Follow"}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0095F6" />
            </View>
          ) : listUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có {title.toLowerCase()}</Text>
            </View>
          ) : (
            <FlatList
              data={listUsers}
              renderItem={renderUser}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    height: "80%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    justifyContent: "space-between",
  },
  title: { fontSize: 18, fontWeight: "600" },
  close: { fontSize: 32, color: "#888" },
  loadingContainer: { flex: 1, justifyContent: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },
  userRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  userInfo: { flexDirection: "row", flex: 1, alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  username: { fontSize: 15, fontWeight: "600" },

  // Follow Buttons
  followButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  activeFollowButton: { backgroundColor: "#0095f6" },
  followingButton: { backgroundColor: "#eee", borderWidth: 1, borderColor: "#ccc" },
  followButtonText: { fontSize: 14, fontWeight: "600" },
  activeFollowText: { color: "#fff" },
  followingText: { color: "#000" },

  // Remove
  removeButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  removeText: { fontSize: 14, fontWeight: "600" },
});
