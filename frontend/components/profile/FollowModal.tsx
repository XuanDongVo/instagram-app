import React from 'react';
import { Modal, View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const dummyUsers = [
  { id: '1', username: 'john_doe', avatar: require('../assets/images/icon.png'), isFollowing: true },
  { id: '2', username: 'jane_doe', avatar: require('../assets/images/icon.png'), isFollowing: false },
  { id: '3', username: 'alex123', avatar: require('../assets/images/icon.png'), isFollowing: true },
  { id: '4', username: 'sophia', avatar: require('../assets/images/icon.png'), isFollowing: false },
];

interface FollowersModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
}

export default function FollowersModal({ visible, onClose, title }: FollowersModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* User List */}
          <FlatList
            data={dummyUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userRow}>
                <Image source={item.avatar} style={styles.avatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.username}>{item.username}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.followButton, { backgroundColor: item.isFollowing ? '#fff' : '#0095f6' }]}
                >
                  <Text style={{ color: item.isFollowing ? '#000' : '#fff', fontWeight: 'bold' }}>
                    {item.isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 5,
  },
  title: { fontSize: 18, fontWeight: 'bold' },
  closeButton: { fontSize: 20, color: '#888' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  avatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 10 },
  username: { fontWeight: '500', fontSize: 15 },
  followButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
});
