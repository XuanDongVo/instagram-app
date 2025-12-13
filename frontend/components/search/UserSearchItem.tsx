import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { UserStoryAvatar } from '../story/UserStoryAvatar';
import { UserSearchItemProps } from '@/types/search';

export function UserSearchItem({
  user,
  currentUserId,
  onPress,
}: UserSearchItemProps) {
  const { id, userName, fullName } = user;

  return (
    <View style={styles.container}>
      {/* Avatar - clickable */}
      <View style={{ paddingTop: 10 }}>
        <UserStoryAvatar
          user={user}
          currentUserId={currentUserId}
          onPress={(userId, isMyStory) => {
            onPress(userId);
          }}
        />
      </View>

      {/* User Info - clickable */}
      <TouchableOpacity
        style={styles.textContainer}
        onPress={() => onPress(id)}
        activeOpacity={0.7}
      >
        <Text style={styles.userName} numberOfLines={1}>
          {userName}
        </Text>
        <Text style={styles.fullName} numberOfLines={1}>
          {fullName}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: -7,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    color: '#737373',
  },
});
