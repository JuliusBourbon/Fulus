import React, { useCallback, useState } from 'react';
import { 
  Text, View, StyleSheet, ScrollView, RefreshControl, Dimensions, 
  TouchableOpacity
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getWallets, getTotalBalance, getRecentTransactions, getTopGoals } from '../services/database';
import { Wallet, Transaction, Goal } from '../constants/types';
import AddTransactionModal from './addTransactionModal';
import AddWalletModal from './addWalletModal';
import DeleteWalletModal from './deleteWalletModal';

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

export default function Index() {
  const router = useRouter();
  const [selectedWalletId, setSelectedWalletId] = useState<number>(0);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isWalletModalVisible, setWalletModalVisible] = useState(false);
  const [isTrxModalVisible, setTrxModalVisible] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTrx, setRecentTrx] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    const saldo = getTotalBalance();
    const dompet = getWallets();
    const transaksi = getRecentTransactions();
    const tujuan = getTopGoals();

    setTotalBalance(saldo);
    setWallets(dompet);
    setRecentTrx(transaksi);
    setGoals(tujuan)
  };


  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Fungsi Refresh data (Tarik Kebawah)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000)
  }, [])

  return (
    <View style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Halo, Julius</Text>
          <Text style={styles.labelTotal}>Total Saldo Kamu</Text>
          <Text style={styles.totalAmount}>{formatRupiah(totalBalance)}</Text>
        </View>

        {/* Wallet */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dompet Saya</Text>
              <TouchableOpacity onPress={() => setWalletModalVisible(true)}>
                <Text style={{color: '#05B084', fontWeight: 'bold'}}>+ Tambah</Text>
              </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletListContainer}>
            {wallets.map((wallet) => (
              <TouchableOpacity 
                key={wallet.id} 
                style={styles.walletCard}
                onPress={() => router.push({
                  pathname: '/statistic',
                  params: { walletId: wallet.id, walletName: wallet.name }
                })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.walletName}>{wallet.name}</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => {
                      setSelectedWalletId(wallet.id); 
                      setDeleteModalVisible(true);
                    }}
                    activeOpacity={0.8}  
                  >
                    <Text style={{color: 'white', fontWeight: 'bold'}}>- Hapus</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.walletType}>{wallet.type}</Text>
                <Text style={styles.walletBalance}>{formatRupiah(wallet.balance)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Current Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            <TouchableOpacity onPress={() => setTrxModalVisible(true)} style={styles.addButton}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>+</Text>
            </TouchableOpacity>
          </View>

          {recentTrx.length === 0 ? (
            <Text style={styles.emptyState}>Belum ada transaksi</Text>
          ) : (
            recentTrx.map((trx) => (
              <View key={trx.id} style={styles.trxItem}>
                <View style={[styles.trxIcon, {backgroundColor: trx.category_color || '#ccc'}]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.trxCategory}>{trx.category_name || 'Transfer'}</Text>
                  <Text style={styles.trxNote}>{trx.note || trx.wallet_name}</Text>
                </View>
                <Text style={[styles.trxAmount, {color: trx.type === 'EXPENSE' ? '#EF4444' : '#10B981'}]}>
                  {trx.type === 'EXPENSE' ? '-' : '+'} {formatRupiah(trx.amount)}
                </Text>
              </View>
            ))
          )}
        </View>
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tujuan Finansial</Text>
            <TouchableOpacity onPress={() => router.push('/goals')}>
              <Text style={{color: '#10B981', fontWeight: 'bold'}}>Lihat Semua →</Text>
            </TouchableOpacity>
          </View>
          
          {goals.length === 0 ? (
            <TouchableOpacity 
              style={styles.emptyGoalBtn}
              onPress={() => router.push('/goals')}
              activeOpacity={0.7}
            >
              <Text style={{color: '#6B7280'}}>Belum ada tujuan. Tambah sekarang!</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.goalListContainer}>
              {goals.map((goal) => {
                const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                
                return (
                  <TouchableOpacity 
                    key={goal.id} 
                    style={styles.goalCardHome}
                    onPress={() => router.push('/goals')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.goalNameHome}>{goal.name}</Text>
                    <Text style={styles.goalAmountHome}>{formatRupiah(goal.target_amount)}</Text>
                    
                    <View style={styles.progressBarContainerHome}>
                      <View style={[styles.progressBarFillHome, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressTextHome}>{progress.toFixed(0)}% Terkumpul</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>
      <AddTransactionModal 
        visible={isTrxModalVisible} 
        onClose={() => setTrxModalVisible(false)}
        onSuccess={() => {
          loadData();
          setTrxModalVisible(false);
        }}
      />

      <AddWalletModal
        visible={isWalletModalVisible}
        onClose={() => setWalletModalVisible(false)}
        onSuccess={() => {
          loadData();
          setWalletModalVisible(false);
        }}
      />
      <DeleteWalletModal
        visible={isDeleteModalVisible}
        walletId={selectedWalletId}
        onClose={() => setDeleteModalVisible(false)}
        onSuccess={() => {
            loadData();
            setDeleteModalVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 24, paddingTop: 60, backgroundColor: 'white', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  greeting: { fontSize: 16, color: '#161D1C', fontWeight: 'bold'},
  labelTotal: { fontSize: 14, color: '#161D1C', marginTop: 8 },
  totalAmount: { fontSize: 32, fontWeight: 'bold', color: '#05B084', marginTop: 4 },

  // Section
  section: { marginTop: 24, paddingHorizontal: 24, },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#161D1C', marginBottom: 12 },

  // Wallet Card Styles
  walletListContainer: {
    alignItems: 'center', 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  walletCard: { 
    backgroundColor: '#05B084', 
    padding: 16, 
    borderRadius: 16, 
    width: 290, 
    marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  walletName: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  walletType: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  walletBalance: { color: 'white', fontWeight: 'bold', fontSize: 16, marginTop: 12 },

  // Transaction Item Styles
  trxItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 8 },
  trxIcon: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  trxCategory: { fontWeight: 'bold', color: '#374151' },
  trxNote: { fontSize: 12, color: '#9CA3AF' },
  trxAmount: { fontWeight: 'bold' },

  addButton: { width: 30, height: 30, backgroundColor: '#05B084', borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  deleteButton: {borderRadius: 15, alignItems: 'center', justifyContent: 'center'},
  emptyState: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, fontStyle: 'italic' },

  // Goals Styles
  emptyGoalBtn: { backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  goalListContainer: { paddingHorizontal: 24, paddingBottom: 10 },
  goalCardHome: { 
    backgroundColor: '#05B084',
    padding: 16, 
    borderRadius: 16, 
    width: 240,
    marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  goalNameHome: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  goalAmountHome: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  
  progressBarContainerHome: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressBarFillHome: { height: '100%', backgroundColor: '#34D399' },
  progressTextHome: { color: 'white', fontSize: 10, textAlign: 'right', fontWeight: 'bold' }
});