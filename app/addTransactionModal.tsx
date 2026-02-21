import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Text from '../components/CustomText'
import { getCategories, getWallets, addTransaction } from '../services/database';
import { Wallet } from '../constants/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddTransactionModal({ visible, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
    const [targetWallet, setTargetWallet] = useState<number | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    // Buat reset form
    useEffect(() => {
        if (visible) {
            setWallets(getWallets());
            setCategories(getCategories());
            setAmount('');
            setNote('');
            const w = getWallets();
            if (w.length > 0) setSelectedWallet(w[0].id);
        }
    }, [visible]);

    const handleSave = () => {
        if (type === 'TRANSFER' && (!amount || !selectedWallet || !targetWallet)) {
            alert('Mohon lengkapi nominal, dompet asal, dan dompet tujuan');
            return;
        }
        if (type !== 'TRANSFER' && (!amount || !selectedWallet || !selectedCategory)) {
            alert('Mohon lengkapi data');
            return;
        }
        if (type === 'TRANSFER' && selectedWallet === targetWallet) {
            alert('Dompet asal dan tujuan tidak boleh sama!');
            return;
        }

        if (!amount || !selectedWallet || !selectedCategory) {
            alert('Mohon lengkapi data');
            return;
        }

        const cleanAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
        const date = new Date().toISOString();

        const success = addTransaction(
            selectedWallet, 
            type === 'TRANSFER' ? null : selectedCategory,
            cleanAmount, 
            date, 
            type, 
            note,
            type === 'TRANSFER' ? targetWallet : null
        );

        if (success) {
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Tambah Transaksi</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{fontSize: 20, color: '#999'}}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>
                        {/* Income/Expense */}
                        <View style={styles.switchContainer}>
                            <TouchableOpacity 
                                style={[styles.switchBtn, type === 'EXPENSE' && styles.activeExpense]}
                                onPress={() => setType('EXPENSE')}
                            >
                                <Text style={[styles.switchText, type === 'EXPENSE' && {color:'white'}]}>Keluar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.switchBtn, type === 'INCOME' && styles.activeIncome]}
                                onPress={() => setType('INCOME')}
                            >
                                <Text style={[styles.switchText, type === 'INCOME' && {color:'white'}]}>Masuk</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.switchBtn, type === 'TRANSFER' && {backgroundColor: '#3B82F6'}]} // Warna biru untuk transfer
                                onPress={() => setType('TRANSFER')}
                            >
                                <Text style={[styles.switchText, type === 'TRANSFER' && {color:'white'}]}>Transfer</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Input Nominal */}
                        <Text style={styles.label}>Nominal</Text>
                        <TextInput 
                            style={styles.inputBig} 
                            keyboardType="numeric"
                            placeholder="Rp 0"
                            value={amount}
                            onChangeText={setAmount}
                        />

                        {/* Categories (Selain Transfer)*/}
                        {type !== 'TRANSFER' && (
                            <View>
                                <Text style={styles.label}>Kategori</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                                    {categories.filter(c => c.type === type).map(cat => (
                                    <TouchableOpacity 
                                        key={cat.id} 
                                        style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                                        onPress={() => setSelectedCategory(cat.id)}
                                    >
                                        <Text style={selectedCategory === cat.id ? {color:'white'} : {color:'#333'}}>{cat.name}</Text>
                                    </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Pilihan Sumber Wallet */}
                        <View>
                            <Text style={styles.label}>{type === 'TRANSFER' ? 'Dari Dompet:' : 'Dompet Sumber'}</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                                {wallets.map(w => (
                                <TouchableOpacity 
                                    key={w.id} 
                                    style={[styles.chip, selectedWallet === w.id && styles.chipActive]}
                                    onPress={() => setSelectedWallet(w.id)}
                                >
                                    <Text style={selectedWallet === w.id ? {color:'white'} : {color:'#333'}}>{w.name}</Text>
                                </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Tujuan Wallet (Ketika Transfer) */}
                        {type === 'TRANSFER' && (
                            <View>
                                <Text style={styles.label}>Ke Dompet:</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16}}>
                                    {wallets.map(w => (
                                    <TouchableOpacity 
                                        key={w.id} 
                                        style={[styles.chip, targetWallet === w.id && {backgroundColor: '#3B82F6', borderColor: '#3B82F6'}]}
                                        onPress={() => setTargetWallet(w.id)}
                                    >
                                        <Text style={targetWallet === w.id ? {color:'white'} : {color:'#333'}}>{w.name}</Text>
                                    </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}

                        {/* Catatan */}
                        <TextInput 
                            style={styles.inputNote} 
                            placeholder="Catatan (Opsional)"
                            value={note}
                            onChangeText={setNote}
                        />

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Simpan</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, height: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  
  switchContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 20 },
  switchBtn: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  activeExpense: { backgroundColor: '#EF4444' },
  activeIncome: { backgroundColor: '#10B981' },
  switchText: { fontWeight: 'bold', color: '#6B7280' },

  label: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  inputBig: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', marginBottom: 20, borderBottomWidth: 1, borderColor: '#E5E7EB', paddingBottom: 8 },
  inputNote: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 20 },
  
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },

  saveBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});