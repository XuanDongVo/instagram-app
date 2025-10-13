import MessageHeader from '@/components/messages/MessageHeader';
import MessageList from '@/components/messages/MessageList';
import SearchBar from '@/components/messages/SearchBar';
import { useCallback, useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

const MOCK_MESSAGES = [
    {
        id: 'jefferey',
        name: 'Jefferey Williams',
        lastMessage: 'Seen on Monday',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        timestamp: '',
        isOnline: false,
        hasCamera: true,
    },
    {
        id: 'talia',
        name: 'Talia Gomez',
        lastMessage: 'Seen on Wednesday',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c05723?w=100&h=100&fit=crop&crop=face',
        timestamp: '',
        isOnline: false,
        hasCamera: true,
    },
    {
        id: 'francis',
        name: 'Francis Ofori',
        lastMessage: 'Active 1hr ago',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        timestamp: '',
        isOnline: false,
        hasCamera: true,
    },
    {
        id: 'jordan',
        name: 'Jordan Amil',
        lastMessage: 'Active now',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
        timestamp: '',
        isOnline: true,
        hasCamera: true,
    },
    {
        id: 'jade',
        name: 'Jade Chen',
        lastMessage: 'Sent',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        timestamp: '',
        isOnline: false,
        hasCamera: true,
    },
    {
        id: 'sombrero',
        name: 'sombrero_dude',
        lastMessage: 'See you very soon.',
        avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop&crop=face',
        timestamp: '1w',
        isOnline: false,
        hasCamera: true,
    },
];

export default function MessagesIndex() {
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [refreshing, setRefreshing] = useState(false);

    const handleSearch = useCallback((searchText: string) => {
        if (searchText.trim() === '') {
            setMessages(MOCK_MESSAGES);
        } else {
            const filteredMessages = MOCK_MESSAGES.filter(message =>
                message.name.toLowerCase().includes(searchText.toLowerCase())
            );
            setMessages(filteredMessages);
        }
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    }, []);

    const handleVideoCall = useCallback(() => {
        console.log('Video call pressed');
    }, []);

    const handleNewMessage = useCallback(() => {
        console.log('New message pressed');
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <MessageHeader
                username="shaliindofficial"
                onVideoCall={handleVideoCall}
                onNewMessage={handleNewMessage}
            />
            <SearchBar
                placeholder="Search"
                onSearchChange={handleSearch}
            />
            <MessageList
                messages={messages}
                onRefresh={handleRefresh}
                refreshing={refreshing}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
