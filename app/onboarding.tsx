import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { completeOnboarding } from '../services/database';

const EMOJI_LIST = ['👨‍💻', '👩‍💻', '😎', '🤓', '🦊', '🐼', '🐯', '🤖', '👻', '👽'];

export default function OnboardingScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState(EMOJI_LIST[0]);

    const handleStart = () => {
        if (!name.trim()) {
        alert('Tulis namamu dulu ya!');
        return;
        }

        completeOnboarding(name, selectedEmoji);
        router.replace('/');
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.topDecoration}>
                    <View style={styles.circleLarge} />
                    <View style={styles.circleSmall} />
                </View>

                <View style={styles.content}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>{selectedEmoji}</Text>
                    </View>
                    
                    <Text style={styles.title}>Selamat Datang di Fulus</Text>
                    <Text style={styles.subtitle}>Mari personalisasi profilmu sebelum mulai mencatat keuangan.</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Nama Panggilan</Text>
                        <TextInput 
                            style={styles.input}
                            placeholder="Contoh: Julius"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Pilih Avatar</Text>
                        <View style={styles.emojiGrid}>
                        {EMOJI_LIST.map((emoji, index) => (
                            <TouchableOpacity 
                                key={index}
                                style={[styles.emojiBtn, selectedEmoji === emoji && styles.emojiBtnActive]}
                                onPress={() => setSelectedEmoji(emoji)}
                            >
                                <Text style={styles.emojiItemText}>{emoji}</Text>
                            </TouchableOpacity>
                        ))}
                        </View>
                    </View>
                </View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.8}>
                        <Text style={styles.startBtnText}>Mulai Kelola Uang</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    
    topDecoration: { height: 200, width: '100%', backgroundColor: '#10B981', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, position: 'relative', overflow: 'hidden' },
    circleLarge: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255,255,255,0.1)', top: -100, right: -50 },
    circleSmall: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)', bottom: -50, left: -50 },

    content: { flex: 1, alignItems: 'center', marginTop: -60, paddingHorizontal: 30 },
    iconContainer: { width: 120, height: 120, backgroundColor: 'white', borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, marginBottom: 24 },
    iconText: { fontSize: 60 },
    
    title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 30 },

    inputContainer: { width: '100%', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
    input: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, fontSize: 16, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
    
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    emojiBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    emojiBtnActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
    emojiItemText: { fontSize: 24 },

    bottomContainer: { padding: 24, paddingBottom: 40 },
    startBtn: { backgroundColor: '#10B981', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    startBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});