
import React from 'react';
import { View } from 'react-native';
import { StoryCircle } from './StoryCircle';
import { UserStoryAvatarProps } from '@/types/story';

export function UserStoryAvatar({
  user,
  currentUserId,
  onPress,
}: UserStoryAvatarProps) {

  const firstStory = user.stories?.[0];
  const isViewed = firstStory ? firstStory.viewed : false;

  const isMyStory = user.id === currentUserId;

  return (
    <View>
      <StoryCircle
        userName={""}
        profileImage={user.profileImage}
        hasStory={user.hasStory}
        isViewed={isViewed}
        size={50}
        onPress={() => onPress?.(user.id, isMyStory)}
      />
    </View>
  );
}