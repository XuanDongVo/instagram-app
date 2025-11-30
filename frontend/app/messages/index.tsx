import MessageHeader from '@/components/messages/MessageHeader';
import MessageList from '@/components/messages/MessageList';
import SearchBar from '@/components/messages/SearchBar';
import { useChatList, useUserPresence } from '@/hooks/useChat';
import { CurrentUser } from '@/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
                router.replace('/login');
            }
        } catch (error) {
            console.error('Error loading user:', error);
            router.replace('/login');
        }
    };

    const {
        chats,
        loading,
        error,
        refreshing,
        refresh,
        createChat,
        searchUsers,
        findExistingChat
    } = useChatList({ currentUser: currentUser || { id: '', userName: '', fullName: '', email: '', accessToken: '' } });

    // Set up user presence only when currentUser is available
    useUserPresence(currentUser || { id: '', userName: '', fullName: '', email: '', accessToken: '' });

    const handleSearch = useCallback(async (searchText: string) => {
        if (!currentUser || !currentUser.id) return;

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
        if (!currentUser || !currentUser.id) return;

        try {
            const existingChat = findExistingChat(user.id);

            if (existingChat) {
                router.push(`/messages/${existingChat.id}?otherUserId=${user.id}`);
            } else {
                const chatId = await createChat(user.id, user.userName || user.name);
                router.push(`/messages/${chatId}?otherUserId=${user.id}`);
            }
        } catch (err) {
            console.error('Error handling user press:', err);
            Alert.alert('Error', 'Failed to open chat');
        }
    }, [currentUser, createChat, findExistingChat, router]);

    // Show loading or error states
    if (!currentUser || !currentUser.id) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        Alert.alert('Error', error);
    }

    return (
        <SafeAreaView style={styles.container}>
            <MessageHeader
                username={currentUser.fullName || currentUser.userName}
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
                    const chatData = chats.find(chat => chat.id === item.id);
                    if (chatData && chatData.otherUserId) {
                        handleChatPress(item.id, chatData.otherUserId);
                    } else {
                        Alert.alert('Error', 'Cannot open chat - missing user information');
                    }
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
