import { Stack } from 'expo-router';

export default function MessageLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{
                    title: 'Messages',
                    headerBackTitle: 'Back',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="[chatId]"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}
