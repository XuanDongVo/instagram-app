import { MessageItemProps, MessageListProps } from '@/types';
import { FlatList, StyleSheet } from 'react-native';
import MessageItem from './MessageItem';

const MessageList = ({
    messages,
    onRefresh,
    refreshing = false
}: MessageListProps) => {
    const renderItem = ({ item }: { item: MessageItemProps }) => (
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

export default MessageList;