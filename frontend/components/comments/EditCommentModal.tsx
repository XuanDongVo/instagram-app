import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { EditCommentModalProps } from '../../types/comment';

export default function EditCommentModal({ visible, initialValue, onSave, onCancel }: EditCommentModalProps) {
    const [value, setValue] = useState(initialValue);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue, visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Chỉnh sửa bình luận</Text>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        multiline
                        autoFocus
                        placeholder="Nhập nội dung mới..."
                    />
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(value.trim())}>
                            <Text style={styles.saveText}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 12,
        color: '#222',
    },
    input: {
        minHeight: 60,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 10,
        fontSize: 15,
        color: '#222',
        marginBottom: 18,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    cancelBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    cancelText: {
        color: '#888',
        fontSize: 15,
        fontWeight: '500',
    },
    saveBtn: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        paddingHorizontal: 18,
        paddingVertical: 8,
    },
    saveText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});
