import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { completeOnboarding } from '../services/database';

const EMOJI_LIST = ['👨‍💻', '👩‍💻', '😎'];

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
                <View style={styles.content}>
                    <Text style={styles.title}>Selamat Datang di Fulus</Text>
                    <Text style={styles.subtitle}>Mulai Atur Alur Keuanganmu</Text>
                    
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
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>{selectedEmoji}</Text>
                            </View>
                        </View>
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
    container: { flex: 1, backgroundColor: '#05B084' },
    
    content: { flex: 1, alignItems: 'center', marginTop: 50, paddingHorizontal: 40 },
    iconContainer: { width: 100, height: 100, backgroundColor: 'white', borderRadius: 60, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, marginBottom: 24 },
    iconText: { fontSize: 60 },
    
    title: { fontSize: 32, fontWeight: 'bold', color: '#F1EDEA', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 20, fontWeight: 'semibold', color: '#F1EDEA', textAlign: 'center', marginBottom: 40 },

    inputContainer: { width: '100%', marginBottom: 20 },
    label: { fontSize: 18, fontWeight: 'bold', color: '#F1EDEA', marginBottom: 8 },
    input: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, fontSize: 16, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
    
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    emojiBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
    emojiBtnActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
    emojiItemText: { fontSize: 24 },

    bottomContainer: { padding: 24, paddingBottom: 40 },
    startBtn: { backgroundColor: 'white', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: "#10B981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    startBtnText: { color: '#05B084', fontSize: 18, fontWeight: 'bold' }
});