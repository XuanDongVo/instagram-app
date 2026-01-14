import { userFirebaseService } from "@/services/userFirebaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import FollowerListModal from "../../components/profile/FollowerListModal";
import { profileService } from "../../services/profileService";
import { UserResponse, ModalUser, UserProfileState } from "../../types/user";
import { Ionicons } from "@expo/vector-icons";
import { savedPostService } from "@/services/savedPostService";
import { CreateStoryModal } from "@/components/story/CreateStoryModal";
import { StoryViewer } from "@/components/story/StoryViewer";
import { useStory } from "@/hooks/useStory";
import { StoryResponse } from "@/types/story";
import { LinearGradient } from "expo-linear-gradient";
import PostService from "@/services/postService";
import { PostResponse } from "@/types";
import PostCard from "@/components/post/PostCard";

const screenWidth = Dimensions.get("window").width;
const DEFAULT_AVATAR =
  "https://velle.vn/wp-content/uploads/2025/04/avatar-mac-dinh-4-2.jpg";

export default function Profile() {
  /** ================= AUTH ================= */
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentUserIdLoaded, setIsCurrentUserIdLoaded] = useState(false);

  /** ================= PROFILE ================= */
  const [user, setUser] = useState<UserProfileState | null>(null);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  /** ================= UI ================= */
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"grid" | "saved">("grid");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  /** ================= POST MODAL ================= */
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);

  /** ================= STORY ================= */
  const {
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

  /** ================= LOAD CURRENT USER ================= */
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const str = await AsyncStorage.getItem("currentUser");
        if (str) {
          const cu = JSON.parse(str);
          setCurrentUserId(cu.id);
        }
      } finally {
        setIsCurrentUserIdLoaded(true);
      }
    };
    loadCurrentUser();
  }, []);

  /** ================= FETCH PROFILE ================= */
  const fetchMyProfile = useCallback(async () => {
    if (!currentUserId) return;
    setIsLoading(true);
    setFetchError(null);

    try {
      const profile = await profileService.getUserProfile(currentUserId);

      setUser({
        id: profile.userId,
        username: profile.userName,
        fullName: profile.fullName,
        bio: profile.bio ?? "",
        avatar: profile.avatarUrl || DEFAULT_AVATAR,
        followers: profile.followersCount,
        following: profile.followingCount,
      });

      const postRes = await PostService.getMinePost(currentUserId);
      setPosts(postRes.data);
    } catch (e) {
      setFetchError("Không thể tải hồ sơ.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      if (isCurrentUserIdLoaded && currentUserId) {
        fetchMyProfile();
      }
    }, [isCurrentUserIdLoaded, currentUserId, fetchMyProfile])
  );

  /** ================= STORIES ================= */
  useFocusEffect(
    useCallback(() => {
      if (storyCurrentUserId) {
        loadStories();
        loadMyStories();
      }
    }, [storyCurrentUserId])
  );

  const handleStoryPress = () => {
    if (myStories.length > 0) {
      setViewerStories(myStories);
      setViewerIndex(0);
      setShowViewer(true);
    } else {
      setShowCreateModal(true);
    }
  };

  /** ================= FOLLOWERS / FOLLOWING ================= */
  const fetchFollowers = async (): Promise<ModalUser[]> => {
    if (!currentUserId) return [];
    const users: UserResponse[] = await profileService.getFollowers(currentUserId);
    return users.map((u) => ({
      id: u.id,
      username: u.userName,
      avatar: { uri: u.profileImage || DEFAULT_AVATAR },
      isFollowing: true,
    }));
  };

  const fetchFollowing = async (): Promise<ModalUser[]> => {
    if (!currentUserId) return [];
    const users: UserResponse[] = await profileService.getFollowing(currentUserId);
    return users.map((u) => ({
      id: u.id,
      username: u.userName,
      avatar: { uri: u.profileImage || DEFAULT_AVATAR },
      isFollowing: true,
    }));
  };

  /** ================= SAVED POSTS ================= */
  const fetchSavedPosts = async () => {
    if (!currentUserId) return;
    const saved = await savedPostService.getSavedPostsByUserId(currentUserId);
    setPosts(saved.map((sp) => ({ ...sp, images: sp.images })));
  };

  /** ================= LOGOUT ================= */
  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      const str = await AsyncStorage.getItem("currentUser");
      if (str) {
        const cu = JSON.parse(str);
        await userFirebaseService.setUserOffline(cu.id);
      }
    } finally {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "currentUser"]);
      router.replace("/login");
    }
  };

  /** ================= RENDER ================= */
  if (isLoading || !isCurrentUserIdLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (fetchError || !user) {
    return (
      <View style={styles.center}>
        <Text>{fetchError}</Text>
        <TouchableOpacity onPress={fetchMyProfile}>
          <Text>Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.topHeader}>
        <Text style={styles.usernameHeader}>{user.username}</Text>
        <Menu
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="ellipsis-vertical" size={26} />
            </TouchableOpacity>
          }
        >
          <MenuItem onPress={handleLogout}>Đăng xuất</MenuItem>
        </Menu>
      </View>

      <ScrollView>
        {/* AVATAR + STATS */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleStoryPress}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
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

        {/* INFO */}
        <View style={styles.infoSection}>
          <Text style={styles.fullName}>{user.fullName}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/edit_profile")}>
            <Text>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* TABS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity onPress={() => setActiveTab("grid")} style={styles.tabButton}>
            <Ionicons name="grid" size={24} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setActiveTab("saved");
              fetchSavedPosts();
            }}
            style={styles.tabButton}
          >
            <Ionicons name="bookmark" size={24} />
          </TouchableOpacity>
        </View>

        {/* POSTS */}
        <FlatList
          data={posts}
          numColumns={3}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setSelectedPost(item)}>
              <Image source={{ uri: item.images[0]?.urlImage }} style={styles.postImage} />
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* FOLLOW MODALS */}
      <FollowerListModal
        visible={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        fetchUsers={fetchFollowers}
        currentUserId={currentUserId!}
        isMyProfile
        isMyFollowersList
      />

      <FollowerListModal
        visible={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        fetchUsers={fetchFollowing}
        currentUserId={currentUserId!}
        isMyProfile
        isMyFollowersList={false}
      />

      {/* STORY MODALS */}
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
        onDelete={deleteStory}
        isMyStory
      />

      {/* POST MODAL */}
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

/* ===== STYLES: GIỮ NGUYÊN CỦA BẠN ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  topHeader: { flexDirection: "row", justifyContent: "space-between", padding: 15 },
  usernameHeader: { fontSize: 19, fontWeight: "600" },
  header: { flexDirection: "row", padding: 15 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  stats: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  statBlock: { alignItems: "center" },
  statNumber: { fontWeight: "600", fontSize: 17 },
  statLabel: { fontSize: 13 },
  infoSection: { paddingHorizontal: 15 },
  fullName: { fontWeight: "600" },
  bio: { marginTop: 5 },
  editBtn: { marginTop: 12, borderWidth: 1, padding: 7, alignItems: "center" },
  tabContainer: { flexDirection: "row", borderTopWidth: 1, marginTop: 10 },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 12 },
  postImage: {
    width: (screenWidth - 2) / 3,
    height: (screenWidth - 2) / 3,
    margin: 0.5,
  },
});
