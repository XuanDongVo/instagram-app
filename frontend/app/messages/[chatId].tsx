import { ChatHeader, ChatInput, ChatMessageList } from '@/components/messages';
import { MessageData } from '@/components/messages/ChatMessage';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const MOCK_MESSAGES: MessageData[] = [
    {
        id: '1',
        text: 'Hey! How are you doing?',
        timestamp: '2:30 PM',
        isMe: false,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        status: 'read',
    },
    {
        id: '2',
        text: "I'm doing great! Just finished my workout 💪",
        timestamp: '2:32 PM',
        isMe: true,
        status: 'read',
    },
    {
        id: '3',
        text: 'That\'s awesome! What kind of workout did you do?',
        timestamp: '2:33 PM',
        isMe: false,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        status: 'read',
    },
    {
        id: '4',
        text: 'I went for a 5km run and did some strength training. Feeling energized! 🏃‍♂️',
        timestamp: '2:35 PM',
        isMe: true,
        status: 'read',
    },
    {
        id: '5',
        text: 'Nice! I should probably get back to exercising too 😅',
        timestamp: '2:36 PM',
        isMe: false,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        status: 'read',
    },
    {
        id: '6',
        text: 'You should! Want to go to the gym together sometime?',
        timestamp: '2:38 PM',
        isMe: true,
        status: 'delivered',
    },
    {
        id: '7',
        text: 'That sounds like a great idea! Let me know when you\'re free',
        timestamp: '2:40 PM',
        isMe: false,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        status: 'read',
    },
    {
        id: '8',
        text: 'How about this weekend? Saturday morning?',
        timestamp: '2:42 PM',
        isMe: true,
        status: 'sent',
    },
];

export default function ChatDetail() {
    const { chatId } = useLocalSearchParams();
    const [messages, setMessages] = useState<MessageData[]>(MOCK_MESSAGES);
    const [refreshing, setRefreshing] = useState(false);

    const currentUser = MOCK_USERS[chatId as keyof typeof MOCK_USERS] || {
        name: 'Unknown User',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        isOnline: false,
    };

    const handleSendMessage = useCallback((messageText: string) => {
        const newMessage: MessageData = {
            id: Date.now().toString(),
            text: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            status: 'sent',
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);

        setTimeout(() => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
                )
            );
        }, 1000);

        setTimeout(() => {
            setMessages(prevMessages =>
                prevMessages.map(msg =>
                    msg.id === newMessage.id ? { ...msg, status: 'read' } : msg
                )
            );
        }, 2000);
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);


    const handleInfo = useCallback(() => {
        console.log('Opening user info for', currentUser.name);
    }, [currentUser.name]);

    const handleSelectImage = useCallback(() => {
        console.log('Select image from gallery');
    }, []);

    const handleSelectCamera = useCallback(() => {
        console.log('Open camera');
    }, []);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ChatHeader
                userName={currentUser.name}
                isOnline={currentUser.isOnline}
                avatar={currentUser.avatar}
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
                    refreshing={refreshing}
                />

                <ChatInput
                    onSendMessage={handleSendMessage}
                    onSelectImage={handleSelectImage}
                    onSelectCamera={handleSelectCamera}
                    placeholder="Message..."
                />
            </KeyboardAvoidingView>
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
