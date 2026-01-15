import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import FollowerListModal from "../../components/profile/FollowerListModal";
import { profileService } from "../../services/profileService";
import { UserResponse, ModalUser, UserProfileState } from "../../types/user";
import { PostService } from "@/services/postService";
import PostCard from "@/components/post/PostCard";

// ===== STORY =====
import { useStory } from "@/hooks/useStory";
import { StoryViewer } from "@/components/story/StoryViewer";
import { StoryResponse } from "@/types/story";
import { PostResponse } from "@/types/post";

const screenWidth = Dimensions.get("window").width;
const DEFAULT_AVATAR =
  "https://velle.vn/wp-content/uploads/2025/04/avatar-mac-dinh-4-2.jpg";

export default function UserProfileOtherScreen() {
  const route = useRoute();
  const profileId = (route.params as { userId?: string })?.userId ?? null;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfileState | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  const [myFollowingIds, setMyFollowingIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"grid" | "saved">("grid");

  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);

  const isMyProfile = profileId === currentUserId;

  // ================= LOAD CURRENT USER =================
  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("currentUser");
      if (raw) setCurrentUserId(JSON.parse(raw).id);
    };
    load();
  }, []);

  // ================= LOAD MY FOLLOWING =================
  useFocusEffect(
    useCallback(() => {
      if (!currentUserId) return;

      let active = true;

      const reloadMyFollowing = async () => {
        const list = await profileService.getFollowing(currentUserId);
        if (active) {
          setMyFollowingIds(new Set(list.map((u) => u.id)));
        }
      };

      reloadMyFollowing();

      return () => {
        active = false;
      };
    }, [currentUserId])
  );

  // ================= LOAD PROFILE =================
  const fetchProfile = useCallback(async () => {
    if (!profileId) return;

    setLoading(true);
    try {
      const data = await profileService.getUserProfile(profileId);

      setUser({
        id: data.userId,
        username: data.userName,
        fullName: data.fullName,
        bio: data.bio ?? "",
        avatar: data.avatarUrl || DEFAULT_AVATAR,
        followers: data.followersCount,
        following: data.followingCount,
      });

      setIsFollowing(data.following);

      const postRes = await PostService.getMinePost(profileId);
      console.log("Posts of profile:", postRes.data);
      setPosts(postRes.data);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (currentUserId && profileId) fetchProfile();
  }, [fetchProfile, currentUserId, profileId]);

  // ================= FOLLOW / UNFOLLOW =================
  const toggleFollow = async () => {
    if (!currentUserId || !user) return;

    if (isFollowing) {
      await profileService.unfollowUser(currentUserId, user.id);
      setIsFollowing(false);
      setUser((p) => p && { ...p, followers: p.followers - 1 });

      setMyFollowingIds((s) => {
        const n = new Set(s);
        n.delete(user.id);
        return n;
      });
    } else {
      await profileService.followUser(currentUserId, user.id);
      setIsFollowing(true);
      setUser((p) => p && { ...p, followers: p.followers + 1 });

      setMyFollowingIds((s) => new Set(s).add(user.id));
    }
  };

  // ================= MODAL FETCHERS =================
  const fetchFollowers = async (): Promise<ModalUser[]> => {
    if (!profileId) return [];

    const users: UserResponse[] =
      await profileService.getFollowers(profileId);

    return users.map((u) => ({
      id: u.id,
      username: u.userName,
      avatar: { uri: u.profileImage || DEFAULT_AVATAR },
      isFollowing: myFollowingIds.has(u.id),
    }));
  };

  const fetchFollowing = async (): Promise<ModalUser[]> => {
    if (!profileId) return [];

    const users: UserResponse[] =
      await profileService.getFollowing(profileId);

    return users.map((u) => ({
      id: u.id,
      username: u.userName,
      avatar: { uri: u.profileImage || DEFAULT_AVATAR },
      isFollowing: myFollowingIds.has(u.id),
    }));
  };

  // ================= STORY (CHỈ THÊM) =================
  const { stories, loadStories, viewStory } = useStory();

  const [showViewer, setShowViewer] = useState(false);
  const [viewerStories, setViewerStories] = useState<StoryResponse[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [])
  );

  const userStories = stories.filter(
    (s) => s.user?.id === profileId
  );

  const hasStories = userStories.length > 0;
  const allViewed = hasStories && userStories.every((s) => s.viewed);

  const handleStoryPress = () => {
    if (!hasStories) return;
    setViewerStories(userStories);
    setViewerIndex(0);
    setShowViewer(true);
  };

  // ================= UI =================
  if (loading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* PROFILE */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleStoryPress}>
            {hasStories ? (
              allViewed ? (
                <View style={styles.viewedRing}>
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                </View>
              ) : (
                <LinearGradient
                  colors={["#f77737", "#e91e63", "#8e44ad"]}
                  style={styles.gradientRing}
                >
                  <View style={styles.innerRing}>
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                  </View>
                </LinearGradient>
              )
            ) : (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            )}
          </TouchableOpacity>

          <View style={styles.stats}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text>posts</Text>
            </View>

            <TouchableOpacity onPress={() => setShowFollowers(true)}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.followers}</Text>
                <Text>followers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowFollowing(true)}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text>following</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.fullName}>{user.fullName}</Text>
          {!!user.bio && <Text>{user.bio}</Text>}

          {!isMyProfile && (
            <TouchableOpacity
              onPress={toggleFollow}
              style={[
                styles.followBtn,
                isFollowing ? styles.followingBtn : styles.followActive,
              ]}
            >
              <Text
                style={{
                  color: isFollowing ? "#000" : "#fff",
                  fontWeight: "600",
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* TAB */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "grid" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("grid")}
          >
            <Ionicons
              name="grid"
              size={24}
              color={activeTab === "grid" ? "#000" : "#8e8e8e"}
            />
          </TouchableOpacity>
        </View>

        {/* POSTS */}
        <FlatList
          data={posts}
          numColumns={3}
          keyExtractor={(i) => i.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedPost(item)}>
              <Image
                source={{ uri: item.images[0]?.urlImage }}
                style={styles.postImage}
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* FOLLOW MODALS */}
      <FollowerListModal
        visible={showFollowers}
        title="Followers"
        onClose={() => setShowFollowers(false)}
        fetchUsers={fetchFollowers}
        currentUserId={currentUserId!}
        isMyProfile={false}
      />

      <FollowerListModal
        visible={showFollowing}
        title="Following"
        onClose={() => setShowFollowing(false)}
        fetchUsers={fetchFollowing}
        currentUserId={currentUserId!}
        isMyProfile={false}
      />

      {/* STORY VIEWER */}
      <StoryViewer
        visible={showViewer}
        stories={viewerStories}
        initialIndex={viewerIndex}
        onClose={() => setShowViewer(false)}
        onView={viewStory}
        isMyStory={false}
      />

      <Modal visible={!!selectedPost} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedPost(null)}>
            <Ionicons name="arrow-back" size={28} />
          </TouchableOpacity>
          {selectedPost && <PostCard post={selectedPost} />}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  headerTitle: { fontWeight: "600", fontSize: 16 },

  header: { flexDirection: "row", padding: 15 },
  avatar: { width: 88, height: 88, borderRadius: 44 },

  gradientRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  innerRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fff",
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  viewedRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },

  stats: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  statBlock: { alignItems: "center" },
  statNumber: { fontWeight: "600", fontSize: 16 },

  infoSection: { paddingHorizontal: 15 },
  fullName: { fontWeight: "600" },

  followBtn: {
    marginTop: 10,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  followActive: { backgroundColor: "#0095f6" },
  followingBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  postImage: {
    width: screenWidth / 3,
    height: screenWidth / 3,
  },

  tabContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#dbdbdb",
    marginTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
});
