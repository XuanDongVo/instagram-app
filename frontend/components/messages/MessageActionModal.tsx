import { MessageActionModalProps, MessageActionType } from '@/types';
import { Ionicons } from '@expo/vector-icons';
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

    if (!message) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <View style={styles.modalContainer}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        {/* Message Preview */}
                        <View style={styles.messagePreview}>
                            <View style={[styles.previewBubble, styles.myBubble]}>
                                <Text style={styles.previewText} numberOfLines={2}>
                                    {message.text}
                                </Text>
                                <Text style={styles.previewTimestamp}>{message.timestamp}</Text>
                            </View>
                        </View>

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

                        {/* Cancel Button */}
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Hủy</Text>
                        </TouchableOpacity>
                    </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: screenWidth - 40,
        maxWidth: 320,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 25,
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
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 10,
    },
    actionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        color: '#333',
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