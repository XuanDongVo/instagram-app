import { ChatInputProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const ChatInput = ({
    onSendMessage,
    onSelectImage,
    onSelectCamera,
    placeholder = "Message..."
}: ChatInputProps) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage?.(message.trim());
            setMessage('');
        }
    };

    const handleImagePress = () => {
        Alert.alert(
            'Select Image',
            'Choose an option',
            [
                { text: 'Camera', onPress: onSelectCamera },
                { text: 'Gallery', onPress: onSelectImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TouchableOpacity onPress={handleImagePress} style={styles.imageButton}>
                    <Ionicons name="camera-outline" size={24} color="#3797f0" />
                </TouchableOpacity>

                <TextInput
                    style={styles.textInput}
                    value={message}
                    onChangeText={setMessage}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    multiline
                    maxLength={500}
                    blurOnSubmit={false}
                />

                <TouchableOpacity style={styles.emojiButton}>
                    <Ionicons name="happy-outline" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendButton, { opacity: message.trim() ? 1 : 0.5 }]}
                disabled={!message.trim()}
            >
                <Ionicons name="send" size={20} color="#3797f0" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderTopWidth: 0.5,
        borderTopColor: '#e0e0e0',
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8,
    },
    imageButton: {
        marginRight: 8,
        marginBottom: 2,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        maxHeight: 100,
        minHeight: 20,
        textAlignVertical: 'center',
    },
    emojiButton: {
        marginLeft: 8,
        marginBottom: 2,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
});

export default ChatInput;