import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useStory } from '@/hooks/useStory';
import { StoryList } from './StoryList';
import { CreateStoryModal } from './CreateStoryModal';
import { StoryViewer } from './StoryViewer';
import { StoryResponse, StoryUser } from '@/types/story';

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

  const handleStoryPress = (userId: string, isMyStory: boolean) => {
    if (isMyStory) {
      handleViewMyStories();
    } else {
      handleViewStory(userId);
    }
  };

  // Combine my stories with other users' stories
  const allStoryUsers = useMemo(() => {
    const users = new Map<string, StoryUser>();
    
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

    return Array.from(users.values());
  }, [stories, myStories, currentUserId]);

  return (
    <View>
      <StoryList
        storyUsers={allStoryUsers}
        currentUserId={currentUserId}
        showAddButton={true}
        onAddPress={handleOpenCreateModal}
        onStoryPress={handleStoryPress}
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
