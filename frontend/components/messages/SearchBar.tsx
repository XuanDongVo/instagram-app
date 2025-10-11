import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
    placeholder?: string;
    onSearchChange?: (text: string) => void;
}

export default function SearchBar({
    placeholder = "Search",
    onSearchChange
}: SearchBarProps) {
    const [searchText, setSearchText] = useState('');

    const handleTextChange = (text: string) => {
        setSearchText(text);
        onSearchChange?.(text);
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={16} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={handleTextChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
});