import { initDatabase } from '@/services/database';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function RootLayout() {
    useEffect(() => {
        initDatabase();
    }, []);
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
        </Stack>
    );
}