import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { StoryCircle } from './StoryCircle';
import { StoryUser } from '@/types/story';

interface StoryListProps {
  storyUsers: StoryUser[];
  currentUserId?: string | null;
  showAddButton?: boolean;
  onAddPress?: () => void;
  onStoryPress: (userId: string, isMyStory: boolean) => void;
}

export function StoryList({
  storyUsers,
  currentUserId,
  showAddButton = false,
  onAddPress,
  onStoryPress,
}: StoryListProps) {
  const data = showAddButton 
    ? [{ isAddButton: true }, ...storyUsers]
    : storyUsers;

  return (
    <View>
      <FlatList
        data={data}
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
                onPress={onAddPress || (() => {})}
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
              onPress={() => onStoryPress(storyUser.userId, isMyStory)}
            />
          );
        }}
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
