import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommentActionSheetProps {
  visible: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function CommentActionSheet({ visible, onEdit, onDelete, onCancel }: CommentActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.action} onPress={onEdit}>
            <Ionicons name="create-outline" size={22} color="#2563eb" style={styles.icon} />
            <Text style={styles.editText}>Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.action} onPress={onDelete}>
            <Ionicons name="trash-outline" size={22} color="#ef4444" style={styles.icon} />
            <Text style={styles.deleteText}>Xóa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={onCancel}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  icon: {
    marginRight: 12,
  },
  editText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
  },
});
