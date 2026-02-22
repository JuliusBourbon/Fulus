import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from '../components/CustomText'
import { addSavingsToGoal } from '../services/database';
import { Goal, Wallet } from '../constants/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    goal: Goal | null; 
    wallets: Wallet[]; 
}

export default function AddSavingsModal({ visible, onClose, onSuccess, goal, wallets }: Props) {
    const [amount, setAmount] = useState('');
    const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            setAmount('');
            if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
        }
    }, [visible]);

    const handleSave = () => {
        if (!amount || !selectedWalletId || !goal) {
            alert('Mohon isi nominal dan pilih dompet!');
            return;
        }

        const cleanAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);

        const walletData = wallets.find(w => w.id === selectedWalletId);
        if (walletData && cleanAmount > walletData.balance) {
            const sisaSaldo = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(walletData.balance);
            alert(`Saldo ${walletData.name} tidak mencukupi untuk menabung!\nSisa saldo: ${sisaSaldo}`);
            return;
        }
        
        const success = addSavingsToGoal(goal.id, selectedWalletId, cleanAmount, goal.name);
        
        if (success) {
            onSuccess(); 
            onClose(); 
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Nabung untuk {goal?.name}</Text>
                    
                    <Text style={styles.label}>Nominal Ditabung</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Rp 0" 
                        keyboardType="numeric" 
                        value={amount} 
                        onChangeText={setAmount} 
                    />
                    
                    <Text style={styles.label}>Ambil dari Dompet:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 16, maxHeight: 50}}>
                        {wallets.map(w => (
                        <TouchableOpacity 
                            key={w.id} 
                            style={[styles.chip, selectedWalletId === w.id && styles.chipActive]}
                            onPress={() => setSelectedWalletId(w.id)}
                        >
                            <Text style={selectedWalletId === w.id ? {color:'white'} : {color:'#333'}}>{w.name}</Text>
                        </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={{fontWeight: 'bold', color: '#374151'}}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>Simpan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#1F2937' },
    label: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
    input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, fontSize: 16, marginBottom: 16, color: '#1F2937' },
    
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB', height: 40, justifyContent: 'center' },
    chipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },

    btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
    cancelBtn: { backgroundColor: '#E5E7EB', padding: 12, borderRadius: 12, paddingHorizontal: 20 },
    saveBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 12, paddingHorizontal: 20 }
});