import ChatHeader from '@/components/messages/ChatHeader';
import ChatInput from '@/components/messages/ChatInput';
import ChatMessageList from '@/components/messages/ChatMessageList';
import MessageActionModal from '@/components/messages/MessageActionModal';
import { useChat, useImagePicker } from '@/hooks/useChat';
import { userFirebaseService } from '@/services/userFirebaseService';
import { ExtendedMessageData } from '@/types';
import { CurrentUser } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
            console.error('Error sending message:', err);
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn');
        }
    }, [currentUser, sendMessage]);

    const handleRefresh = useCallback(() => {
        console.log('Refreshing messages...');
    }, []);

    const handleVideoCall = useCallback(() => {
        if (!otherUser) return;
        console.log('Starting video call with', otherUser.name);
        Alert.alert('Video Call', `Calling ${otherUser.name}...`);
    }, [otherUser]);

    const handleVoiceCall = useCallback(() => {
        if (!otherUser) return;
        console.log('Starting voice call with', otherUser.name);
        Alert.alert('Voice Call', `Calling ${otherUser.name}...`);
    }, [otherUser]);

    const handleInfo = useCallback(() => {
        if (!otherUser) return;
        console.log('Opening user info for', otherUser.name);
        Alert.alert('User Info', `Information for ${otherUser.name}`);
    }, [otherUser]);

    const handleSelectImage = useCallback(async () => {
        try {
            const imageUri = await pickImage();
            if (imageUri) {
                await sendImage(imageUri);
            }
        } catch (err) {
            console.error('Error picking image:', err);
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
            console.error('Error taking photo:', err);
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

    const handleEditMessage = useCallback(async (message: ExtendedMessageData) => {
        Alert.prompt(
            'Chỉnh sửa tin nhắn',
            'Nhập nội dung mới:',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async (newText: string | undefined) => {
                        if (newText && newText.trim()) {
                            try {
                                await editMessage(message.id, newText.trim());
                                setShowActionModal(false);
                            } catch {
                                Alert.alert('Lỗi', 'Không thể chỉnh sửa tin nhắn');
                            }
                        }
                    }
                }
            ],
            'plain-text',
            message.text
        );
    }, [editMessage]);

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
            />
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
});