import { PostResponse } from "@/types";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
} from "react-native";
import CommentBottomSheet from "../../components/comments/CommentBottomSheet";

export default function PostCard({ post }: { post: PostResponse }) {
  const CURRENT_USER_ID =
    ((process.env as any).EXPO_PUBLIC_USER_ID as string) || "";
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.savedPost);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const toggleLike = useCallback(() => {
    setLiked((v) => {
      const next = !v;
      setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
      return next;
    });
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: post.user.profileImage }}
          style={styles.cardAvatar}
        />
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
                  width: Dimensions.get("window").width,
                  height: "100%",
                }}
                contentFit="cover"
                transition={200}
                placeholder={{ uri: "https://via.placeholder.com/300" }}
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
          <Pressable onPress={toggleLike} hitSlop={10}>
            <Feather
              name="heart"
              color={liked ? "#ef4444" : undefined}
              size={26}
            />
          </Pressable>
          <Pressable onPress={() => setShowComments(true)} hitSlop={10}>
            <Feather name="message-circle" size={26} />
          </Pressable>
          <Pressable hitSlop={10}>
            <Feather name="send" size={26} />
          </Pressable>
        </View>
        <Pressable onPress={() => setSaved((s) => !s)} hitSlop={10}>
          <Feather name="bookmark" size={26} />
        </Pressable>
      </View>
      <View style={styles.cardMeta}>
        <Text style={styles.likeText}>
          Liked by <Text style={{ fontWeight: "700" }}>thekamraan</Text> and{" "}
          {likeCount.toLocaleString()} others
        </Text>
        {post.content ? (
          <Text style={styles.captionText} numberOfLines={2}>
            <Text style={styles.cardUser}>{post.user.userName} </Text>
            {post.content}
            <Text style={{ color: "#737373" }}> more</Text>
          </Text>
        ) : null}
        <TouchableOpacity onPress={() => setShowComments(true)}>
          <Text style={styles.viewComments}>
            View all {post.comments} comments
          </Text>
        </TouchableOpacity>
        <Text style={styles.timestamp}>2 hours ago</Text>
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
