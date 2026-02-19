import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { getExpenseStats } from '../services/database';

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function StatisticScreen() {
    const router = useRouter();
    // Menangkap parameter dari Home Screen
    const { walletId, walletName } = useLocalSearchParams(); 
    
    const [stats, setStats] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            const data = getExpenseStats(walletId ? Number(walletId) : undefined);
            setStats(data);
            }, [walletId])
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.title}>Statistik</Text>
                    <Text style={styles.subtitle}>{walletName ? walletName : 'Semua Dompet'}</Text>
                </View>
            </View>

            <View style={styles.content}>
                
                <View style={styles.chartPlaceholder}>
                    <View style={styles.donutHole} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Top Spend</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {stats.length === 0 ? (
                            <Text style={{textAlign: 'center', color: '#999', marginTop: 20}}>Belum ada pengeluaran</Text>
                            ) : (
                            stats.map((item, index) => (
                                <View key={index} style={styles.statItem}>
                                    <View style={styles.statLeft}>
                                        <View style={[styles.colorDot, { backgroundColor: item.color || '#ccc' }]} />
                                        <Text style={styles.statCategory}>{item.category_name}</Text>
                                    </View>
                                    <Text style={styles.statAmount}>{formatRupiah(item.total_amount)}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#05B084' },
    header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { position: 'absolute', left: 20, top: 50, zIndex: 1 },
    backText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subtitle: { color: 'white', fontSize: 14, opacity: 0.9, marginTop: 4 },
    
    content: { flex: 1, marginTop: 30, paddingHorizontal: 20 },
    
    chartPlaceholder: { alignSelf: 'center', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    donutHole: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#05B084' },

    card: { flex: 1, backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#1F2937' },
    
    statItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    statLeft: { flexDirection: 'row', alignItems: 'center' },
    colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    statCategory: { fontSize: 16, color: '#374151', fontWeight: '500' },
    statAmount: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' }
});