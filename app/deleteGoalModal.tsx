import React, { useState, useEffect } from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Text from '../components/CustomText';
import { deleteGoal } from '../services/database';
import { Goal, Wallet } from '../constants/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    goal: Goal | null;
    wallets: Wallet[]; 
}

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function DeleteGoalModal({ visible, onClose, onSuccess, goal, wallets }: Props) {
    const [selectedWalletId, setSelectedWalletId] = useState<number | null>(null);

    useEffect(() => {
        if (visible && wallets.length > 0) {
            setSelectedWalletId(wallets[0].id);
        }
    }, [visible]);

    const handleDelete = () => {
        if (!goal) return;

        if (goal.saved_amount > 0 && !selectedWalletId) {
            alert('Pilih dompet untuk menerima pengembalian dana!');
            return;
        }

        const result = deleteGoal(goal.id, goal.saved_amount > 0 ? selectedWalletId! : undefined);

        if (result) {
            onSuccess();
            onClose();
        } else {
            alert('Gagal menghapus Tujuan');
        }
    }

    if (!goal) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Hapus Tujuan?</Text>

                    {goal.saved_amount > 0 ? (
                        <>
                            <Text style={styles.label}>
                                Tujuan "{goal.name}" memiliki dana terkumpul <Text style={{fontWeight: 'bold', color: '#10B981'}}>{formatRupiah(goal.saved_amount)}</Text>.
                            </Text>
                            <Text style={styles.label}>Pilih dompet untuk mencairkan dana ini:</Text>

                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 24, maxHeight: 50}}>
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
                        </>
                    ) : (
                        <Text style={styles.label}>Tujuan "{goal.name}" akan dihapus. Tidak ada dana yang perlu dicairkan.</Text>
                    )}

                    <View style={styles.btnContainer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={{fontWeight: 'bold', color: '#374151'}}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>Hapus</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' },
    label: { fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 22 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB', height: 40, justifyContent: 'center' },
    chipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
    btnContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelBtn: { backgroundColor: '#E5E7EB', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
    deleteBtn: { backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
});