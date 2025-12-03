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
  onPress: () => void;
}

export function StoryCircle({
  userName,
  profileImage,
  hasStory = false,
  isViewed = false,
  isAddStory = false,
  onPress,
}: StoryCircleProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {hasStory && !isViewed ? (
          <LinearGradient
            colors={['#f77737', '#e91e63', '#8e44ad']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientRing}
          >
            <View style={styles.innerRing}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : require('@/assets/images/icon.png')
                }
                style={styles.avatar}
              />
            </View>
          </LinearGradient>
        ) : (
          <View style={[styles.ring, isViewed && styles.viewedRing]}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require('@/assets/images/icon.png')
              }
              style={styles.avatar}
            />
          </View>
        )}
        
        {isAddStory && (
          <View style={styles.addButton}>
            <Feather name="plus" size={16} color="#fff" />
          </View>
        )}
      </View>
      
      <Text numberOfLines={1} style={styles.userName}>
        {userName}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 70,
  },
  avatarContainer: {
    position: 'relative',
  },
  gradientRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#fff',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#e5e5e5',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
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
