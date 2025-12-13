import React from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { PostResponse } from '@/types/post';
import { Feather } from '@expo/vector-icons';
import { PostGridProps } from '@/types/post';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3; // 3 columns with 2px gap

export function PostGrid({ posts, onPostPress }: PostGridProps) {
  const renderGridItem = (post: PostResponse, index: number) => {
    const firstImage = post.images?.[0]?.imageUrl;
    const hasMultipleImages = post.images && post.images.length > 1;

    return (
      <TouchableOpacity
        key={post.id}
        style={styles.gridItem}
        onPress={() => onPostPress?.(post)}
        activeOpacity={0.9}
      >
        {firstImage ? (
          <Image
            source={{ uri: firstImage }}
            style={styles.gridImage}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.gridImage, styles.placeholderContainer]}>
            <Feather name="image" size={40} color="#d4d4d4" />
          </View>
        )}

        {hasMultipleImages && (
          <View style={styles.multipleIndicator}>
            <Feather name="copy" size={16} color="#fff" />
          </View>
        )}

        {/* Optional: Show likes/comments overlay */}
        <View style={styles.overlay}>
          <View style={styles.statsRow}>
            <Feather name="heart" size={20} color="#fff" />
            <Text style={styles.statText}>{post.likes}</Text>
            <Feather name="message-circle" size={20} color="#fff" style={{ marginLeft: 12 }} />
            <Text style={styles.statText}>{post.comments}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const rows = [];
  for (let i = 0; i < posts.length; i += 3) {
    const rowPosts = posts.slice(i, i + 3);
    rows.push(
      <View key={`row-${i}`} style={styles.row}>
        {rowPosts.map((post, idx) => renderGridItem(post, i + idx))}
        {/* Fill empty spaces if last row has less than 3 items */}
        {rowPosts.length < 3 && [...Array(3 - rowPosts.length)].map((_, idx) => (
          <View key={`empty-${i}-${idx}`} style={styles.gridItem} />
        ))}
      </View>
    );
  }

  return <View style={styles.container}>{rows}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 2,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  multipleIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 4,
    padding: 4,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 16,
  },
});
