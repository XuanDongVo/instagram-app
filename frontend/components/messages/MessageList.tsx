import { FlatList, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';

interface Message {
    id: string;
    name: string;
    lastMessage: string;
    avatar: string;
    timestamp: string;
    isOnline?: boolean;
    hasCamera?: boolean;
}

interface MessageListProps {
    messages: Message[];
    onRefresh?: () => void;
    refreshing?: boolean;
}

export default function MessageList({
    messages,
    onRefresh,
    refreshing = false
}: MessageListProps) {
    const renderItem = ({ item }: { item: Message }) => (
        <MessageItem
            id={item.id}
            name={item.name}
            lastMessage={item.lastMessage}
            avatar={item.avatar}
            timestamp={item.timestamp}
            isOnline={item.isOnline}
            hasCamera={item.hasCamera}
        />
    );

    return (
        <FlatList
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            style={styles.container}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ItemSeparatorComponent={() => null}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});