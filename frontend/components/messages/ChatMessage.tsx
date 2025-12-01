import { ChatMessageProps } from '@/types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ChatMessage = ({ message, onLongPress }: ChatMessageProps) => {
    const { text, timestamp, isMe, avatar, type = 'text', imageUrl, status, isEdited, isRecalled } = message;

    // Không hiển thị tin nhắn đã thu hồi
    if (isRecalled) {
        return null;
    }

    const handleLongPress = () => {
        if (isMe && onLongPress) {
            onLongPress(message);
        }
    };

    const MessageBubble = ({ children }: { children: React.ReactNode }) => {
        if (isMe) {
            return (
                <TouchableOpacity
                    style={[styles.bubble, styles.myBubble]}
                    onLongPress={handleLongPress}
                    delayLongPress={500}
                    activeOpacity={0.8}
                >
                    {children}
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={[styles.bubble, styles.theirBubble]}>
                    {children}
                </View>
            );
        }
    };

    return (
        <View style={[styles.container, isMe ? styles.myMessage : styles.theirMessage]}>
            {!isMe && (
                <Image
                    source={{ 
                        uri: avatar || 'https://via.placeholder.com/30x30/CCCCCC/FFFFFF?text=U' 
                    }}
                    style={styles.avatar}
                    onError={() => console.warn('Avatar load failed:', avatar)}
                />
            )}

            <MessageBubble>
                {type === 'image' && imageUrl && (
                    <Image source={{ uri: imageUrl }} style={styles.messageImage} />
                )}

                {text && (
                    <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>
                        {text}
                        {isEdited && <Text style={styles.editedText}> (đã chỉnh sửa)</Text>}
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
            </MessageBubble>

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
    editedText: {
        fontSize: 12,
        fontStyle: 'italic',
        opacity: 0.7,
    },
});

export default ChatMessage;