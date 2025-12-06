import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useStory } from '@/hooks/useStory';
import { StoryCircle } from './StoryCircle';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewer } from './StoryViewer';
import { StoryResponse } from '@/types/story';

interface StoryUser {
  userId: string;
  userName: string;
  profileImage?: string;
  stories: StoryResponse[];
  hasStory: boolean;
  isViewed: boolean;
}

export function StoryBar() {
  const {
    stories,
    myStories,
    loading,
    currentUserId,
    createStory,
    viewStory,
    deleteStory,
    pickImage,
    pickVideo
  } = useStory();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [viewerStories, setViewerStories] = useState<StoryResponse[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isMyStoryViewer, setIsMyStoryViewer] = useState(false);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleViewMyStories = () => {
    if (myStories.length > 0) {
      setViewerStories(myStories);
      setViewerIndex(0);
      setIsMyStoryViewer(true);
      setShowViewer(true);
    } else {
      handleOpenCreateModal();
    }
  };

  const handleViewStory = (storyUserId: string) => {
    const userStories = stories.filter(s => s.user.id === storyUserId);
    if (userStories.length > 0) {
      setViewerStories(userStories);
      setViewerIndex(0);
      setIsMyStoryViewer(false);
      setShowViewer(true);
    }
  };

  // Combine my stories with other users' stories
  const allStoryUsers = useMemo(() => {
    const users = new Map<string, StoryUser>();
    
    console.log('Building story list - myStories:', myStories.length, 'stories:', stories.length);
    
    // Add current user if they have stories
    if (currentUserId && myStories.length > 0) {
      users.set(currentUserId, {
        userId: currentUserId,
        userName: 'Your story',
        profileImage: myStories[0]?.user.profileImage,
        stories: myStories,
        hasStory: true,
        isViewed: myStories.every(s => s.viewed),
      });
    }

    // Add other users
    stories.forEach(story => {
      if (!users.has(story.user.id)) {
        users.set(story.user.id, {
          userId: story.user.id,
          userName: story.user.userName,
          profileImage: story.user.profileImage,
          stories: [story],
          hasStory: true,
          isViewed: story.viewed,
        });
      } else {
        const user = users.get(story.user.id)!;
        user.stories.push(story);
        user.isViewed = user.isViewed && story.viewed;
      }
    });

    const result = Array.from(users.values());
    console.log('Total story users:', result.length);
    return result;
  }, [stories, myStories, currentUserId]);

  return (
    <View>
      <FlatList
        data={[{ isAddButton: true }, ...allStoryUsers]}
        keyExtractor={(item, index) => 
          'isAddButton' in item && item.isAddButton 
            ? 'add-story' 
            : `story-${(item as StoryUser).userId}-${index}`
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storyRow}
        renderItem={({ item }) => {
          if ('isAddButton' in item && item.isAddButton) {
            return (
              <StoryCircle
                userName="Your story"
                isAddStory={true}
                onPress={handleOpenCreateModal}
              />
            );
          }

          const storyUser = item as StoryUser;
          const isMyStory = storyUser.userId === currentUserId;
          return (
            <StoryCircle
              userName={storyUser.userName}
              profileImage={storyUser.profileImage}
              hasStory={storyUser.hasStory}
              isViewed={storyUser.isViewed}
              onPress={() => 
                isMyStory ? handleViewMyStories() : handleViewStory(storyUser.userId)
              }
            />
          );
        }}
      />

      <CreateStoryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPickImage={pickImage}
        onPickVideo={pickVideo}
        onCreateStory={createStory}
        loading={loading}
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
  storyRow: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
});
