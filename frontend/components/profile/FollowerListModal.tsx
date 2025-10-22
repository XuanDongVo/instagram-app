import React from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface User {
  id: string;
  username: string;
  avatar: any; // nếu bạn dùng require(...) hoặc uri thì có thể thay bằng { uri: string }
}

interface FollowerListModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  users: User[];
  onSelectUser: (user: User) => void;
}

export default function FollowerListModal({ visible, onClose, title, users, onSelectUser }:FollowerListModalProps) {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userRow}
                onPress={() => {
                  onSelectUser(item);
                  onClose();
                }}
              >
                <Image source={item.avatar} style={styles.avatar} />
                <Text style={styles.username}>{item.username}</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    height: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 10,
  },
  title: { fontSize: 18, fontWeight: '600' },
  close: { fontSize: 28, color: '#555' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  username: { fontSize: 16 },
});
