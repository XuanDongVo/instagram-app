import ChatHeader from '@/components/messages/ChatHeader';
import ChatInput from '@/components/messages/ChatInput';
import ChatMessageList from '@/components/messages/ChatMessageList';
import MessageActionModal from '@/components/messages/MessageActionModal';
import { MessageData } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFirebaseChat } from '@/hooks/useFirebaseChat';

// Mock users for demo - trong thực tế sẽ lấy từ Firebase
const MOCK_USERS = {
    'jefferey': {
        name: 'Jefferey Williams',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        isOnline: false,
    },
    'talia': {
        name: 'Talia Gomez',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c05723?w=100&h=100&fit=crop&crop=face',
        isOnline: true,
    },
    'francis': {
        name: 'Francis Ofori',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        isOnline: false,
    },
    'jordan': {
        name: 'Jordan Amil',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        isOnline: true,
    },
};

export default function ChatDetail() {
    const { chatId } = useLocalSearchParams();

    // Firebase chat hook
    const currentUserId = 'current_user_id'; // Thay bằng ID user thật từ auth
    const conversationId = chatId as string;

    const {
        messages,
        loading,
        error,
        sendMessage,
        editMessage,
        recallMessage,
        deleteMessage,
        markAsRead
    } = useFirebaseChat(conversationId, currentUserId);

    const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);

    // Get user info for header (mock data for now)
    const currentUser = MOCK_USERS[chatId as keyof typeof MOCK_USERS] || {
        name: 'Unknown User',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        isOnline: false,
    };

    // Mark messages as read when component mounts
    useEffect(() => {
        markAsRead();
    }, [markAsRead]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        await sendMessage(messageText);
    }, [sendMessage]);

    const handleRefresh = useCallback(() => {
        // Firebase tự động refresh qua realtime listener
        console.log('Refreshing messages...');
    }, []);

    const handleVideoCall = useCallback(() => {
        console.log('Starting video call with', currentUser.name);
        Alert.alert('Video Call', `Calling ${currentUser.name}...`);
    }, [currentUser.name]);

    const handleVoiceCall = useCallback(() => {
        console.log('Starting voice call with', currentUser.name);
        Alert.alert('Voice Call', `Calling ${currentUser.name}...`);
    }, [currentUser.name]);

    const handleInfo = useCallback(() => {
        console.log('Opening user info for', currentUser.name);
        Alert.alert('User Info', `Information for ${currentUser.name}`);
    }, [currentUser.name]);

    const handleSelectImage = useCallback(() => {
        console.log('Select image from gallery');
        Alert.alert('Image', 'Image upload feature coming soon!');
    }, []);

    const handleSelectCamera = useCallback(() => {
        console.log('Open camera');
        Alert.alert('Camera', 'Camera feature coming soon!');
    }, []);

    const handleMessageLongPress = useCallback((message: MessageData) => {
        setSelectedMessage(message);
        setShowActionModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowActionModal(false);
        setSelectedMessage(null);
    }, []);

    const handleEditMessage = useCallback(async (message: MessageData) => {
        Alert.prompt(
            'Chỉnh sửa tin nhắn',
            'Nhập nội dung mới:',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async (newText: string | undefined) => {
                        if (newText && newText.trim()) {
                            await editMessage(message.id, newText.trim());
                            setShowActionModal(false);
                        }
                    }
                }
            ],
            'plain-text',
            message.text
        );
    }, [editMessage]);

    const handleRecallMessage = useCallback(async (message: MessageData) => {
        Alert.alert(
            'Thu hồi tin nhắn',
            'Bạn có chắc muốn thu hồi tin nhắn này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Thu hồi',
                    style: 'destructive',
                    onPress: async () => {
                        await recallMessage(message.id);
                        setShowActionModal(false);
                    }
                }
            ]
        );
    }, [recallMessage]);

    const handleDeleteMessage = useCallback(async (message: MessageData) => {
        Alert.alert(
            'Xóa tin nhắn',
            'Bạn có chắc muốn xóa tin nhắn này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteMessage(message.id);
                        setShowActionModal(false);
                    }
                }
            ]
        );
    }, [deleteMessage]);

    // Show error if any
    if (error) {
        Alert.alert('Lỗi', error);
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ChatHeader
                userName={currentUser.name}
                isOnline={currentUser.isOnline}
                avatar={currentUser.avatar}
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