import { MessageItemProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MessageItem = ({
    id,
    name,
    lastMessage,
    avatar,
    timestamp,
    isOnline = false,
    hasCamera = true,
    onPress
}: MessageItemProps) => {
    const router = useRouter();

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            // Default behavior
            router.push({
                pathname: '/messages/[chatId]',
                params: { chatId: id }
            });
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress}>
            <View style={styles.leftSection}>
                <View style={styles.avatarContainer}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    {isOnline && <View style={styles.onlineIndicator} />}
                </View>
            </View>

            <View style={styles.middleSection}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>{lastMessage}</Text>
            </View>

            <View style={styles.rightSection}>
                {hasCamera && (
                    <TouchableOpacity style={styles.cameraButton}>
                        <Ionicons name="camera-outline" size={20} color="#999" />
                    </TouchableOpacity>
                )}
                <Text style={styles.timestamp}>{timestamp}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    leftSection: {
        marginRight: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ade80',
        borderWidth: 2,
        borderColor: '#fff',
    },
    middleSection: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    lastMessage: {
        fontSize: 14,
        color: '#666',
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    cameraButton: {
        padding: 4,
        marginBottom: 4,
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
    },
});

export default MessageItem;