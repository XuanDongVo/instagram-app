import { MessageHeaderProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MessageHeader = ({
    username,
    onVideoCall,
    onNewMessage
}: MessageHeaderProps) => {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.username}>{username}</Text>
                <TouchableOpacity style={styles.dropdownButton}>
                    <Ionicons name="chevron-down" size={16} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.rightSection}>
                <TouchableOpacity onPress={onVideoCall} style={styles.iconButton}>
                    <Ionicons name="videocam-outline" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onNewMessage} style={styles.iconButton}>
                    <Ionicons name="create-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 8,
    },
    username: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        marginRight: 4,
    },
    dropdownButton: {
        padding: 4,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 8,
    },
});

export default MessageHeader;