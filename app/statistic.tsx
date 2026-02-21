import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getExpenseStats } from '../services/database';
import Text from '../components/CustomText'; 
import { PieChart } from 'react-native-gifted-charts'; 
import DateTimePicker from '@react-native-community/datetimepicker';

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const formatShort = (number: number) => {
    if (number >= 1000000) return (number / 1000000).toFixed(1) + ' Jt';
    if (number >= 1000) return (number / 1000).toFixed(0) + ' Rb';
    return number.toString();
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function StatisticScreen() {
    const { walletId, walletName } = useLocalSearchParams(); 
    
    const [stats, setStats] = useState<any[]>([]);
    
    const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('THIS_MONTH');

    const [customStart, setCustomStart] = useState(new Date());
    const [customEnd, setCustomEnd] = useState(new Date());
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

    const fetchStats = useCallback(() => {
        let startDate, endDate;
        const now = new Date();

        if (filterPeriod === 'THIS_MONTH') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        } else if (filterPeriod === 'LAST_MONTH') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
            endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();
        } else if (filterPeriod === 'CUSTOM') {
            const start = new Date(customStart);
            start.setHours(0, 0, 0, 0);
            startDate = start.toISOString();

            const end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
            endDate = end.toISOString();
        }

        const data = getExpenseStats(walletId ? Number(walletId) : undefined, startDate, endDate);
        setStats(data);
    }, [walletId, filterPeriod, customStart, customEnd]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentPicker = showPicker;
        if (Platform.OS === 'android') {
            setShowPicker(null);
        }
        
        if (selectedDate) {
        if (currentPicker === 'start') {
            setCustomStart(selectedDate);
        } else if (currentPicker === 'end') {
            setCustomEnd(selectedDate);
        }
        }
    };

    const pieData = stats.map((item) => ({
        value: item.total_amount,
        color: item.color || '#D1D5DB', 
    }));

    const totalExpense = stats.reduce((sum, item) => sum + item.total_amount, 0);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                    <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>{walletName}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                {['ALL', 'THIS_MONTH', 'LAST_MONTH', 'CUSTOM'].map((tab) => {
                    const labels: any = { ALL: 'Semua', THIS_MONTH: 'Bulan Ini', LAST_MONTH: 'Bulan Lalu', CUSTOM: 'Kustom' };
                    const isActive = filterPeriod === tab;
                    return (
                    <TouchableOpacity 
                        key={tab}
                        style={[styles.filterBtn, isActive && styles.filterBtnActive]}
                        onPress={() => setFilterPeriod(tab as any)}
                    >
                        <Text style={[styles.filterText, isActive && {color: '#10B981', fontWeight: 'bold'}]}>{labels[tab]}</Text>
                    </TouchableOpacity>
                    )
                })}
                </ScrollView>

                {filterPeriod === 'CUSTOM' && (
                    <View style={styles.customDateContainer}>
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker('start')}>
                            <Text style={styles.dateLabel}>Dari Tanggal</Text>
                            <Text style={styles.dateValue}>{formatDate(customStart)}</Text>
                        </TouchableOpacity>
                        
                        <Text style={{color: 'white', marginTop: 10}}>—</Text>
                        
                        <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker('end')}>
                            <Text style={styles.dateLabel}>Sampai Tanggal</Text>
                            <Text style={styles.dateValue}>{formatDate(customEnd)}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showPicker && (
                    <DateTimePicker
                        value={showPicker === 'start' ? customStart : customEnd}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}

                <View style={styles.card}>
                    <View style={styles.chartContainer}>
                        {stats.length > 0 ? (
                        <PieChart
                            donut
                            data={pieData}
                            radius={80} 
                            innerRadius={60} 
                            innerCircleColor={'white'} 
                            centerLabelComponent={() => (
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{fontSize: 12, color: '#6B7280'}}>Total</Text>
                                <Text style={{fontSize: 16, fontWeight: 'bold', color: '#EF4444'}}>
                                    {formatShort(totalExpense)}
                                </Text>
                            </View>
                            )}
                        />
                        ) : (
                        <View style={styles.emptyChart}>
                            <Text style={{color: '#9CA3AF'}}>Data Kosong</Text>
                        </View>
                        )}
                    </View>

                    <Text style={styles.cardTitle}>Detail Pengeluaran</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {stats.length === 0 ? (
                            <Text style={{textAlign: 'center', color: '#9CA3AF', marginTop: 10}}>Belum ada pengeluaran di periode ini</Text>
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
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#10B981' },
    content: { flex: 1, marginTop: 20 },
    
    filterContainer: { paddingHorizontal: 20, marginBottom: 16, gap: 8, maxHeight: 35, alignItems: 'center' },
    filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
    filterBtnActive: { backgroundColor: 'white' },
    filterText: { color: 'white', fontSize: 12 },

    customDateContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20, alignItems: 'center' },
    dateBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, width: '45%' },
    dateLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginBottom: 4 },
    dateValue: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    card: { flex: 1, height: 650, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    
    chartContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 30, marginTop: 10 },
    emptyChart: { width: 160, height: 160, borderRadius: 80, borderWidth: 20, borderColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },

    cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#1F2937' },
    
    statItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    statLeft: { flexDirection: 'row', alignItems: 'center' },
    colorDot: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
    statCategory: { fontSize: 16, color: '#374151', fontWeight: '500' },
    statAmount: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' }
});