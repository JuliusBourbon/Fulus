import React, { useCallback, useState } from 'react';
import { 
  Text, View, StyleSheet, ScrollView, RefreshControl, Dimensions, 
  TouchableOpacity
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { getWallets, getTotalBalance, getRecentTransactions } from '../services/database';
import { Wallet, Transaction } from '../constants/types';
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
  const [refreshing, setRefreshing] = useState(false);

  const loadData = () => {
    const saldo = getTotalBalance();
    const dompet = getWallets();
    const transaksi = getRecentTransactions();

    setTotalBalance(saldo);
    setWallets(dompet);
    setRecentTrx(transaksi);
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
  emptyState: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, fontStyle: 'italic' }
});