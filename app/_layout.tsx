import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from '../services/database';
import * as SplashScreen from 'expo-splash-screen';
import { 
    useFonts, 
    Poppins_400Regular, 
    Poppins_500Medium, 
    Poppins_700Bold 
} from '@expo-google-fonts/poppins';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Poppins_400Regular,
        Poppins_500Medium,
        Poppins_700Bold,
    });

    useEffect(() => {
        initDatabase();
    }, []);

    useEffect(() => {
        if (fontsLoaded || fontError) {
        SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }}/>
            <Stack.Screen name="onboarding" options={{ headerShown: false }}/>
            <Stack.Screen name="Transaction" />
            <Stack.Screen name="Goals" />
            <Stack.Screen name="Statistic" />
            <Stack.Screen name="Settings" />
        </Stack>
    );
}