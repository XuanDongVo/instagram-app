import React from 'react';
import { MessageActionModalProps, MessageActionType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import ReactionBar from './ReactionBar';
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const messageActions: MessageActionType[] = [
    {
        id: 'edit',
        title: 'Chỉnh sửa',
        icon: 'create-outline',
        color: '#3797f0',
    },
    {
        id: 'recall',
        title: 'Thu hồi',
        icon: 'arrow-undo-outline',
        color: '#ff9500',
    },
    {
        id: 'delete',
        title: 'Xóa',
        icon: 'trash-outline',
        color: '#ff3b30',
    },
];

const MessageActionModal = ({
    visible,
    message,
    onClose,
    onEdit,
    onRecall,
    onDelete,
    onReactionPress,
    onMoreReactions,
    currentUserReaction,
    isCurrentUserMessage = false,
}: MessageActionModalProps) => {
    const handleAction = (actionId: string) => {
        if (!message) return;

        switch (actionId) {
            case 'edit':
                onEdit?.(message);
                break;
            case 'recall':
                onRecall?.(message);
                break;
            case 'delete':
                onDelete?.(message);
                break;
        }
        onClose();
    };

    const handleReactionPress = (emoji: string) => {
        onReactionPress?.(emoji);
    };

    const handleMorePress = () => {
        onMoreReactions?.();
    };

    if (!message) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                {/* Reaction Bar */}
                <View style={styles.reactionBarContainer}>
                    <ReactionBar
                        onReactionPress={handleReactionPress}
                        onMorePress={handleMorePress}
                        currentUserReaction={currentUserReaction}
                    />
                </View>

                {/* Chỉ hiển thị action buttons nếu đó là tin nhắn của current user */}
                {isCurrentUserMessage && (
                    <View style={styles.modalContainer}>
                        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                            {/* Action Buttons */}
                            <View style={styles.actionsContainer}>
                                {messageActions.map((action) => (
                                    <TouchableOpacity
                                        key={action.id}
                                        style={styles.actionButton}
                                        onPress={() => handleAction(action.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                                            <Ionicons name={action.icon as any} size={20} color="#fff" />
                                        </View>
                                        <Text style={styles.actionText}>{action.title}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Pressable>
                    </View>
                )}
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        justifyContent: 'center',
    },

    modalContainer: {
        width: '20%',
        position: 'absolute',
        bottom: 180,
        right: 50 % - (screenWidth * 0.2) / 2,
    },

    modalContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 10,
    },

    dragIndicator: {
        width: 30,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
    },

    reactionBarContainer: {
        marginBottom: 250,
        alignItems: 'center',
    },

    messagePreview: {
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    previewBubble: {
        maxWidth: '85%',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    myBubble: {
        backgroundColor: '#3797f0',
        borderBottomRightRadius: 4,
    },
    previewText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 20,
    },
    previewTimestamp: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 4,
        textAlign: 'right',
    },
    actionsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-around',
    },
    actionButton: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 8,
    },
    actionIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        color: 'rgba(0, 0, 0, 0.8)', 
        fontWeight: '500',
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
});

export default MessageActionModal;