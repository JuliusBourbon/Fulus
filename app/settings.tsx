import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { resetDatabase, initDatabase } from '../services/database';

export default function SettingsScreen() {
    const router = useRouter();

    const handleReset = () => {
        Alert.alert(
            "Reset Data Aplikasi",
            "Apakah kamu yakin? Semua data dompet, transaksi, tujuan, dan profil akan dihapus permanen.",
            [
                { text: "Batal", style: "cancel" },
                { 
                text: "Ya, Hapus Semua", 
                style: "destructive",
                onPress: () => {
                    const success = resetDatabase();
                    if (success) {
                        initDatabase();
                        router.replace('/onboarding');
                    } else {
                        alert("Gagal mereset data.");
                    }
                }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Zona Berbahaya</Text>
                <Text style={styles.description}>
                    Tindakan ini akan mengembalikan aplikasi ke kondisi awal (seperti baru di-install).
                </Text>
                
                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                    <Text style={styles.resetBtnText}>Reset Semua Data</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 16, paddingVertical: 8 },
    backText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    
    content: { padding: 24, marginTop: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#EF4444', marginBottom: 8 }, // Warna merah
    description: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 20 },
    
    resetBtn: { backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
    resetBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 16 }
});