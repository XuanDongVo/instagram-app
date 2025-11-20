import MessageHeader from '@/components/messages/MessageHeader';
import MessageList from '@/components/messages/MessageList';
import SearchBar from '@/components/messages/SearchBar';
import { useChatList, useUserPresence } from '@/hooks/useChat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet } from 'react-native';

interface CurrentUser {
    id: string;
    name: string;
    avatar?: string;
    email: string;
}

export default function MessagesIndex() {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Load current user from storage
    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            const userDataString = await AsyncStorage.getItem('currentUser');
            if (userDataString) {
                const userData = JSON.parse(userDataString);
                setCurrentUser(userData);
            } else {
                // Redirect to login if no user found
                router.replace('/login');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            router.replace('/login');
        }
    };

    // Use chat hooks
    const {
        chats,
        loading,
        error,
        refreshing,
        refresh,
        createChat,
        searchUsers
    } = useChatList({ currentUser: currentUser! });

    // Set up user presence
    useUserPresence(currentUser!);

    const handleSearch = useCallback(async (searchText: string) => {
        if (!currentUser) return;

        if (searchText.trim() === '') {
            setSearchResults([]);
            setIsSearching(false);
        } else {
            setIsSearching(true);
            try {
                const users = await searchUsers(searchText);
                setSearchResults(users);
            } catch (err) {
                console.error('Search error:', err);
                setSearchResults([]);
            }
        }
    }, [currentUser, searchUsers]);

    const handleRefresh = useCallback(async () => {
        await refresh();
    }, [refresh]);

    const handleVideoCall = useCallback(() => {
        Alert.alert('Video Call', 'Video call feature coming soon!');
    }, []);

    const handleNewMessage = useCallback(async () => {
        Alert.alert(
            'New Message',
            'Search for users to start a new conversation',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Search Users',
                    onPress: () => {
                        // Focus search bar or show user search modal
                        console.log('Open user search');
                    }
                }
            ]
        );
    }, []);

    const handleChatPress = useCallback((chatId: string, otherUserId: string) => {
        router.push(`/messages/${chatId}?otherUserId=${otherUserId}`);
    }, []);

    const handleUserPress = useCallback(async (user: any) => {
        if (!currentUser) return;

        try {
            const chatId = await createChat(user.id);
            router.push(`/messages/${chatId}?otherUserId=${user.id}`);
        } catch (err) {
            Alert.alert('Error', 'Failed to create chat');
        }
    }, [currentUser, createChat]);

    // Show loading or error states
    if (!currentUser) {
        return null; // Or loading spinner
    }

    if (error) {
        Alert.alert('Error', error);
    }

    return (
        <SafeAreaView style={styles.container}>
            <MessageHeader
                username={currentUser.name}
                onVideoCall={handleVideoCall}
                onNewMessage={handleNewMessage}
            />
            <SearchBar
                placeholder="Tìm kiếm người dùng hoặc cuộc trò chuyện"
                onSearchChange={handleSearch}
            />
            <MessageList
                messages={isSearching ? searchResults.map(user => ({
                    id: user.id,
                    name: user.name || user.userName,
                    lastMessage: user.email,
                    avatar: user.profileImage || '',
                    timestamp: '',
                    isOnline: user.isOnline || false,
                    hasCamera: false
                })) : chats}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                onItemPress={isSearching ? handleUserPress : (item) => {
                    // Extract other user ID from chat participants
                    const otherUserId = 'other_user_id'; // TODO: Get from chat data
                    handleChatPress(item.id, otherUserId);
                }}
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
