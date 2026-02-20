import React, { useState } from 'react';
import { Modal, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '../components/CustomText'
import { addWallet } from '../services/database';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddWalletModal({ visible, onClose, onSuccess }: Props) {
    const [name, setName] = useState('');
    const [balance, setBalance] = useState('');
    const [type, setType] = useState('BANK');

    const walletTypes = ['CASH', 'BANK', 'EWALLET'];

    const handleSave = () => {
        if (!name) {
            alert('Nama dompet wajib diisi');
            return;
        }

        // Konversi saldo (jika kosong anggap 0)
        const initialBalance = balance ? parseInt(balance.replace(/[^0-9]/g, ''), 10) : 0;
        const success = addWallet(name, type, initialBalance);

        if (success) {
            setName('');
            setBalance('');
            setType('BANK');
            onSuccess();
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                
                    <View style={styles.header}>
                        <Text style={styles.title}>Tambah Dompet Baru</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={{fontSize: 20, color: '#999'}}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Input Nama */}
                    <Text style={styles.label}>Nama Dompet (cth: BCA, OVO)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Nama Dompet"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* Input Saldo Awal */}
                    <Text style={styles.label}>Saldo Awal (Opsional)</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder="Rp 0"
                        keyboardType="numeric"
                        value={balance}
                        onChangeText={setBalance}
                    />

                    {/* Pilihan Tipe */}
                    <Text style={styles.label}>Jenis Dompet</Text>
                    <View style={styles.typeContainer}>
                        {walletTypes.map((t) => (
                        <TouchableOpacity 
                            key={t}
                            style={[styles.typeChip, type === t && styles.activeChip]} 
                            onPress={() => setType(t)}
                        >
                            <Text style={type === t ? {color:'white'} : {color:'#333'}}>
                                {t}
                            </Text>
                        </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                        <Text style={styles.saveBtnText}>Simpan</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    title: { fontSize: 18, fontWeight: 'bold' },
    label: { fontSize: 14, color: '#6B7280', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, fontSize: 16 },
    
    typeContainer: { flexDirection: 'row', marginBottom: 24 },
    typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    activeChip: { backgroundColor: '#10B981', borderColor: '#10B981' },

    saveBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});