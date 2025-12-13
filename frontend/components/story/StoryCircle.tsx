import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface StoryCircleProps {
  userName: string;
  profileImage?: string;
  hasStory?: boolean;
  isViewed?: boolean;
  isAddStory?: boolean;
  size?: number;
  onPress: () => void;
}

export function StoryCircle({
  userName,
  profileImage,
  hasStory = false,
  isViewed = false,
  isAddStory = false,
  size = 70,
  onPress,
}: StoryCircleProps) {

  const outerSize = size + 2;
  const innerSize = size - 4;
  const avatarSize = size - 6;
  const containerWidth = size + 20; 
  const addButtonSize = size > 50 ? 24 : 18; // Smaller add button for smaller sizes
  
  return (
    <TouchableOpacity 
      style={[styles.container, { width: containerWidth }]} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {hasStory && !isViewed ? (
          // Unviewed story - gradient ring
          <LinearGradient
            colors={['#f77737', '#e91e63', '#8e44ad']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientRing,
              { width: outerSize, height: outerSize, borderRadius: outerSize / 2 },
            ]}
          >
            <View style={[
              styles.innerRing,
              { width: innerSize, height: innerSize, borderRadius: innerSize / 2 },
            ]}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require('@/assets/images/icon.png')
                }
                style={[
                  styles.avatar,
                  { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                ]}
              />
            </View>
          </LinearGradient>
        ) : hasStory && isViewed ? (
          // Viewed story - gray ring
          <View style={[
            styles.ring,
            styles.viewedRing,
            { width: outerSize, height: outerSize, borderRadius: outerSize / 2 },
          ]}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('@/assets/images/icon.png')
              }
              style={[
                styles.avatar,
                { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
              ]}
            />
          </View>
        ) : (
          // No story - no ring, just avatar
          <Image
            source={
              profileImage
                ? { uri: profileImage }
                : require('@/assets/images/icon.png')
            }
            style={[
              styles.avatar,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}
          />
        )}

        {isAddStory && (
          <View style={[
            styles.addButton, 
            { 
              width: addButtonSize, 
              height: addButtonSize, 
              borderRadius: addButtonSize / 2 
            }
          ]}>
            <Feather name="plus" size={addButtonSize * 0.67} color="#fff" />
          </View>
        )}
      </View>

      <Text numberOfLines={1} style={[styles.userName, { fontSize: size > 50 ? 12 : 10 }]}>
        {userName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 6,
    // width removed - now dynamic
  },
  avatarContainer: {
    position: 'relative',
  },
  gradientRing: {
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    backgroundColor: '#fff',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    padding: 3,
    borderWidth: 2,
    borderColor: '#f77737',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewedRing: {
    borderColor: '#d1d5db',
  },
  avatar: {
    backgroundColor: '#e5e5e5',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0095f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    color: '#262626',
  },
});
