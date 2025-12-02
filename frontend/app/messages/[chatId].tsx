import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ChatHeader from '@/components/messages/ChatHeader';
import ChatInput from '@/components/messages/ChatInput';
import ChatMessageList from '@/components/messages/ChatMessageList';
import MessageActionModal from '@/components/messages/MessageActionModal';
import { useChat, useImagePicker } from '@/hooks/useChat';
import { userFirebaseService } from '@/services/userFirebaseService';
import { chatService } from '@/services/chatService';
import { ExtendedMessageData } from '@/types';
import { CurrentUser } from '@/types/user';

interface OtherUser {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
}

export default function ChatDetail() {
    const { chatId, otherUserId } = useLocalSearchParams();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
    const [selectedMessage, setSelectedMessage] = useState<ExtendedMessageData | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingText, setEditingText] = useState('');
    
    // UseRef để store message đang edit (backup cho trường hợp state bị reset)
    const editingMessageRef = useRef<ExtendedMessageData | null>(null);

    useEffect(() => {
        loadCurrentUser();
    }, []);

    useEffect(() => {
        if (otherUserId && typeof otherUserId === 'string') {
            loadOtherUser(otherUserId);
        }
    }, [otherUserId]);

    const loadCurrentUser = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('currentUser');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                
                try {
                    const firebaseUserData = await userFirebaseService.getUserFromFirebase(userData.id);
                    if (firebaseUserData) {
                        const user = firebaseUserData as any; 
                        userData.avatar = user.profileImage;
                    }
                } catch (firebaseError) {
                    console.warn('Could not load avatar from Firebase:', firebaseError);
                }
                
                setCurrentUser(userData);
            } else {
                router.replace('/login');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
            router.replace('/login');
        }
    };

    const loadOtherUser = async (userId: string) => {
        try {
            const userData = await userFirebaseService.getUserFromFirebase(userId);
            if (userData) {
                const user = userData as any; // Type assertion for Firebase data
                setOtherUser({
                    id: user.id,
                    name: user.name || user.userName || 'Unknown User',
                    avatar: user.profileImage,
                    isOnline: user.isOnline || false
                });
            }
        } catch (err) {
            console.error('Error loading other user:', err);
            Alert.alert('Lỗi', 'Không thể tải thông tin người chat');
        }
    };

    // Use chat hook
    const {
        messages,
        loading,
        sendMessage,
        sendImage,
        editMessage,
        deleteMessage,
        recallMessage,
        addReaction,
        removeReaction,
        changeReaction,
        markAsRead
    } = useChat({
        chatId: chatId as string,
        currentUser: currentUser!,
        otherUserId: otherUserId as string
    });

    // Image picker hook
    const { pickImage, takePhoto } = useImagePicker();

    // Mark messages as read when component mounts
    useEffect(() => {
        if (currentUser) {
            markAsRead();
        }
    }, [currentUser, markAsRead]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!currentUser) return;
        try {
            await sendMessage(messageText);
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
        }
    }, [currentUser, sendMessage]);

    const handleRefresh = useCallback(() => {
    }, []);

    const handleVideoCall = useCallback(() => {
        if (!otherUser) return;
        Alert.alert('Video Call', `Calling ${otherUser.name}...`);
    }, [otherUser]);

    const handleVoiceCall = useCallback(() => {
        if (!otherUser) return;
        Alert.alert('Voice Call', `Calling ${otherUser.name}...`);
    }, [otherUser]);

    const handleInfo = useCallback(() => {
        if (!otherUser) return;
        Alert.alert('User Info', `Information for ${otherUser.name}`);
    }, [otherUser]);

    const handleSelectImage = useCallback(async () => {
        try {
            const imageUri = await pickImage();
            if (imageUri) {
                await sendImage(imageUri);
            }
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể gửi ảnh');
        }
    }, [pickImage, sendImage]);

    const handleSelectCamera = useCallback(async () => {
        try {
            const imageUri = await takePhoto();
            if (imageUri) {
                await sendImage(imageUri);
            }
        } catch (err) {
            Alert.alert('Lỗi', 'Không thể chụp ảnh');
        }
    }, [takePhoto, sendImage]);

    const handleMessageLongPress = useCallback((message: ExtendedMessageData) => {
        setSelectedMessage(message);
        setShowActionModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowActionModal(false);
        setSelectedMessage(null);
    }, []);

    const handleCloseActionModalOnly = useCallback(() => {
        setShowActionModal(false);
    }, []);

    const handleEditMessage = useCallback(async (message: ExtendedMessageData) => {
        setEditingText(message.text);
        setSelectedMessage(message);
        editingMessageRef.current = message;
        
        setShowEditModal(true);
        handleCloseActionModalOnly();
    }, [handleCloseActionModalOnly, selectedMessage]);

    const handleConfirmEdit = useCallback(async () => {
        const messageToEdit = selectedMessage || editingMessageRef.current;
        
        if (!messageToEdit) {
            return;
        }
        
        if (editingText && editingText.trim()) {
            try {
                await editMessage(messageToEdit.id, editingText.trim());
                setShowEditModal(false);
                setSelectedMessage(null);
                editingMessageRef.current = null;
                setEditingText('');
            } catch (error) {
                Alert.alert('Lỗi', 'Không thể chỉnh sửa tin nhắn');
            }
        }
    }, [selectedMessage, editingText, editMessage]);

    const handleCancelEdit = useCallback(() => {
        setShowEditModal(false);
        setSelectedMessage(null);
        setEditingText('');
    }, []);

    const handleRecallMessage = useCallback(async (message: ExtendedMessageData) => {
        Alert.alert(
            'Thu hồi tin nhắn',
            'Bạn có chắc muốn thu hồi tin nhắn này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Thu hồi',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await recallMessage(message.id);
                            setShowActionModal(false);
                        } catch {
                            Alert.alert('Lỗi', 'Không thể thu hồi tin nhắn');
                        }
                    }
                }
            ]
        );
    }, [recallMessage]);

    const handleDeleteMessage = useCallback(async (message: ExtendedMessageData) => {
        Alert.alert(
            'Xóa tin nhắn',
            'Bạn có chắc muốn xóa tin nhắn này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMessage(message.id);
                            setShowActionModal(false);
                        } catch {
                            Alert.alert('Lỗi', 'Không thể xóa tin nhắn');
                        }
                    }
                }
            ]
        );
    }, [deleteMessage]);

    const handleReactionPress = useCallback(async (emoji: string) => {
        if (!selectedMessage || !currentUser) return;
        
        try {
            // Kiểm tra xem user đã react với tin nhắn này chưa
            const existingReaction = selectedMessage.reactions?.find(
                reaction => reaction.userId === currentUser.id
            );
            
            if (existingReaction) {
                if (existingReaction.emoji === emoji) {
                    // Nếu click vào cùng emoji -> xóa reaction
                    await removeReaction(selectedMessage.id);
                } else {
                    // Nếu click vào emoji khác -> đổi reaction
                    await changeReaction(selectedMessage.id, emoji);
                }
            } else {
                // Chưa có reaction -> thêm mới
                await addReaction(selectedMessage.id, emoji);
            }
            
            setShowActionModal(false);
        } catch (error) {
            console.error('Error handling reaction:', error);
            Alert.alert('Lỗi', 'Không thể xử lý phản ứng');
        }
    }, [selectedMessage, currentUser, addReaction, removeReaction, changeReaction]);

    const handleMoreReactions = useCallback(async () => {
        Alert.alert('Tính năng cập nhật sau');
    }, [selectedMessage, currentUser]);

    // Show loading or error states
    if (!currentUser || !otherUser) {
        return null; 
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ChatHeader
                userName={otherUser.name}
                isOnline={otherUser.isOnline}
                avatar={otherUser.avatar}
                onVideoCall={handleVideoCall}
                onVoiceCall={handleVoiceCall}
                onInfo={handleInfo}
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ChatMessageList
                    messages={messages}
                    onRefresh={handleRefresh}
                    refreshing={loading}
                    onMessageLongPress={handleMessageLongPress}
                />

                <ChatInput
                    onSendMessage={handleSendMessage}
                    onSelectImage={handleSelectImage}
                    onSelectCamera={handleSelectCamera}
                    placeholder="Nhập tin nhắn..."
                />
            </KeyboardAvoidingView>

            <MessageActionModal
                visible={showActionModal}
                message={selectedMessage}
                onClose={handleCloseModal}
                onEdit={handleEditMessage}
                onRecall={handleRecallMessage}
                onDelete={handleDeleteMessage}
                onReactionPress={handleReactionPress}
                onMoreReactions={handleMoreReactions}
                currentUserReaction={
                    selectedMessage?.reactions?.find(r => r.userId === currentUser?.id)?.emoji || null
                }
                isCurrentUserMessage={selectedMessage?.isMe || false}
            />

            {/* Edit Modal */}
            <Modal
                visible={showEditModal}
                transparent
                animationType="fade"
                onRequestClose={handleCancelEdit}
            >
                <View style={styles.editModalOverlay}>
                    <View style={styles.editModalContent}>
                        <Text style={styles.editModalTitle}>Chỉnh sửa tin nhắn</Text>
                        <TextInput
                            style={styles.editModalInput}
                            value={editingText}
                            onChangeText={setEditingText}
                            multiline
                            placeholder="Nhập nội dung mới..."
                            autoFocus
                        />
                        <View style={styles.editModalButtons}>
                            <TouchableOpacity 
                                style={[styles.editModalButton, styles.cancelButton]} 
                                onPress={handleCancelEdit}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.editModalButton, styles.confirmButton]} 
                                onPress={handleConfirmEdit}
                            >
                                <Text style={styles.confirmButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    editModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    editModalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    editModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    editModalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    editModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    editModalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    confirmButton: {
        backgroundColor: '#3797f0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
});