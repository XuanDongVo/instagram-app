import { ChatHeaderProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ChatHeader = ({
    userName,
    isOnline = false,
    avatar,
    onVideoCall,
    onVoiceCall,
    onInfo
}: ChatHeaderProps) => {
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

                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: avatar || 'https://via.placeholder.com/40' }}
                        style={styles.avatar}
                    />
                    {isOnline && <View style={styles.onlineIndicator} />}
                </View>

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{userName}</Text>
                    <Text style={styles.status}>
                        {isOnline ? 'Active now' : 'Active 2h ago'}
                    </Text>
                </View>
            </View>

            <View style={styles.rightSection}>
                <TouchableOpacity onPress={onVoiceCall} style={styles.iconButton}>
                    <Ionicons name="call-outline" size={24} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onVideoCall} style={styles.iconButton}>
                    <Ionicons name="videocam-outline" size={24} color="#000" />
                </TouchableOpacity>

                <TouchableOpacity onPress={onInfo} style={styles.iconButton}>
                    <Ionicons name="information-circle-outline" size={24} color="#000" />
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
        flex: 1,
    },
    backButton: {
        marginRight: 12,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    status: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: 8,
        marginLeft: 4,
    },
});

export default ChatHeader;