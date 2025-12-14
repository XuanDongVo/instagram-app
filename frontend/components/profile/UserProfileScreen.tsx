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
import FollowerListModal from "../../components/profile/FollowerListModal";
import { profileService } from "../../services/profileService";
import { eventBus } from "../../utils/eventBus";
import { UserResponse } from "../../types/user";

const screenWidth = Dimensions.get("window").width;

interface ModalUser {
  id: string;
  username: string;
  avatar: any;
  isFollowing: boolean;
}

interface UserProfileState {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatar: string;
  followers: number;
  following: number;
}

export default function UserProfileScreen() {
  const route = useRoute();
  const userIdParam = (route.params as { userId?: string })?.userId ?? null;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCurrentUserIdLoaded, setIsCurrentUserIdLoaded] = useState(false);

  const [user, setUser] = useState<UserProfileState | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"grid" | "tagged">("grid");
  const [menuVisible, setMenuVisible] = useState(false);

  const profileId = userIdParam;

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

  const isMyProfile = profileId === currentUserId;

  const fetchProfileData = useCallback(async () => {
    if (!profileId) return;
    setIsLoading(true);
    setFetchError(null);

    try {
      const profileData = await profileService.getUserProfile(profileId);

      if (!profileData || !profileData.userId) {
        throw new Error("Dữ liệu hồ sơ trống hoặc không hợp lệ.");
      }

      setUser({
        id: profileData.userId,
        username: profileData.userName,
        fullName: profileData.fullName,
        bio: profileData.bio ?? "",
        avatar:
          profileData.avatarUrl ||
          "https://i.pinimg.com/236x/e9/e0/7d/e9e07de22e3ef161bf92d1bcf241e4d0.jpg?nii=t",
        followers: profileData.followersCount,
        following: profileData.followingCount,
      });

      setIsFollowing(profileData.following);

      const dummyPosts = Array.from({ length: 12 }).map((_, i) => ({
        id: i.toString(),
        imageUrl: `https://picsum.photos/id/${100 + i}/400/400`,
      }));
      setPosts(dummyPosts);
    } catch (error: any) {
      console.error("Lỗi khi tải profile:", error);
      setFetchError("Không thể tải hồ sơ. Vui lòng thử lại.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (isCurrentUserIdLoaded && profileId) {
      fetchProfileData();
    }
  }, [fetchProfileData, isCurrentUserIdLoaded, profileId]);

  const handleFollowToggle = async () => {
    if (!user || !currentUserId) return;

    try {
      if (isFollowing) {
        await profileService.unfollowUser(currentUserId, user.id);
        setIsFollowing(false);
        setUser((prev: UserProfileState | null) =>
          prev ? { ...prev, followers: prev.followers - 1 } : null
        );
      } else {
        await profileService.followUser(currentUserId, user.id);
        setIsFollowing(true);
        setUser((prev: UserProfileState | null) =>
          prev ? { ...prev, followers: prev.followers + 1 } : null
        );
      }
    } catch (error) {
      console.error("Lỗi Follow/Unfollow:", error);
    }
  };

  const fetchFollowers = useCallback(async (): Promise<ModalUser[]> => {
    if (!profileId) return [];
    console.log("fetchFollowers called for", { profileId, currentUserId });
    try {
      const users: UserResponse[] = await profileService.getFollowers(profileId);

      let myFollowingSet = new Set<string>();
      if (currentUserId) {
        try {
          const myFollowing = await profileService.getFollowing(currentUserId);
          myFollowingSet = new Set(myFollowing.map((m) => m.id));
        } catch (e) {
          console.warn("Failed to load my following list for getFollowers:", e);
        }
      } else {
        try {
          const currentUserString = await AsyncStorage.getItem("currentUser");
          if (currentUserString) {
            const cu = JSON.parse(currentUserString);
            const myFollowing = await profileService.getFollowing(cu.id);
            myFollowingSet = new Set(myFollowing.map((m) => m.id));
          }
        } catch (e) {
          console.warn("Fallback: failed to read my following list for getFollowers:", e);
        }
      }

      console.log("fetchFollowers: myFollowingSet size", myFollowingSet.size);

      return users.map((u) => ({
        id: u.id,
        username: u.userName,
        avatar: {
          uri:
            u.profileImage && u.profileImage.trim() !== ""
              ? u.profileImage
              : "https://i.pinimg.com/236x/e9/e0/7d/e9e07de22e3ef161bf92d1bcf241e4d0.jpg?nii=t",
        },
        isFollowing: myFollowingSet.has(u.id),
      }));
    } catch (error: any) {
      console.error("Lỗi getFollowers:", error.message || error);
      return [];
    }
  }, [profileId, currentUserId]);

  const fetchFollowing = useCallback(async (): Promise<ModalUser[]> => {
    if (!profileId) return [];
    console.log("fetchFollowing called for", { profileId, currentUserId });
    try {
      const users: UserResponse[] = await profileService.getFollowing(profileId);

      let myFollowingSet = new Set<string>();
      if (currentUserId) {
        try {
          const myFollowing = await profileService.getFollowing(currentUserId);
          myFollowingSet = new Set(myFollowing.map((m) => m.id));
        } catch (e) {
          console.warn("Failed to load my following list for getFollowing:", e);
        }
      } else {
        try {
          const currentUserString = await AsyncStorage.getItem("currentUser");
          if (currentUserString) {
            const cu = JSON.parse(currentUserString);
            const myFollowing = await profileService.getFollowing(cu.id);
            myFollowingSet = new Set(myFollowing.map((m) => m.id));
          }
        } catch (e) {
          console.warn("Fallback: failed to read my following list for getFollowing:", e);
        }
      }

      console.log("fetchFollowing: myFollowingSet size", myFollowingSet.size);

      return users.map((u) => ({
        id: u.id,
        username: u.userName,
        avatar: {
          uri:
            u.profileImage && u.profileImage.trim() !== ""
              ? u.profileImage
              : "https://i.pinimg.com/236x/e9/e0/7d/e9e07de22e3ef161bf92d1bcf241e4d0.jpg?nii=t",
        },
        isFollowing: myFollowingSet.has(u.id),
      }));
    } catch (error: any) {
      console.error("Lỗi getFollowing:", error.message || error);
      return [];
    }
  }, [profileId, currentUserId]);

  const handleToggleFollowFromModal = async (targetUserId: string, nowFollowing: boolean) => {
    const delta = nowFollowing ? 1 : -1;
    try {
      const currentUserString = await AsyncStorage.getItem("currentUser");
      if (currentUserString) {
        const cu = JSON.parse(currentUserString);
        cu.followingCount = (cu.followingCount ?? 0) + delta;
        await AsyncStorage.setItem("currentUser", JSON.stringify(cu));
      }
    } catch (e) {
      console.warn("Failed to update stored currentUser followingCount:", e);
    }

    try {
      eventBus.emit("currentUser:followingChanged", { delta, userId: targetUserId, nowFollowing });
    } catch (e) {
    }
  };

  const renderPost = ({ item }: { item: any }) => (
    <View style={styles.postItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
    </View>
  );

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
      {/* Header */}
      <View style={styles.topHeader}>
        <Text style={styles.usernameHeader}>{user.username}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + Stats */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          </View>

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

        {/* Info + Button */}
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
                {isFollowing ? "Unfollow" : "Follow"}
              </Text>
            </TouchableOpacity>
          )}

        </View>

        {/* Highlights / Story */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlights} contentContainerStyle={{ paddingRight: 10 }}>
          {["Friends", "Sport", "Design"].map((name, i) => (
            <View key={i} style={styles.highlightItem}>
              <View style={styles.highlightCircle}>
                <Image source={{ uri: `https://picsum.photos/100?random=${i + 10}` }} style={styles.highlightImage} />
              </View>
              <Text style={styles.highlightText}>{name}</Text>
            </View>
          ))}
        </ScrollView>

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
        </View>

        {/* Posts Grid */}
        <FlatList
          data={posts}
          numColumns={3}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingHorizontal: 0.5 }}
        />
      </ScrollView>

      {/* Modals */}
      <FollowerListModal
        visible={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        fetchUsers={fetchFollowers}
        currentUserId={currentUserId ?? ""}
        isMyProfile={isMyProfile}
        isMyFollowersList={true}
      />


      <FollowerListModal
        visible={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        fetchUsers={fetchFollowing}
        currentUserId={currentUserId ?? ""}
        isMyProfile={isMyProfile}
        isMyFollowersList={false}
      />



    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 15, paddingTop: 10, paddingBottom: 5 },
  usernameHeader: { fontWeight: "600", fontSize: 19 },
  header: { flexDirection: "row", paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10 },
  avatarContainer: { marginRight: 30 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  stats: { flex: 1, flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  statBlock: { alignItems: "center" },
  statNumber: { fontWeight: "600", fontSize: 17 },
  statLabel: { fontSize: 13, color: "#262626", marginTop: 2 },
  infoSection: { paddingHorizontal: 15, marginTop: 5 },
  fullName: { fontWeight: "600", fontSize: 15, color: "#000" },
  bio: { marginTop: 5, fontSize: 14, lineHeight: 19, color: "#000" },
  followBtn: { marginTop: 12, borderRadius: 8, paddingVertical: 7, alignItems: "center" },
  followActive: { backgroundColor: "#0095f6" },
  followingBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dbdbdb" },
  followBtnText: { fontWeight: "600", fontSize: 14 },
  followText: { color: "#fff" },
  followingText: { color: "#000" },
  highlights: { marginTop: 15, paddingLeft: 10 },
  highlightItem: { alignItems: "center", marginRight: 18 },
  highlightCircle: { width: 66, height: 66, borderRadius: 33, padding: 2, backgroundColor: "#fff", borderWidth: 2, borderColor: "#e1e1e1" },
  highlightImage: { width: "100%", height: "100%", borderRadius: 31 },
  highlightText: { marginTop: 6, fontSize: 12, color: "#262626" },
  tabContainer: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dbdbdb", marginTop: 10 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { borderBottomWidth: 1, borderBottomColor: "#000" },
  postItem: { width: (screenWidth - 2) / 3, height: (screenWidth - 2) / 3, margin: 0.5 },
  postImage: { width: "100%", height: "100%" },
});
