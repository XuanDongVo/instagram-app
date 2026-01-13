import { PostResponse } from "@/types";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState, useCallback, useEffect } from "react";
import { FlatList, Pressable, Text, TouchableOpacity, View, Dimensions, StyleSheet, Alert } from "react-native";
import CommentBottomSheet from "../../components/comments/CommentBottomSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PostService from "@/services/postService";

interface AdminPostCardProps {
  post: PostResponse;
  onDeleteSuccess: (postId: string) => void;
  onStatusChange: (postId: string, newStatus: string) => void;
}

export default function AdminPostCard({ post, onDeleteSuccess, onStatusChange }: AdminPostCardProps) {
  const [user, setUser] = useState<any>(null);
  const CURRENT_USER_ID = user?.id || user?.userId;

  const handleDelete = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn xóa bài viết này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await PostService.deletePost(post.id);
            onDeleteSuccess(post.id);
          } catch (e) {
            Alert.alert("Lỗi", "Không thể xóa bài viết.");
          }
        },
      },
    ]);
  };

  const handleHide = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn ẩn bài viết này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Ẩn",
        style: "destructive",
        onPress: async () => {
          try {
            await PostService.updatePostStatus(post.id, "hide");
            Alert.alert("Ẩn bài viết thành công.");
            onStatusChange(post.id, "HIDDEN");
          } catch (e) {
            Alert.alert("Lỗi", "Không thể ẩn bài viết.");
          }
        },
      },
    ]);
  };

  const handleActive = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn hiện lại bài viết này không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Hiện",
        style: "destructive",
        onPress: async () => {
          try {
            await PostService.updatePostStatus(post.id, "active");
            Alert.alert("Hiện bài viết thành công.");
            onStatusChange(post.id, "ACTIVE");
          } catch (e) {
            Alert.alert("Lỗi", "Không thể hiện bài viết.");
          }
        },
      },
    ]);
  };

  const formatPostTime = (dateString: string) => {
    const postDate = new Date(dateString);
    const now = new Date();

    // Kiểm tra xem có cùng ngày/tháng/năm không
    const isSameDay =
      postDate.getDate() === now.getDate() &&
      postDate.getMonth() === now.getMonth() &&
      postDate.getFullYear() === now.getFullYear();

    if (isSameDay) {
      // Tính số giờ chênh lệch
      const diffInMs = now.getTime() - postDate.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMins = Math.floor(diffInMs / (1000 * 60));

      if (diffInHours < 1) {
        return diffInMins <= 1 ? "Vừa xong" : `${diffInMins} phút trước`;
      }
      return `${diffInHours} giờ trước`;
    } else {
      // Nếu khác ngày, hiện định dạng dd/mm/yyyy
      const day = postDate.getDate().toString().padStart(2, "0");
      const month = (postDate.getMonth() + 1).toString().padStart(2, "0");
      const year = postDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("currentUser");
        if (userString) {
          setUser(JSON.parse(userString));
        }
      } catch (e) {
        console.error("Lỗi khi đọc AsyncStorage:", e);
      }
    };
    loadUser();
  }, []);

  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <View style={styles.card}>
      {/* Thanh công cụ dành riêng cho Admin */}
      <View style={styles.adminBar}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={[styles.adminBtn, styles.hideBtn]} onPress={handleActive}>
            <Text style={styles.btnText}>Hiện bài</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.adminBtn, styles.hideBtn]} onPress={handleHide}>
            <Text style={styles.btnText}>Ẩn bài</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.adminBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Text style={[styles.btnText, { color: "white" }]}>Xóa vĩnh viễn</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardHeader}>
        <Image source={{ uri: post.user.profileImage }} style={styles.cardAvatar} />
        <Text numberOfLines={1} style={styles.cardUser}>
          {post.user.userName}
        </Text>
        <View style={{ flex: 1 }} />
        <Feather name="more-horizontal" size={20} />
      </View>
      {post.images && post.images.length > 0 && (
        <View style={styles.cardImage}>
          <FlatList
            data={post.images.flat()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            // Thêm hàm này để cập nhật số trang
            onMomentumScrollEnd={(e) => {
              const offset = e.nativeEvent.contentOffset.x;
              const width = e.nativeEvent.layoutMeasurement.width;
              const newIndex = Math.floor(offset / width);
              setCurrentImageIndex(newIndex);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.urlImage }}
                style={{
                  flex: 1,
                  width: "100%",
                  aspectRatio: 1,
                }}
                contentFit="cover"
                transition={200}
              />
            )}
          />

          {post.images.length > 1 && (
            <View style={styles.imageBadge}>
              <Text style={styles.badgeText}>
                {currentImageIndex + 1}/{post.images.length}
              </Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.cardActions}></View>
      <View style={styles.cardMeta}>
        <Text style={styles.likeText}>Liked by {likeCount.toLocaleString()} others</Text>
        {post.content ? (
          <Text style={styles.captionText} numberOfLines={2}>
            <Text style={styles.cardUser}>{post.user.userName} </Text>
            {post.content}
            <Text style={{ color: "#737373" }}> more</Text>
          </Text>
        ) : null}
        <TouchableOpacity onPress={() => setShowComments(true)}>
          <Text style={styles.viewComments}>View all {post.comments} comments</Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>{formatPostTime(post.createAt)}</Text>
      </View>

      {/* Comment Bottom Sheet */}
      <CommentBottomSheet
        visible={showComments}
        onClose={() => setShowComments(false)}
        postId={post.id}
        userId={CURRENT_USER_ID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerBar: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  brandText: { fontSize: 28, fontWeight: "600" },
  iconBtn: { width: 22, height: 22 },
  card: { marginBottom: 16 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 10,
  },
  cardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
  },
  cardUser: { fontSize: 14, fontWeight: "600" },
  cardImage: { width: "100%", aspectRatio: 1, backgroundColor: "#eee" },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
  },
  cardMeta: { paddingHorizontal: 12, paddingVertical: 4, gap: 6 },
  likeText: { fontWeight: "600" },
  captionText: { fontSize: 14 },
  viewComments: { color: "#737373" },
  timestamp: { color: "#737373", fontSize: 12 },
  imageBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  adminBar: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  buttonGroup: { flexDirection: "row", gap: 8 },
  adminBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: "center",
  },
  hideBtn: { backgroundColor: "#e5e7eb" },
  deleteBtn: { backgroundColor: "#ef4444" },
  btnText: { fontSize: 12, fontWeight: "bold" },
});
