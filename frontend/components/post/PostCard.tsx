import { PostResponse } from "@/types";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState, useCallback, useEffect } from "react";
import { FlatList, Pressable, Text, TouchableOpacity, View, Dimensions, StyleSheet } from "react-native";
import CommentBottomSheet from "../../components/comments/CommentBottomSheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LikeService } from "@/services/likeService";
import { savedPostService } from "@/services/savedPostService";
import { useRouter } from "expo-router";

export default function PostCard({ post }: { post: PostResponse }) {
  const [user, setUser] = useState<any>(null);
  const CURRENT_USER_ID = user?.id || user?.userId;

  // Load user from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("currentUser");
        console.log("User data:", userString);
        if (userString) {
          setUser(JSON.parse(userString));
        }
      } catch (e) {
        console.error("Lỗi khi đọc AsyncStorage:", e);
      }
    };
    loadUser();
  }, []);

  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.savedPost);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const toggleLike = useCallback(async (user_Id: string, post_Id: string) => {
    if (!liked) {
      await LikeService.likePost({ user_Id, post_Id });
    } else {
      await LikeService.unlikePost({ user_Id, post_Id });
    }
    setLiked((v) => {
      const next = !v;
      setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
      return next;
    });
  }, []);

  const toggleSaved = useCallback(async (userId: string, postId: string) => {
    if (!saved) {
      await savedPostService.savePost({ userId, postId });
    } else {
      await savedPostService.unsavePost({ userId, postId });
    }
    setSaved((v) => !v);
  }, []);

  const router = useRouter(); // 2. Khởi tạo router

  const handleGoToProfile = () => {
    // 3. Điều hướng sang trang user khác
    router.push({
      pathname: "/user/[userId]" ,
      params: { userId: post.user.id }, 
    });
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
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={handleGoToProfile}>
          <Image
            source={{ uri: post.user.profileImage }}
            style={styles.cardAvatar}
          />
        </TouchableOpacity>
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
      <View style={styles.cardActions}>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Pressable onPress={() => toggleLike(CURRENT_USER_ID, post.id)} hitSlop={10}>
            <Feather name="heart" color={liked ? "#ef4444" : undefined} size={26} />
          </Pressable>
          <Pressable onPress={() => setShowComments(true)} hitSlop={10}>
            <Feather name="message-circle" size={26} />
          </Pressable>
          <Pressable hitSlop={10}>
            <Feather name="send" size={26} />
          </Pressable>
        </View>
        <Pressable onPress={() => toggleSaved(CURRENT_USER_ID, post.id)} hitSlop={10}>
          <Feather name="bookmark" color={saved ? "#f59e0b" : undefined} size={26} />
        </Pressable>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.likeText}>
          Liked by <Text style={{ fontWeight: "700" }}>thekamraan</Text> and {likeCount.toLocaleString()} others
        </Text>
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
});
