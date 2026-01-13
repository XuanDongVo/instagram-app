import React, { useState, useEffect, useCallback } from "react";
import { FlatList, View, ActivityIndicator, StyleSheet } from "react-native";
import AdminPostItem from "../../components/post/AdminPostItem";
import PostService from "@/services/postService";
import { PostResponse } from "@/types"; // Đảm bảo đã import đúng type này

export default function AdminPostsScreen() {
  // 1. Định nghĩa kiểu dữ liệu cho State là PostResponse[] thay vì never[]
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await PostService.getAllPost();

      // 2. Ép kiểu dữ liệu hoặc truy cập thông qua bản ghi đúng
      // Nếu ApiResponse của bạn định nghĩa data thay vì result, hãy dùng .data
      const data = (response as any).result || (response as any).data || [];
      setPosts(data);
    } catch (e) {
      console.error("Lỗi tải bài viết:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 3. Sửa kiểu dữ liệu cho postId là string
  const removePostFromList = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // 4. Sửa hàm cập nhật status với kiểu dữ liệu chuẩn
  const handleStatusChange = (postId: string, newStatus: string) => {
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, status: newStatus } : p)));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4338ca" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <AdminPostItem post={item} onStatusChange={handleStatusChange} onDeleteSuccess={removePostFromList} />
        )}
        keyExtractor={(item) => item.id.toString()}
        // Thêm tính năng kéo để làm mới
        onRefresh={loadPosts}
        refreshing={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
