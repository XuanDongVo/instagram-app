import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import FollowerListModal from "../../components/profile/FollowerListModal";

const screenWidth = Dimensions.get("window").width;

export default function Profile() {
  const route = useRoute();
  const navigation = useNavigation();

  // 👇 an toàn: kiểm tra route.params có tồn tại không
  const userId = (route.params as { userId?: string })?.userId ?? null;

  // 👇 giả sử user hiện tại là "1"
  const currentUserId = "1";
  const isMyProfile = !userId || userId === currentUserId;

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    // 🔹 Dữ liệu user mẫu
    setUser({
      id: userId || currentUserId,
      username: isMyProfile ? "my_profile" : "quockhanh",
      fullName: isMyProfile ? "You" : "Phạm Quốc Khánh",
      bio: "AI Engineer | Dream big 💡",
      avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      followers: 200,
      following: 180,
    });

    // 🔹 Dữ liệu bài viết giả lập
    const dummyPosts = Array.from({ length: 12 }).map((_, i) => ({
      id: i.toString(),
      imageUrl: `https://picsum.photos/id/${100 + i}/400/400`,
    }));
    setPosts(dummyPosts);
  }, [userId]);

  const handleFollowToggle = () => setIsFollowing(!isFollowing);

  const renderPost = ({ item }: { item: any }) => (
    // <TouchableOpacity
    //   style={styles.postItem}
    //   onPress={() => navigation.navigate("PostDetail", { post: item })}
    // >
    //   <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
    // </TouchableOpacity>
    null
  );

  if (!user) return null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.stats}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>

            <TouchableOpacity onPress={() => setShowFollowers(true)}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowFollowing(true)}>
              <View style={styles.statBlock}>
                <Text style={styles.statNumber}>{user.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.bio}>{user.bio}</Text>

          {isMyProfile ? (
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
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

        {/* Highlights */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.highlights}
        >
          {[...Array(5)].map((_, i) => (
            <View key={i} style={styles.highlightItem}>
              <View style={styles.highlightCircle}>
                <Image
                  source={{ uri: "https://picsum.photos/100?random=" + i }}
                  style={styles.highlightImage}
                />
              </View>
              <Text style={styles.highlightText}>Story {i + 1}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* Posts */}
        <FlatList
          data={posts}
          numColumns={3}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Modals */}

      <FollowerListModal
        visible={showFollowers}
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={[
          { id: "2", username: "alice", avatar: { uri: "https://i.pravatar.cc/150?img=2" } },
          { id: "3", username: "bob", avatar: { uri: "https://i.pravatar.cc/150?img=3" } },
        ]}
        onSelectUser={() => { }}
      />

      <FollowerListModal
        visible={showFollowing}
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={[
          { id: "4", username: "charlie", avatar: { uri: "https://i.pravatar.cc/150?img=4" } },
          { id: "5", username: "diana", avatar: { uri: "https://i.pravatar.cc/150?img=5" } },
        ]}
        onSelectUser={() => { }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: "center",
  },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  stats: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
  },
  statBlock: { alignItems: "center" },
  statNumber: { fontWeight: "bold", fontSize: 18 },
  statLabel: { color: "#666" },
  infoSection: { paddingHorizontal: 16, marginTop: 10 },
  username: { fontWeight: "600", fontSize: 16 },
  bio: { marginTop: 4, color: "#555" },
  editBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 6,
    marginTop: 10,
  },
  editBtnText: { fontWeight: "600" },
  followBtn: {
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    paddingVertical: 6,
    marginTop: 10,
  },
  followActive: { backgroundColor: "#0095F6", borderColor: "#0095F6" },
  followingBtn: { backgroundColor: "#fff", borderColor: "#ccc" },
  followBtnText: { fontWeight: "600" },
  followText: { color: "#fff" },
  followingText: { color: "#000" },
  highlights: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  highlightItem: {
    alignItems: "center",
    marginRight: 14,
  },
  highlightCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 2,
  },
  highlightImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
  },
  highlightText: {
    fontSize: 12,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  postItem: {
    width: screenWidth / 3,
    height: screenWidth / 3,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
});
