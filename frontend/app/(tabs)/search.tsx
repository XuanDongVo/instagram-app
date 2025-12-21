import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { SearchBar } from '@/components/search/SearchBar';
import { PostGrid } from '@/components/search/PostGrid';
import { UserSearchItem } from '@/components/search/UserSearchItem';
import { PostResponse } from '@/types/post';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import { UserSearchResponse } from '@/types/user';
import { StoryViewer } from '@/components/story/StoryViewer';
import { useStory } from '@/hooks/useStory';
import { StoryResponse } from '@/types/story';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const { viewStory, deleteStory } = useStory();

  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [filteredSearchUsers, setfilteredSearchUsers] = useState<UserSearchResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Story viewer states
  const [showViewer, setShowViewer] = useState(false);
  const [viewerStories, setViewerStories] = useState<StoryResponse[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isMyStoryViewer, setIsMyStoryViewer] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setfilteredSearchUsers([]);
    }
  }, [searchQuery, posts]);

  const loadPosts = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
     
    } catch (error) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setfilteredSearchUsers([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const userSearchResults = await userService.searchUsers(searchQuery);
      setfilteredSearchUsers(userSearchResults);
    } catch (error) {
      setfilteredSearchUsers([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handlePostPress = (post: PostResponse) => {
    Alert.alert('Post', `Viewing post by ${post.user.userName}`);
  };

  const handleStoryPress = (userId: string, isMyStory: boolean) => {
    // Tìm user trong search results
    const searchedUser = filteredSearchUsers.find(u => u.id === userId);
    if (!searchedUser || !searchedUser.hasStory || searchedUser.stories.length === 0) {
      return;
    }
    
    setViewerStories(searchedUser.stories);
    setViewerIndex(0);
    setIsMyStoryViewer(isMyStory);
    setShowViewer(true);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDark ? Colors.dark.background : Colors.light.background },
      ]}
    >
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search"
        onClear={handleClearSearch}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Story Users - only show when searching */}
        {searchQuery.trim() && (
          <>
            {searchingUsers && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0095f6" />
                <Text style={styles.loadingText}>Searching users...</Text>
              </View>
            )}

            {!searchingUsers && filteredSearchUsers.length > 0 && (
              <View style={styles.searchResults}>
                {filteredSearchUsers.length > 0 && (
                  <FlatList
                    data={filteredSearchUsers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <UserSearchItem
                        user= {item}
                        currentUserId={user?.id || null}
                        onPress={(userId) => {
                          if (item.hasStory) {
                            handleStoryPress(userId, userId === user?.id);
                          } else {
                            Alert.alert('Profile', `View profile of ${item.userName}`);
                          }
                        }}
                      />
                    )}
                    scrollEnabled={false}
                  />
                )}
              </View>
            )}

            {!searchingUsers && filteredSearchUsers.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            )}
          </>
        )}

        {/* Posts - only show when NOT searching */}
        {!searchQuery.trim() && (
          <>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0095f6" />
              </View>
            )}

            {!loading && posts.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts available</Text>
              </View>
            )}

            {!loading && posts.length > 0 && (
              <PostGrid posts={posts} onPostPress={handlePostPress} />
            )}
          </>
        )}
      </ScrollView>

      <StoryViewer
        visible={showViewer}
        stories={viewerStories}
        initialIndex={viewerIndex}
        onClose={() => setShowViewer(false)}
        onView={viewStory}
        onDelete={isMyStoryViewer ? deleteStory : undefined}
        isMyStory={isMyStoryViewer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  searchResults: {
    backgroundColor: '#fff',
  },
  storySection: {
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#737373',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#737373',
  },
});


