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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import FollowerListModal from "../../components/profile/FollowerListModal";
import { profileService } from "../../services/profileService";
import { UserResponse } from "../../types/user";
import { ModalUser, UserProfileState } from "../../types/user";
import { router } from "expo-router";


// ===== STORY =====
import { useStory } from "@/hooks/useStory";
import { CreateStoryModal } from "@/components/story/CreateStoryModal";
import { StoryViewer } from "@/components/story/StoryViewer";
import { StoryResponse } from "@/types/story";

const screenWidth = Dimensions.get("window").width;

export default function UserProfileScreen() {
  const route = useRoute();
  const profileId = (route.params as { userId?: string })?.userId ?? null;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentUserIdLoaded, setIsCurrentUserIdLoaded] = useState(false);

  const [user, setUser] = useState<UserProfileState | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"grid">("grid");

  const isMyProfile = profileId === currentUserId;

  // ===== STORY HOOK =====
  const {
    stories,
    myStories,
    loading: storyLoading,
    currentUserId: storyCurrentUserId,
    createStory,
    viewStory,
    deleteStory,
    pickImage,
    pickVideo,
    loadStories,
    loadMyStories,
  } = useStory();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerStories, setViewerStories] = useState<StoryResponse[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isMyStoryViewer, setIsMyStoryViewer] = useState(false);

  const userStories = profileId
    ? stories.filter((s) => s.user.id === profileId)
    : [];

  const hasStories = isMyProfile
    ? myStories.length > 0
    : userStories.length > 0;

  const handleStoryPress = () => {
    if (isMyProfile) {
      if (myStories.length > 0) {
        setViewerStories(myStories);
        setViewerIndex(0);
        setIsMyStoryViewer(true);
        setShowViewer(true);
      } else {
        setShowCreateModal(true);
      }
    } else if (userStories.length > 0) {
      setViewerStories(userStories);
      setViewerIndex(0);
      setIsMyStoryViewer(false);
      setShowViewer(true);
    }
  };

  // ===== LOAD CURRENT USER =====
  useEffect(() => {
    const loadCurrentUserId = async () => {
      try {
        const currentUserString = await AsyncStorage.getItem("currentUser");
        if (currentUserString) {
          const cu = JSON.parse(currentUserString);
          setCurrentUserId(cu.id);
        }
      } finally {
        setIsCurrentUserIdLoaded(true);
      }
    };
    loadCurrentUserId();
  }, []);

  // ===== LOAD PROFILE =====
  const fetchProfileData = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    try {
      const data = await profileService.getUserProfile(profileId);

      setUser({
        id: data.userId,
        username: data.userName,
        fullName: data.fullName,
        bio: data.bio ?? "",
        avatar:
          data.avatarUrl ||
          "https://velle.vn/wp-content/uploads/2025/04/avatar-mac-dinh-4-2.jpg",
        followers: data.followersCount,
        following: data.followingCount,
      });

      setIsFollowing(data.following);

      const dummyPosts = Array.from({ length: 12 }).map((_, i) => ({
        id: i.toString(),
        imageUrl: `https://picsum.photos/id/${100 + i}/400/400`,
      }));
      setPosts(dummyPosts);
    } catch (e) {
      setFetchError("Không thể tải hồ sơ.");
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (isCurrentUserIdLoaded && profileId) {
      fetchProfileData();
    }
  }, [fetchProfileData, isCurrentUserIdLoaded, profileId]);

  // ===== LOAD STORIES =====
  useEffect(() => {
    if (storyCurrentUserId) {
      loadStories();
      loadMyStories();
    }
  }, [storyCurrentUserId]);

  const handleFollowToggle = async () => {
    if (!user || !currentUserId) return;

    if (isFollowing) {
      await profileService.unfollowUser(currentUserId, user.id);
      setIsFollowing(false);
      setUser((p) => (p ? { ...p, followers: p.followers - 1 } : p));
    } else {
      await profileService.followUser(currentUserId, user.id);
      setIsFollowing(true);
      setUser((p) => (p ? { ...p, followers: p.followers + 1 } : p));
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    </View>
  );

  if (isLoading || !isCurrentUserIdLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  if (fetchError || !user) {
    return (
      <View style={styles.center}>
        <Text>{fetchError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{user.username}</Text>

        {/* placeholder để căn giữa title */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleStoryPress}
          >
            {hasStories ? (
              userStories.every((s) => s.viewed) && !isMyProfile ? (
                <View style={styles.viewedRing}>
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                </View>
              ) : (
                <LinearGradient
                  colors={["#f77737", "#e91e63", "#8e44ad"]}
                  style={styles.gradientRing}
                >
                  <View style={styles.innerRing}>
                    <Image
                      source={{ uri: user.avatar }}
                      style={styles.avatar}
                    />
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
              <Text style={styles.statLabel}>posts</Text>
            </View>

            <TouchableOpacity onPress={() => setShowFollowers(true)}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.followers}</Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowFollowing(true)}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text style={styles.statLabel}>following</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.fullName}>{user.fullName}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          {!isMyProfile && (
            <TouchableOpacity
              style={[
                styles.followBtn,
                isFollowing ? styles.followingBtn : styles.followActive,
              ]}
              onPress={handleFollowToggle}
            >
              <Text
                style={[
                  styles.followBtnText,
                  isFollowing ? styles.followingText : styles.followText,
                ]}
              >
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tabButton, activeTab === "grid" && styles.activeTab]} onPress={() => setActiveTab("grid")}>
            <Ionicons name={activeTab === "grid" ? "grid" : "grid-outline"} size={24} color={activeTab === "grid" ? "#000" : "#8e8e8e"} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={posts}
          numColumns={3}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* ===== STORY MODALS ===== */}
      <CreateStoryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPickImage={pickImage}
        onPickVideo={pickVideo}
        onCreateStory={createStory}
        loading={storyLoading}
      />

      <StoryViewer
        visible={showViewer}
        stories={viewerStories}
        initialIndex={viewerIndex}
        onClose={() => setShowViewer(false)}
        onView={viewStory}
        onDelete={isMyStoryViewer ? deleteStory : undefined}
        isMyStory={isMyStoryViewer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", padding: 15 },
  avatarContainer: { marginRight: 30 },
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
  statNumber: { fontWeight: "600", fontSize: 17 },
  statLabel: { fontSize: 13 },

  infoSection: { paddingHorizontal: 15 },
  fullName: { fontWeight: "600", fontSize: 15 },
  bio: { marginTop: 5 },

  followBtn: {
    marginTop: 12,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
  },
  followActive: { backgroundColor: "#0095f6" },
  followingBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbdbdb",
  },
  followBtnText: { fontWeight: "600" },
  followText: { color: "#fff" },
  followingText: { color: "#000" },

  postItem: {
    width: (screenWidth - 2) / 3,
    height: (screenWidth - 2) / 3,
    margin: 0.5,
  },
  postImage: { width: "100%", height: "100%" },

  tabContainer: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dbdbdb", marginTop: 10 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 1, borderBottomColor: "#000" },
  usernameHeader: { fontWeight: "600", fontSize: 19 },
  topHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 15,
  paddingVertical: 10,
  borderBottomWidth: 0.5,
  borderBottomColor: "#ddd",
  backgroundColor: "#fff",
},

headerTitle: {
  fontSize: 16,
  fontWeight: "600",
},

});
