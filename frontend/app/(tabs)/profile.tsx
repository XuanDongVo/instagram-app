import { userFirebaseService } from "@/services/userFirebaseService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useState, useCallback, use } from "react";
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
import { UserResponse } from "../../types/user";
import { Ionicons } from "@expo/vector-icons";
import { ModalUser, UserProfileState } from "../../types/user";
const screenWidth = Dimensions.get("window").width;
import { savedPostService } from "@/services/savedPostService";
import { StoryCircle } from "@/components/story/StoryCircle";
import { CreateStoryModal } from "@/components/story/CreateStoryModal";
import { StoryViewer } from "@/components/story/StoryViewer";
import { useStory } from "@/hooks/useStory";
import { StoryResponse } from "@/types/story";
import { LinearGradient } from "expo-linear-gradient";
import PostService from "@/services/postService";
import { PostResponse } from "@/types";
import PostCard from "@/components/post/PostCard";

export default function Profile() {
  const route = useRoute();
  const userId = (route.params as { userId?: string })?.userId ?? null;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentUserIdLoaded, setIsCurrentUserIdLoaded] = useState(false);
  const isMyProfile = !userId || userId === currentUserId;
  const profileId = userId || currentUserId;

  const [user, setUser] = useState<UserProfileState | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostResponse[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("grid");
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostResponse | null>(null);
  const [isPostModalVisible, setIsPostModalVisible] = useState(false);

  // xem detail post
  const handleOpenPost = (post: any) => {
    setSelectedPost(post);
    setIsPostModalVisible(true);
  };

  // Story states
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

  // Get user stories based on profileId
  const userStories = profileId ? stories.filter((s) => s.user.id === profileId) : [];
  const hasStories = isMyProfile ? myStories.length > 0 : userStories.length > 0;

  const handleRemoveFollower = async (userId: string) => {
    // Reduce followers count for the profile being viewed
    setUser((prev) => (prev ? { ...prev, followers: prev.followers - 1 } : prev));

    // If this is my profile, update myProfile and persist to AsyncStorage
    if (isMyProfile) {
      setMyProfile((prev) => (prev ? { ...prev, followers: prev.followers - 1 } : prev));
      (async () => {
        try {
          const currentUserString = await AsyncStorage.getItem("currentUser");
          if (currentUserString) {
            const cu = JSON.parse(currentUserString);
            cu.followersCount = (cu.followersCount ?? 1) - 1;
            await AsyncStorage.setItem("currentUser", JSON.stringify(cu));
          }
        } catch (e) {
          console.warn("Failed to update stored currentUser followersCount:", e);
        }
      })();
    }
  };

  const handleUnfollowFromFollowing = async (unfollowedUserId: string) => {
    // Decrement following count for the profile being viewed
    setUser((prev) => (prev ? { ...prev, following: prev.following - 1 } : prev));

    // Also update myProfile and stored currentUser followingCount
    setMyProfile((prev) => (prev ? { ...prev, following: prev.following - 1 } : prev));
    try {
      const currentUserString = await AsyncStorage.getItem("currentUser");
      if (currentUserString) {
        const cu = JSON.parse(currentUserString);
        cu.followingCount = (cu.followingCount ?? 1) - 1;
        await AsyncStorage.setItem("currentUser", JSON.stringify(cu));
      }
    } catch (e) {
      console.warn("Failed to update stored currentUser followingCount:", e);
    }
  };

  const [myProfile, setMyProfile] = useState<UserProfileState | null>(null);

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

  const fetchMyProfile = async () => {
    if (!currentUserId) return;
    const data = await profileService.getUserProfile(currentUserId);

    setMyProfile({
      id: data.userId,
      username: data.userName,
      fullName: data.fullName,
      bio: data.bio ?? "",
      avatar: data.avatarUrl || "https://velle.vn/wp-content/uploads/2025/04/avatar-mac-dinh-4-2.jpg",
      followers: data.followersCount,
      following: data.followingCount,
    });
  };

  // Keep myProfile in sync when currentUserId becomes available
  useEffect(() => {
    if (currentUserId) {
      fetchMyProfile();
    }
  }, [currentUserId]);

  // Refetch stories when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (storyCurrentUserId) {
        loadStories();
        loadMyStories();
      }
    }, [storyCurrentUserId])
  );

  // Load current user ID
  useEffect(() => {
    const loadCurrentUserId = async () => {
      try {
        const currentUserString = await AsyncStorage.getItem("currentUser");
        if (currentUserString) {
          const currentUser = JSON.parse(currentUserString);
          setCurrentUserId(currentUser.id);
        }
      } catch (e) {
        console.error("Lỗi tải currentUserId:", e);
      } finally {
        setIsCurrentUserIdLoaded(true);
      }
    };
    loadCurrentUserId();
  }, []);

  const fetchProfileData = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const temp = await profileService.getUserProfile(profileId);
      const profileData = temp;

      if (!profileData || !profileData.userId) {
        throw new Error("Dữ liệu hồ sơ trống hoặc không hợp lệ.");
      }

      setUser({
        id: profileData.userId,
        username: profileData.userName,
        fullName: profileData.fullName,
        bio: profileData.bio ?? "",
        avatar: profileData.avatarUrl || "https://velle.vn/wp-content/uploads/2025/04/avatar-mac-dinh-4-2.jpg",
        followers: profileData.followersCount,
        following: profileData.followingCount,
      });
      setIsFollowing(profileData.following);

      const postData = await PostService.getMinePost(profileId);
      console.log("Mine post: ", postData);
      setPosts(postData.data);
    } catch (error) {
      console.error("Lỗi khi tải profile:", error);
      setFetchError("Không thể tải hồ sơ. Vui lòng thử lại.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useFocusEffect(
    useCallback(() => {
      if (isCurrentUserIdLoaded && profileId) {
        fetchProfileData();
      }
    }, [fetchProfileData, isCurrentUserIdLoaded, profileId])
  );

  const handleFollowToggle = async () => {
    if (!user || !currentUserId) return;

    try {
      if (isFollowing) {
        await profileService.unfollowUser(currentUserId, user.id);

        setIsFollowing(false);

        //  user B (profile đang xem)
        setUser((prev) => (prev ? { ...prev, followers: prev.followers - 1 } : prev));

        //  user A (chính mình)
        if (isMyProfile) {
          setUser((prev) => (prev ? { ...prev, following: prev.following - 1 } : prev));
        }
      } else {
        await profileService.followUser(currentUserId, user.id);

        setIsFollowing(true);

        setUser((prev) => (prev ? { ...prev, followers: prev.followers + 1 } : prev));

        if (isMyProfile) {
          setUser((prev) => (prev ? { ...prev, following: prev.following + 1 } : prev));
        }
      }
    } catch (error) {
      console.error("Lỗi Follow/Unfollow:", error);
    }
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    try {
      const currentUserString = await AsyncStorage.getItem("currentUser");
      if (currentUserString) {
        const currentUser = JSON.parse(currentUserString);
        await userFirebaseService.setUserOffline(currentUser.id);
      }
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "currentUser"]);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.replace("/login");
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.postItem} onPress={() => handleOpenPost(item)}>
      <Image source={{ uri: item.images[0]?.urlImage }} style={styles.postImage} resizeMode="cover" />
    </TouchableOpacity>
  );

  const fetchFollowers = useCallback(async (): Promise<ModalUser[]> => {
    if (!profileId) return [];

    try {
      console.log("Fetching followers cho:", profileId);

      // Không có .data → backend trả mảng UserResponse[]
      const users: UserResponse[] = await profileService.getFollowers(profileId);
      console.log("Followers API trả về:", users);
      return users.map((u) => ({
        id: u.id,
        username: u.userName,
        avatar: {
          uri:
            u.profileImage && u.profileImage.trim() !== ""
              ? u.profileImage
              : "https://i.pinimg.com/236x/e9/e0/7d/e9e07de22e3ef161bf92d1bcf241e4d0.jpg?nii=t",
        },
        isFollowing: false,
      }));
    } catch (error: any) {
      console.error("Lỗi getFollowers:", error.message || error);
      return [];
    }
  }, [profileId]);

  const fetchFollowing = useCallback(async (): Promise<ModalUser[]> => {
    if (!profileId) return [];
    try {
      const users: UserResponse[] = await profileService.getFollowing(profileId);

      return users.map((u) => ({
        id: u.id,
        username: u.userName,
        avatar: {
          uri:
            u.profileImage && u.profileImage.trim() !== ""
              ? u.profileImage
              : "https://i.pinimg.com/236x/e9/e0/7d/e9e07de22e3ef161bf92d1bcf241e4d0.jpg?nii=t",
        },
        isFollowing: true,
      }));
    } catch (error: any) {
      console.error("Lỗi getFollowing:", error?.message || error);
      return [];
    }
  }, [profileId]);

  const fetchSavedPosts = useCallback(async () => {
    if (!currentUserId) return;
    try {

      setPosts(savedPosts);
    } catch (error) {
      console.error("Lỗi getSavedPosts:", error);
    }
  }, [profileId]);

  useEffect(() => {
    async function fetchSavePosts() {
      if (!currentUserId) return;
      try {
        const savedPosts = await savedPostService.getSavedPostsByUserId(profileId || "");
        setSavedPosts(savedPosts);
      } catch (error) {
        console.error("Lỗi getSavedPosts:", error);
      }
    }
    fetchSavePosts();
  }, [profileId]);

  if (isLoading || !isCurrentUserIdLoaded) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 10 }}>Đang tải hồ sơ...</Text>
      </View>
    );
  }

  if (fetchError || !user) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", padding: 20 }]}>
        <Text style={{ color: "red", fontWeight: "bold", textAlign: "center" }}>
          {fetchError || "Không thể tìm thấy hồ sơ người dùng này."}
        </Text>
        <TouchableOpacity
          onPress={fetchProfileData}
          style={{ marginTop: 15, padding: 10, backgroundColor: "#eee", borderRadius: 5 }}
        >
          <Text>Tải lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header + Menu 3 chấm */}
      <View style={styles.topHeader}>
        <Text style={styles.usernameHeader}>{user.username}</Text>
        {isMyProfile && (
          <Menu
            visible={menuVisible}
            onRequestClose={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity onPress={() => setMenuVisible(true)}>
                <Ionicons name="ellipsis-vertical" size={26} color="#000" />
              </TouchableOpacity>
            }
          >
            <MenuItem onPress={handleLogout} textStyle={{ color: "#d32f2f", fontWeight: "600" }}>
              Đăng xuất
            </MenuItem>
            <MenuItem onPress={() => setMenuVisible(false)}>Hủy</MenuItem>
          </Menu>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + Stats */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleStoryPress} activeOpacity={0.7}>
            {hasStories && !myStories.every((s) => s.viewed) && isMyProfile ? (
              // Unviewed story - gradient ring
              <LinearGradient
                colors={["#f77737", "#e91e63", "#8e44ad"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientRing}
              >
                <View style={styles.innerRing}>
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                </View>
              </LinearGradient>
            ) : hasStories && myStories.every((s) => s.viewed) && isMyProfile ? (
              // Viewed story - gray ring
              <View style={styles.viewedRing}>
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              </View>
            ) : hasStories && !isMyProfile ? (
              // Other user's story
              userStories.every((s) => s.viewed) ? (
                <View style={styles.viewedRing}>
                  <Image source={{ uri: user.avatar }} style={styles.avatar} />
                </View>
              ) : (
                <LinearGradient
                  colors={["#f77737", "#e91e63", "#8e44ad"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientRing}
                >
                  <View style={styles.innerRing}>
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                  </View>
                </LinearGradient>
              )
            ) : (
              // No story
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            )}
          </TouchableOpacity>

          <View style={styles.stats}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>posts</Text>
            </View>

            {/* Thay 2 TouchableOpacity này */}
            <TouchableOpacity onPress={() => (currentUserId ? setShowFollowers(true) : null)} disabled={!currentUserId}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.followers}</Text>
                <Text style={styles.statLabel}>followers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => (currentUserId ? setShowFollowing(true) : null)} disabled={!currentUserId}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text style={styles.statLabel}>following</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info + Button */}
        <View style={styles.infoSection}>
          <Text style={styles.fullName}>{user.fullName}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

          {isMyProfile ? (
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push("/edit_profile")}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing ? styles.followingBtn : styles.followActive]}
              onPress={handleFollowToggle}
            >
              <Text style={[styles.followBtnText, isFollowing ? styles.followingText : styles.followText]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === "grid" && styles.activeTab]}
            onPress={() => setActiveTab("grid")}
          >
            <Ionicons
              name={activeTab === "grid" ? "grid" : "grid-outline"}
              size={24}
              color={activeTab === "grid" ? "#000" : "#8e8e8e"}
            />
          </TouchableOpacity>
          {isMyProfile && (
            <TouchableOpacity
              style={[styles.tabButton, activeTab === "tagged" && styles.activeTab]}
              onPress={() => {
                setActiveTab("tagged");
              }}
            >
              <Ionicons
                name={activeTab === "tagged" ? "person-circle" : "person-circle-outline"}
                size={28}
                color={activeTab === "tagged" ? "#000" : "#8e8e8e"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Posts Grid */}
        <FlatList
          data={activeTab == "grid" ? posts : savedPosts}
          numColumns={3}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 0.5 }}
        />
      </ScrollView>

      {/* Modals - ĐÃ HOÀN CHỈNH */}
      <FollowerListModal
        visible={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        fetchUsers={fetchFollowers}
        currentUserId={currentUserId ?? ""}
        isMyProfile={isMyProfile}
        isMyFollowersList={true}
        onRemoveFollower={handleRemoveFollower}
      />

      <FollowerListModal
        visible={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        fetchUsers={fetchFollowing}
        currentUserId={currentUserId ?? ""}
        isMyProfile={isMyProfile}
        isMyFollowersList={false}
        onUnfollow={handleUnfollowFromFollowing}
      />

      {/* Story Modals */}
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

      <Modal visible={isPostModalVisible} animationType="slide" onRequestClose={() => setIsPostModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          {/* Header để đóng Modal */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 15,
              height: 50,
              borderBottomWidth: 0.5,
              borderColor: "#dbdbdb",
            }}
          >
            <TouchableOpacity onPress={() => setIsPostModalVisible(false)}>
              <Ionicons name="arrow-back" size={28} color="black" />
            </TouchableOpacity>
            <Text style={{ marginLeft: 20, fontWeight: "700", fontSize: 16 }}>Bài viết</Text>
          </View>

          {/* Hiển thị PostCard */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedPost && <PostCard post={selectedPost} />}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  usernameHeader: { fontWeight: "600", fontSize: 19 },
  header: { flexDirection: "row", paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10 },
  avatarContainer: { marginRight: 30 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  gradientRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  innerRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fff",
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  viewedRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  stats: { flex: 1, flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  statBlock: { alignItems: "center" },
  statNumber: { fontWeight: "600", fontSize: 17 },
  statLabel: { fontSize: 13, color: "#262626", marginTop: 2 },
  infoSection: { paddingHorizontal: 15, marginTop: 5 },
  fullName: { fontWeight: "600", fontSize: 15, color: "#000" },
  bio: { marginTop: 5, fontSize: 14, lineHeight: 19, color: "#000" },
  editBtn: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  editBtnText: { fontWeight: "600", fontSize: 14, color: "#000" },
  followBtn: { marginTop: 12, borderRadius: 8, paddingVertical: 7, alignItems: "center" },
  followActive: { backgroundColor: "#0095f6" },
  followingBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dbdbdb" },
  followBtnText: { fontWeight: "600", fontSize: 14 },
  followText: { color: "#fff" },
  followingText: { color: "#000" },
  highlights: { marginTop: 15, paddingLeft: 10 },
  highlightItem: { alignItems: "center", marginRight: 18 },
  newStoryCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: "#c7c7c7",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  highlightCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    padding: 2,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e1e1e1",
  },
  highlightImage: { width: "100%", height: "100%", borderRadius: 31 },
  highlightText: { marginTop: 6, fontSize: 12, color: "#262626" },
  tabContainer: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dbdbdb", marginTop: 10 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 1, borderBottomColor: "#000" },
  postItem: { width: (screenWidth - 2) / 3, height: (screenWidth - 2) / 3, margin: 0.5 },
  postImage: { width: "100%", height: "100%" },
});
