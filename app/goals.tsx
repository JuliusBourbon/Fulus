import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import Text from '../components/CustomText'
import {  useFocusEffect } from 'expo-router';
import { getGoals, addGoal, getWallets, addSavingsToGoal } from '../services/database';
import { Goal, Wallet } from '../constants/types';
import AddSavingsModal from './addSavingModal';

const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
};

export default function GoalsScreen() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [isNabungModalVisible, setNabungModalVisible] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

    const loadGoals = () => {
        setGoals(getGoals());
        setWallets(getWallets());
    };

    useFocusEffect(
        useCallback(() => { loadGoals(); }, [])
    );

    const handleSaveGoal = () => {
        if (!goalName || !targetAmount) {
            alert('Nama dan Target wajib diisi');
            return;
        }
        const cleanAmount = parseInt(targetAmount.replace(/[^0-9]/g, ''), 10);
        const success = addGoal(goalName, cleanAmount);
        
        if (success) {
            setGoalName('');
            setTargetAmount('');
            setModalVisible(false);
            loadGoals(); 
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tujuan Finansial</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Baru</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {goals.length === 0 ? (
                    <Text style={styles.emptyState}>Belum ada tujuan tabungan.</Text>
                    ) : (
                    goals.map((goal) => {
                        const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                        
                        return (
                        <View key={goal.id} style={styles.goalCard}>
                            <Text style={styles.goalName}>{goal.name}</Text>
                            <Text style={styles.goalAmount}>{formatRupiah(goal.target_amount)}</Text>
                            
                            <View style={styles.progressBarContainer}>
                                <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                            </View>
                            
                            <View style={styles.progressTextContainer}>
                                <Text style={styles.progressTextL}>{formatRupiah(goal.saved_amount)} terkumpul</Text>
                                <Text style={styles.progressTextR}>{progress.toFixed(0)}%</Text>
                            </View>
                            {progress < 100 && (
                                <TouchableOpacity 
                                    style={styles.nabungBtn}
                                    onPress={() => {
                                        setSelectedGoal(goal);
                                        setNabungModalVisible(true);
                                    }}
                                >
                                    <Text style={styles.nabungBtnText}>+ Isi Tabungan</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        );
                    })
                )}
            </ScrollView>

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Buat Tujuan Baru</Text>
                        
                        <Text style={styles.label}>Untuk Beli Apa?</Text>
                        <TextInput style={styles.input} placeholder="Contoh: Beli Laptop" value={goalName} onChangeText={setGoalName} />
                        
                            <Text style={styles.label}>Target Dana</Text>
                        <TextInput style={styles.input} placeholder="Rp 0" keyboardType="numeric" value={targetAmount} onChangeText={setTargetAmount} />
                        
                        <View style={styles.btnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={{fontWeight: 'bold'}}>Batal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoal}>
                                <Text style={{color: 'white', fontWeight: 'bold'}}>Simpan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <AddSavingsModal 
                visible={isNabungModalVisible}
                goal={selectedGoal}
                wallets={wallets}
                onClose={() => setNabungModalVisible(false)}
                onSuccess={() => {
                setNabungModalVisible(false);
                loadGoals();
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { padding: 8 },
    backText: { color: '#10B981', fontWeight: 'bold', fontSize: 16 },
    title: { color: '#10B981', fontSize: 20, fontWeight: 'bold' },
    addBtn: { backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    addBtnText: { color: 'white', fontWeight: 'bold' },
    
    content: { padding: 24 },
    emptyState: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
    
    // Card Goal
    goalCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    goalName: { fontSize: 16, color: '#6B7280', fontWeight: 'bold', marginBottom: 4 },
    goalAmount: { fontSize: 24, color: '#1F2937', fontWeight: 'bold', marginBottom: 16 },
    
    // Progress Bar
    progressBarContainer: { height: 12, backgroundColor: '#E5E7EB', borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
    progressBarFill: { height: '100%', backgroundColor: '#10B981' },
    progressTextContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    progressTextL: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
    progressTextR: { fontSize: 12, color: '#6B7280', fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    label: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
    input: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, fontSize: 16, marginBottom: 16 },
    btnRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 10 },
    cancelBtn: { backgroundColor: '#E5E7EB', padding: 12, borderRadius: 12, paddingHorizontal: 20 },
    saveBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 12, paddingHorizontal: 20 },

    // Save styles
    nabungBtn: { backgroundColor: '#ECFDF5', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#10B981' },
    nabungBtnText: { color: '#10B981', fontWeight: 'bold' },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB', height: 40, justifyContent: 'center' },
    chipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
});