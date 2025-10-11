import { Image, StyleSheet, Text, View } from 'react-native';

export interface MessageData {
    id: string;
    text: string;
    timestamp: string;
    isMe: boolean;
    avatar?: string;
    type?: 'text' | 'image';
    imageUrl?: string;
    status?: 'sent' | 'delivered' | 'read';
}

interface ChatMessageProps {
    message: MessageData;
}

export default function ChatMessage({ message }: ChatMessageProps) {
    const { text, timestamp, isMe, avatar, type = 'text', imageUrl, status } = message;

    return (
        <View style={[styles.container, isMe ? styles.myMessage : styles.theirMessage]}>
            {!isMe && (
                <Image
                    source={{ uri: avatar || 'https://via.placeholder.com/30' }}
                    style={styles.avatar}
                />
            )}

            <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                {type === 'image' && imageUrl && (
                    <Image source={{ uri: imageUrl }} style={styles.messageImage} />
                )}

                {text && (
                    <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                        {text}
                    </Text>
                )}

                <View style={styles.messageInfo}>
                    <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.theirTimestamp]}>
                        {timestamp}
                    </Text>

                    {isMe && status && (
                        <Text style={styles.status}>
                            {status === 'read' ? '✓✓' : status === 'delivered' ? '✓' : '○'}
                        </Text>
                    )}
                </View>
            </View>

            {isMe && (
                <View style={styles.avatarPlaceholder} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 4,
        paddingHorizontal: 16,
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    theirMessage: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    avatarPlaceholder: {
        width: 38,
    },
    bubble: {
        maxWidth: '75%',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    myBubble: {
        backgroundColor: '#3797f0',
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: '#f0f0f0',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
    },
    myText: {
        color: '#fff',
    },
    theirText: {
        color: '#000',
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 12,
        marginBottom: 4,
    },
    messageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        justifyContent: 'flex-end',
    },
    timestamp: {
        fontSize: 11,
        marginRight: 4,
    },
    myTimestamp: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    theirTimestamp: {
        color: '#666',
    },
    status: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
    },
});