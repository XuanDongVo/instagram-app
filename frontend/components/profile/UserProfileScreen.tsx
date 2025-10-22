import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType  } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

type UserProfileParams = {
  user: {
    id: string;
    username: string;
    avatar: ImageSourcePropType ;
    isFollowed: boolean;
  };
};

export default function UserProfileScreen() {
  const route = useRoute<RouteProp<Record<string, UserProfileParams>, string>>();
  const { user } = route.params;
  const [isFollowed, setIsFollowed] = useState(user.isFollowed);

  const toggleFollow = () => setIsFollowed(!isFollowed);

  return (
    <View style={styles.container}>
      <Image source={user.avatar} style={styles.avatar} />
      <Text style={styles.username}>{user.username}</Text>

      <TouchableOpacity
        style={[styles.button, isFollowed ? styles.followingBtn : styles.followBtn]}
        onPress={toggleFollow}
      >
        <Text style={[styles.buttonText, isFollowed && { color: '#000' }]}>
          {isFollowed ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  username: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  button: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 6 },
  followBtn: { backgroundColor: '#0095f6' },
  followingBtn: { backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
