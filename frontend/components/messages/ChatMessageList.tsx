import { ChatMessageListProps, MessageData } from '@/types';
import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ChatMessage from './ChatMessage';

const ChatMessageList = ({
    messages,
    onRefresh,
    refreshing = false,
    onMessageLongPress
}: ChatMessageListProps) => {
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const renderMessage = ({ item }: { item: MessageData }) => (
        <ChatMessage message={item} onLongPress={onMessageLongPress} />
    );

    return (
        <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            inverted={false}
            maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
            }}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingVertical: 8,
    },
});

export default ChatMessageList;