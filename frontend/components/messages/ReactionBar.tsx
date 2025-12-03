import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ReactionBarProps {
  onReactionPress: (emoji: string) => void;
  onMorePress: () => void;
  currentUserReaction?: string | null; // Emoji hiện tại của user
}

const ReactionBar = ({ onReactionPress, onMorePress, currentUserReaction }: ReactionBarProps) => {
  const reactions = ['❤️', '😂', '😮', '😢', '😠', '👍'];

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Nhấn và giữ để bày tỏ cảm xúc dạt dào</Text>
      <View style={styles.reactionsRow}>
        {reactions.map((emoji, index) => {
          const isSelected = currentUserReaction === emoji;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.reactionButton,
                isSelected && styles.selectedReactionButton
              ]}
              onPress={() => onReactionPress(emoji)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.emoji,
                isSelected && styles.selectedEmoji
              ]}>{emoji}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onMorePress}
          activeOpacity={0.7}
        >
          <Text style={styles.moreText}>➕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    minWidth: 280,
  },
  headerText: {
    fontSize: 13,
    color: 'rgba(0, 0, 0, 0.8)', 
    textAlign: 'center',
    marginBottom: 5,
    fontWeight: '500',
  },
  reactionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reactionButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  selectedReactionButton: {
    backgroundColor: '#3797f0', 
    transform: [{ scale: 1.2 }],
  },
  emoji: {
    fontSize: 18,
  },
  selectedEmoji: {
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  moreButton: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: 'transparent',
  },
  moreText: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.7)', 
  },
});

export default ReactionBar;