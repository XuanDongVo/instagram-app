import { ChatMessageProps } from '@/types';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';

const ChatMessage = ({ message, onLongPress }: ChatMessageProps) => {
    const { text, timestamp, isMe, avatar, type = 'text', imageUrl, status, isEdited, isRecalled, reactions } = message;

    // Không hiển thị tin nhắn đã thu hồi
    if (isRecalled) {
        return null;
    }

    const handleLongPress = () => {
        if (onLongPress) {
            onLongPress(message);
        }
    };

    const MessageBubble = ({ children }: { children: React.ReactNode }) => {
        return (
            <TouchableOpacity
                style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}
                onLongPress={handleLongPress}
                delayLongPress={500}
                activeOpacity={0.8}
            >
                {children}
            </TouchableOpacity>
        );
    };

    // Render reactions nếu có - inline với bubble
    const renderReactions = () => {
        if (!reactions || reactions.length === 0) {
            return null;
        }

        const groupedReactions = reactions.reduce((acc, reaction) => {
            if (acc[reaction.emoji]) {
                acc[reaction.emoji].push(reaction);
            } else {
                acc[reaction.emoji] = [reaction];
            }
            return acc;
        }, {} as Record<string, typeof reactions>);

        return (
            <View style={[
                styles.reactionsContainer, 
                isMe ? styles.myReactions : styles.theirReactions
            ]}>
                {Object.entries(groupedReactions).map(([emoji, reactionList]) => (
                    <TouchableOpacity
                        key={emoji}
                        style={styles.reactionBubble}
                        onPress={() => {
                            const userNames = reactionList.map(r => r.userName).join(', ');
                            Alert.alert(
                                `Phản ứng ${emoji}`,
                                `${userNames} đã thả ${emoji} cho tin nhắn này`
                            );
                        }}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.reactionEmoji}>{emoji}</Text>
                        {reactionList.length > 1 && (
                            <Text style={styles.reactionCount}>{reactionList.length}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={[
            styles.container, 
            isMe ? styles.myMessage : styles.theirMessage,
            reactions && reactions.length > 0 && styles.containerWithReactions
        ]}>
            {!isMe && (
                <Image
                    source={{ 
                        uri: avatar || 'https://via.placeholder.com/30x30/CCCCCC/FFFFFF?text=U' 
                    }}
                    style={styles.avatar}
                    onError={() => console.warn('Avatar load failed:', avatar)}
                />
            )}

            <View style={styles.messageContainer}>
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

                    {/* Hiển thị reactions inline với bubble */}
                    {renderReactions()}
                </MessageBubble>
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
        overflow: 'visible',
    },
    containerWithReactions: {
        marginBottom: 12,
    },
    myMessage: {
        justifyContent: 'flex-end',
    },
    theirMessage: {
        justifyContent: 'flex-start',
    },
    messageContainer: {
        maxWidth: '75%',
        position: 'relative',
        overflow: 'visible', // Để reactions không bị cắt
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
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        position: 'relative',
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
    reactionsContainer: {
        position: 'absolute',
        bottom: -8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        minWidth: 120, 
        maxWidth: 300, 
    },
    myReactions: {
        bottom: -15,
        left: -10, 
    },
    theirReactions: {
        bottom: -15,
        left:25
    },
    reactionBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 4,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)', 
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    reactionEmoji: {
        fontSize: 12,
    },
    reactionCount: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
        marginLeft: 3,
    },
});

export default ChatMessage;