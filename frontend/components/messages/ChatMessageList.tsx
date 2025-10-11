import { useEffect, useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import ChatMessage, { MessageData } from './ChatMessage';

interface ChatMessageListProps {
    messages: MessageData[];
    onRefresh?: () => void;
    refreshing?: boolean;
}

export default function ChatMessageList({
    messages,
    onRefresh,
    refreshing = false
}: ChatMessageListProps) {
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages.length]);

    const renderMessage = ({ item }: { item: MessageData }) => (
        <ChatMessage message={item} />
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