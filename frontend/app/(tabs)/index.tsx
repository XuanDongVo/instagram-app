import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StoryBar } from '@/components/story/StoryBar';
import CommentBottomSheet from '../../components/comments/CommentBottomSheet';

type PostImage = { id: string; urlImage?: string; localSource?: any };
type UserSummary = { id: string; userName: string; fullName: string; profileImage?: string };
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

const API_BASE = ((process.env as any).EXPO_PUBLIC_API_BASE as string) || (Platform.OS === 'android' ? 'http://10.0.2.2:8081' : 'http://localhost:8081');
const CURRENT_USER_ID = ((process.env as any).EXPO_PUBLIC_USER_ID as string) || '';

function HeaderBar() {
  const router = useRouter();

  return (
    <View style={styles.headerBar}>
      <Text style={styles.brandText}>Instagram</Text>
      <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
        <Feather name="heart" size={24} />
        <TouchableOpacity onPress={() => router.push('/messages')}>
          <Feather name="message-circle" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.savedPost);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

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
        <Image source={{ uri: post.user.profileImage || undefined }} style={styles.cardAvatar} />
        <Text numberOfLines={1} style={styles.cardUser}>{post.user.userName || 'user'}</Text>
        <View style={{ flex: 1 }} />
        <Feather name="more-horizontal" size={20} />
      </View>
      {post.images?.[0] ? (
        <Image
          source={post.images[0].localSource ?? { uri: post.images[0].urlImage as string }}
          style={styles.cardImage}
          contentFit="cover"
        />
      ) : null}
      <View style={styles.cardActions}>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable onPress={toggleLike} hitSlop={10}>
            <Feather name="heart" color={liked ? '#ef4444' : undefined} size={26} />
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
        <Text style={styles.likeText}>Liked by <Text style={{ fontWeight: '700' }}>thekamraan</Text> and {likeCount.toLocaleString()} others</Text>
        {post.content ? (
          <Text style={styles.captionText} numberOfLines={2}>
            <Text style={styles.cardUser}>{post.user.userName} </Text>
            {post.content}
            <Text style={{ color: '#737373' }}> more</Text>
          </Text>
        ) : null}
        <TouchableOpacity onPress={() => setShowComments(true)}>
          <Text style={styles.viewComments}>View all {post.comments} comments</Text>
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

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const buildMockPosts = (): Post[] => [
    {
      id: 'mock-1',
      content: "Start your countdown to the glorious arrival of Marvel Studios' #Loki",
      createAt: new Date().toISOString(),
      images: [{ id: 'img-1', localSource: require('@/assets/images/react-logo.png') }],
      comments: 103,
      likes: 905235,
      liked: false,
      savedPost: false,
      user: { id: 'u1', userName: 'marvel', fullName: 'Marvel', profileImage: undefined },
    },
    {
      id: 'mock-2',
      content: 'Exploring the new React Native features in Expo 54!',
      createAt: new Date().toISOString(),
      images: [{ id: 'img-2', localSource: require('@/assets/images/partial-react-logo.png') }],
      comments: 12,
      likes: 1402,
      liked: true,
      savedPost: false,
      user: { id: 'u2', userName: 'react', fullName: 'React', profileImage: undefined },
    },
    {
      id: 'mock-3',
      content: 'Sunset over the city. Shot on phone.',
      createAt: new Date().toISOString(),
      images: [{ id: 'img-3', localSource: require('@/assets/images/splash-icon.png') }],
      comments: 89,
      likes: 7689,
      liked: false,
      savedPost: true,
      user: { id: 'u3', userName: 'cityscape', fullName: 'City Scape', profileImage: undefined },
    },
    {
      id: 'mock-4',
      content: 'Designing a clean UI with Expo Router.',
      createAt: new Date().toISOString(),
      images: [{ id: 'img-4', localSource: require('@/assets/images/android-icon-foreground.png') }],
      comments: 32,
      likes: 2201,
      liked: false,
      savedPost: false,
      user: { id: 'u4', userName: 'uiux', fullName: 'UI/UX', profileImage: undefined },
    },
  ];

  const fetchPosts = useCallback(async () => {
    try {
      // setLoading(true);
      // const res = await fetch(`${API_BASE}/api/v1/post?id=${encodeURIComponent(CURRENT_USER_ID)}`);
      // const json = await res.json();
      // const data = json?.data ?? [];
      // setPosts(data.length > 0 ? data : buildMockPosts());

      setPosts(buildMockPosts());
    } catch (e) {
      console.error('Load posts error', e);
      setPosts(buildMockPosts());
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

  const listHeader = useMemo(() => (
    <View>
      <HeaderBar />
      <StoryBar />
      <View style={{ height: 8 }} />
    </View>
  ), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[scheme].background }]}>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 0.5, backgroundColor: '#e5e5e5' }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  brandText: { fontSize: 28, fontWeight: '600' },
  iconBtn: { width: 22, height: 22 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 10 },
  cardAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ddd' },
  cardUser: { fontSize: 14, fontWeight: '600' },
  cardImage: { width: '100%', aspectRatio: 1, backgroundColor: '#eee' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, height: 44 },
  cardMeta: { paddingHorizontal: 12, paddingVertical: 4, gap: 6 },
  likeText: { fontWeight: '600' },
  captionText: { fontSize: 14 },
  viewComments: { color: '#737373' },
  timestamp: { color: '#737373', fontSize: 12 },
});
