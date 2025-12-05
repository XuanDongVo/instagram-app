import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StoryResponse } from '@/types/story';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds

interface StoryViewerProps {
  visible: boolean;
  stories: StoryResponse[];
  initialIndex?: number;
  onClose: () => void;
  onView: (storyId: string) => void;
  onDelete?: (storyId: string) => void;
  isMyStory?: boolean;
}

export function StoryViewer({
  visible,
  stories,
  initialIndex = 0,
  onClose,
  onView,
  onDelete,
  isMyStory = false,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnims = useRef<Animated.Value[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const currentStory = stories[currentIndex];

  // Initialize progress animations
  useEffect(() => {
    progressAnims.current = stories.map(() => new Animated.Value(0));
  }, [stories]);

  // Handle story progress and auto-advance
  useEffect(() => {
    if (!visible || isPaused || !currentStory) return;

    // Mark as viewed
    if (!currentStory.viewed) {
      onView(currentStory.id);
    }

    const progress = progressAnims.current[currentIndex];
    progress.setValue(0);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        handleNext();
      }
    });

    return () => {
      animation.stop();
    };
  }, [visible, currentIndex, isPaused, currentStory]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePress = (x: number) => {
    const halfScreen = width / 2;
    if (x < halfScreen) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  const handleDelete = () => {
    if (onDelete && currentStory) {
      onDelete(currentStory.id);
      onClose();
    }
  };

  if (!currentStory) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback
          onPressIn={(e) => {
            setIsPaused(true);
            handlePress(e.nativeEvent.locationX);
          }}
          onPressOut={() => setIsPaused(false)}
        >
          <View style={styles.content}>
            {/* Progress Bars */}
            <View style={styles.progressContainer}>
              {stories.map((_, index) => (
                <View key={index} style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnims.current[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        opacity: index === currentIndex ? 1 : index < currentIndex ? 1 : 0.3,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <Image
                  source={
                    currentStory.user.profileImage
                      ? { uri: currentStory.user.profileImage }
                      : require('@/assets/images/icon.png')
                  }
                  style={styles.avatar}
                />
                <Text style={styles.userName}>{currentStory.user.userName}</Text>
                <Text style={styles.time}>
                  {getTimeAgo(currentStory.createdAt)}
                </Text>
              </View>
              <View style={styles.headerActions}>
                {isMyStory && onDelete && (
                  <TouchableOpacity onPress={handleDelete} hitSlop={10}>
                    <Feather name="trash-2" size={24} color="#fff" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <Feather name="x" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Story Content */}
            <Image
              source={{ uri: currentStory.mediaUrl }}
              style={styles.storyImage}
              resizeMode="contain"
            />

            {/* View Count (for my stories) */}
            {isMyStory && (
              <View style={styles.viewCount}>
                <Feather name="eye" size={16} color="#fff" />
                <Text style={styles.viewCountText}>
                  {currentStory.viewCount} views
                </Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingTop: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9,
    marginTop: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  storyImage: {
    width,
    height,
    backgroundColor: '#000',
  },
  viewCount: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
