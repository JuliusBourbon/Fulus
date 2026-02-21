import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import Text from '../components/CustomText'
import { useFocusEffect, useRouter } from 'expo-router';
import { getWallets, getTotalBalance, getRecentTransactions, getTopGoals, getOnboardingStatus, getUserProfile } from '../services/database';
import { Wallet, Transaction, Goal } from '../constants/types';
import AddTransactionModal from './addTransactionModal';
import AddWalletModal from './addWalletModal';
import DeleteWalletModal from './deleteWalletModal';
import DeleteGoalModal from './deleteGoalModal';
import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';
import { SvgXml } from 'react-native-svg';

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
}

export default function Index() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState('👋');
  const [selectedWalletId, setSelectedWalletId] = useState<number>(0);
  const [isDeleteWalletModalVisible, setDeleteWalletModalVisible] = useState(false);
  const [isWalletModalVisible, setWalletModalVisible] = useState(false);
  const [isTrxModalVisible, setTrxModalVisible] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTrx, setRecentTrx] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDeleteGoalModalVisible, setDeleteGoalModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const gearIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#374151" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path></svg>`;

  useFocusEffect(
    useCallback(() => {
      const hasOnboarded = getOnboardingStatus();
      if (!hasOnboarded) {
        router.replace('/onboarding');
        return;
      }

      loadData();
    }, [])
  );

  const loadData = () => {
    const profile = getUserProfile();
    if (profile) {
      setUserName(profile.name);
      setUserAvatar(profile.avatar);
    }
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
          <View style={{ flex: 1 }}>
            <View style={styles.userContainer}>
              <View style={{ width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: '#ECFDF5' }}>
                <SvgXml 
                  xml={createAvatar(thumbs, { seed: userAvatar || 'Avery', radius: 50 }).toString()} 
                  width={48} 
                  height={48} 
                />
              </View>
              <View>
                <Text style={styles.greeting}>Halo, {userName}</Text>
              </View>
            </View>
            <Text style={styles.labelTotal}>Total Kekayaan</Text>
            <Text style={styles.totalAmount}>{formatRupiah(totalBalance)}</Text>
          </View>
          
          {/* Tombol Settings (Ikon Gear) */}
          <TouchableOpacity 
            onPress={() => router.push('/Settings')} 
            style={styles.settingsBtn}
          >
            <SvgXml xml={gearIconSvg} width={24} height={24} />
          </TouchableOpacity>
        </View>

        {/* Wallet */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dompet</Text>
            <TouchableOpacity onPress={() => setWalletModalVisible(true)}>
              <Text style={{color: '#05B084', fontWeight: 'bold'}}>+ Tambah</Text>
            </TouchableOpacity>
          </View>

          {wallets.length === 0 ? (
            <TouchableOpacity onPress={() => setWalletModalVisible(true)} style={styles.emptyGoalBtn}>
              <Text>Belum ada Wallet</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.walletListContainer}
            >
              {wallets.map((wallet) => (
                <TouchableOpacity 
                  key={wallet.id} 
                  style={styles.walletCard}
                  onPress={() => router.push({
                    pathname: '/Statistic',
                    params: { walletId: wallet.id, walletName: wallet.name }
                  })}
                  activeOpacity={0.6}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.walletName}>{wallet.name}</Text>
                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      onPress={() => {
                        setSelectedWalletId(wallet.id); 
                        setDeleteWalletModalVisible(true);
                      }}
                      activeOpacity={0.6}  
                    >
                      <Text style={{color: 'white', fontWeight: 'bold'}}>- Hapus</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.walletType}>{wallet.type}</Text>
                  <Text style={styles.walletBalance}>{formatRupiah(wallet.balance)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Current Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            <TouchableOpacity onPress={() => setTrxModalVisible(true)}>
              <Text style={{ color: '#05B084', fontWeight: 'bold' }}>+ Tambah</Text>
            </TouchableOpacity>
          </View>

          {recentTrx.length === 0 ? (
            <TouchableOpacity onPress={() => router.push('/Transaction')} style={styles.emptyGoalBtn}>
              <Text>Belum ada transaksi</Text>
            </TouchableOpacity>
          ) : (
            recentTrx.map((trx) => (
              <TouchableOpacity onPress={() => router.push('/Transaction')} key={trx.id} style={styles.trxItem}>
                <View style={[styles.trxIcon, {backgroundColor: trx.category_color || '#ccc'}]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.trxCategory}>{trx.category_name || 'Transfer'}</Text>
                  <Text style={styles.trxNote}>{trx.note || trx.wallet_name}</Text>
                </View>
                <Text style={[styles.trxAmount, {color: trx.type === 'EXPENSE' ? '#EF4444' : '#10B981'}]}>
                  {trx.type === 'EXPENSE' ? '-' : '+'} {formatRupiah(trx.amount)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tujuan Finansial</Text>
            <TouchableOpacity onPress={() => router.push('/Goals')}>
              <Text style={{color: '#10B981', fontWeight: 'bold'}}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {goals.length === 0 ? (
            <TouchableOpacity 
              style={styles.emptyGoalBtn}
              onPress={() => router.push('/Goals')}
              activeOpacity={0.6}
            >
              <Text>Belum ada tujuan</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.goalListContainer}>
              {goals.map((goal) => {
                const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                
                return (
                  <TouchableOpacity 
                    key={goal.id} 
                    style={styles.goalCardHome}
                    onPress={() => router.push('/Goals')}
                    activeOpacity={0.6}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.goalNameHome}>{goal.name}</Text>
                      <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={() => {
                          setSelectedGoal(goal); 
                          setDeleteGoalModalVisible(true);
                        }}
                        activeOpacity={0.6}  
                      >
                        <Text style={{color: 'white', fontWeight: 'bold'}}>- Hapus</Text>
                      </TouchableOpacity>
                    </View>
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
        visible={isDeleteWalletModalVisible}
        walletId={selectedWalletId}
        onClose={() => setDeleteWalletModalVisible(false)}
        onSuccess={() => {
            loadData();
            setDeleteWalletModalVisible(false);
        }}
      />
      <DeleteGoalModal 
        visible={isDeleteGoalModalVisible}
        goal={selectedGoal}
        wallets={wallets}
        onClose={() => setDeleteGoalModalVisible(false)}
        onSuccess={() => {
          setDeleteGoalModalVisible(false);
          loadData(); 
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  // Header
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { 
    padding: 24, 
    paddingTop: 60, 
    backgroundColor: '#05B084', 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24,
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },

  userContainer: {flexDirection: 'row', gap: 10, alignItems: 'center', marginBottom: 15},
  avatarContainer: { backgroundColor: '#05B084', alignItems: 'center', justifyContent: 'center', borderRadius: 30, paddingHorizontal: 15 },
  
  settingsBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  greeting: { fontSize: 16, color: 'white', fontWeight: 'bold'},
  labelTotal: { fontSize: 14, color: 'white', marginTop: 8 },
  totalAmount: { fontSize: 32, fontWeight: 'bold', color: 'white', marginTop: 4 },

  // Section
  section: { marginTop: 24, paddingHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#161D1C' },

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
    width: 300, 
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

  deleteButton: {borderRadius: 15, alignItems: 'center', justifyContent: 'center'},
  emptyState: { textAlign: 'center', color: '#9CA3AF', marginTop: 20, fontStyle: 'italic' },

  // Goals Styles
  emptyGoalBtn: { backgroundColor: 'white', padding: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  goalListContainer: { paddingBottom: 10, alignItems: 'center', flexGrow: 1, justifyContent: 'center'  },
  goalCardHome: { 
    backgroundColor: '#05B084',
    padding: 16, 
    borderRadius: 16, 
    width: 300,
    marginRight: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
  },
  goalNameHome: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  goalAmountHome: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  
  progressBarContainerHome: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressBarFillHome: { height: '100%', backgroundColor: 'white' },
  progressTextHome: { color: 'white', fontSize: 10, textAlign: 'right', fontWeight: 'bold' }
});