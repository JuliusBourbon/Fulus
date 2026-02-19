import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React, { useState } from "react";
import { deleteWallet } from "@/services/database";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    walletId: number;
}

export default function DeleteWalletModal({visible, onClose, onSuccess, walletId}: Props){

    const handleDelete = () => {
        const result = deleteWallet(walletId);
        
        if (result) {
            onSuccess();
            onClose(); 
        } else {
            alert("Gagal menghapus dompet");
        }
    }

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Hapus Dompet ini?</Text>
                    <Text style={styles.label}>Segala transaksi yang tercatat di dompet ini akan ikut terhapus permanen!</Text>
                    
                    <View style={styles.btnContainer}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={{fontWeight: 'bold', color: '#333'}}>Batal</Text>
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
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#1F2937' },
    label: { fontSize: 14, color: '#6B7280', marginBottom: 24, lineHeight: 20 },
    btnContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    cancelBtn: { backgroundColor: '#E5E7EB', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
    deleteBtn: { backgroundColor: '#EF4444', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
});