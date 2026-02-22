import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { getFilteredTransactions } from '../services/database';
import Text from '../components/CustomText'; 
import DateTimePicker from '@react-native-community/datetimepicker';

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTrxDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH' | 'CUSTOM'>('THIS_MONTH');
    const [customStart, setCustomStart] = useState(new Date());
    const [customEnd, setCustomEnd] = useState(new Date());
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

    const fetchTransactions = useCallback(() => {
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

        const data = getFilteredTransactions(startDate, endDate);
        setTransactions(data);
    }, [filterPeriod, customStart, customEnd]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentPicker = showPicker;
        if (Platform.OS === 'android') setShowPicker(null);
        
        if (selectedDate) {
            if (currentPicker === 'start') setCustomStart(selectedDate);
            else if (currentPicker === 'end') setCustomEnd(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.content} 
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
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
                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>Tidak ada transaksi di periode ini.</Text>
                        </View>
                    ) : (
                        transactions.map((trx) => (
                            <View key={trx.id} style={styles.trxItem}>
                                <View style={[styles.trxIcon, { backgroundColor: trx.category_color || '#ccc' }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.trxCategory}>{trx.category_name || (trx.type === 'TRANSFER' ? 'Transfer' : 'Transaksi')}</Text>
                                    <Text style={styles.trxNote}>{trx.wallet_name}</Text>
                                    <Text style={styles.trxNote}>{trx.note ? `${trx.note}` : ''}</Text>
                                    <Text style={styles.trxDate}>{formatTrxDate(trx.date)}</Text>
                                </View>
                                <Text style={[styles.trxAmount, { color: trx.type === 'EXPENSE' ? '#EF4444' : (trx.type === 'INCOME' ? '#10B981' : '#3B82F6') }]}>
                                    {trx.type === 'EXPENSE' ? '-' : '+'} {formatRupiah(trx.amount)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#10B981' },
    content: { flex: 1 },
    
    filterContainer: { paddingHorizontal: 20, marginVertical: 16, gap: 8, maxHeight: 35, alignItems: 'center' },
    filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
    filterBtnActive: { backgroundColor: 'white' },
    filterText: { color: 'white', fontSize: 12 },

    customDateContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 20, alignItems: 'center' },
    dateBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, width: '45%' },
    dateLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginBottom: 4 },
    dateValue: { color: 'white', fontWeight: 'bold', fontSize: 12 },

    card: { flex: 1, minHeight: '100%', backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    
    emptyState: { paddingVertical: 40, alignItems: 'center' },
    emptyText: { color: '#9CA3AF', fontStyle: 'italic' },

    trxItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    trxIcon: { width: 44, height: 44, borderRadius: 22, marginRight: 16 },
    trxCategory: { fontWeight: 'bold', color: '#1F2937', fontSize: 16 },
    trxNote: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    trxDate: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
    trxAmount: { fontWeight: 'bold', fontSize: 16 }
});