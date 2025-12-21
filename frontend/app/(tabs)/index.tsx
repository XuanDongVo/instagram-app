import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { StoryBar } from "@/components/story/StoryBar";
import postService from "@/services/postService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PostCard from "@/components/post/PostCard";

type PostImage = { id: string; urlImage?: string; localSource?: any };
type UserSummary = {
  id: string;
  userName: string;
  fullName: string;
  profileImage?: string;
};
type Post = {
  id: string;
  content: string;
  createAt: string;
  images: PostImage[];
  comments: number;
  likes: number;
  liked: boolean;
  savedPost: boolean;
  user: UserSummary;
};

function HeaderBar() {
  const router = useRouter();

  return (
    <View style={styles.headerBar}>
      <Text style={styles.brandText}>Instagram</Text>
      <View style={{ flexDirection: "row", gap: 18, alignItems: "center" }}>
        <Feather name="heart" size={24} />
        <TouchableOpacity onPress={() => router.push("/messages")}>
          <Feather name="message-circle" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const scheme = useColorScheme() ?? "light";
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const userString = await AsyncStorage.getItem("currentUser");
      const user = userString ? JSON.parse(userString) : null;
      const currentUserId = user?.id || user?.userId;

      const response = await postService.getPost(currentUserId);
      if (response && Array.isArray(response.data)) {
        setPosts(response.data);
      } else if (Array.isArray(response)) {
        setPosts(response);
      }
    } catch (e) {
      console.error("Load posts error", e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  const listHeader = useMemo(
    () => (
      <View>
        <HeaderBar />
        <StoryBar />
        <View style={{ height: 8 }} />
      </View>
    ),
    []
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[scheme].background }]}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => <PostCard post={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: 0.5, backgroundColor: "#e5e5e5" }} />
          )}
        />
      )}
    </SafeAreaView>
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
});
