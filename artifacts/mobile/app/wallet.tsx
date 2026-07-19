import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { C, F, RADIUS } from '@/constants/theme';
import type { Transaction } from '@/types';

const TOPUP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [topUpAmt, setTopUpAmt] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpSuccess, setTopUpSuccess] = useState('');
  const [topUpError, setTopUpError] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const loadData = useCallback(async () => {
    if (!user?.id) { setBalanceLoading(false); setTxLoading(false); return; }
    try {
      const w = await api.getWallet(user.id); setBalance(w.balance);
    } catch { setBalance(null); }
    finally { setBalanceLoading(false); }

    if (user?.id) {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setTransactions((data as Transaction[]) ?? []);
      setTxLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTopUp = async (amt: number) => {
    if (!user?.id) { setTopUpError('Not authenticated.'); return; }
    setTopUpLoading(true); setTopUpError(''); setTopUpSuccess('');
    try {
      await api.topUpWallet(amt);
      // Refetch balance and transactions immediately
      await loadData();
      setTopUpSuccess(`KES ${amt.toLocaleString()} added to your wallet!`);
      setTopUpAmt('');
      setTimeout(() => setTopUpSuccess(''), 4000);
    } catch (e: any) {
      setTopUpError(e.message ?? 'Top-up failed.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const isIn = (t: Transaction) => t.type === 'top_up' || t.transaction_type === 'topup';

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.fg} />
        </Pressable>
        <Text style={styles.title}>Wallet</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <View style={styles.glow1} />
          <View style={styles.glow2} />
          <Text style={styles.balLabel}>Available Balance</Text>
          {balanceLoading
            ? <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" style={{ marginVertical: 12 }} />
            : <Text style={styles.balAmt}>KES {balance != null ? balance.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '—'}</Text>
          }
          <Text style={styles.balSub}>{user?.name} • {user?.phone}</Text>
        </View>

        {/* Quick top-up amounts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Up Wallet</Text>
          <Text style={styles.sectionSub}>Select amount or enter custom</Text>

          <View style={styles.amtGrid}>
            {TOPUP_AMOUNTS.map(amt => (
              <Pressable
                key={amt}
                style={({ pressed }) => [styles.amtBtn, pressed && { opacity: 0.8 }]}
                onPress={() => setTopUpAmt(amt.toString())}
              >
                <Text style={styles.amtText}>KES {amt.toLocaleString()}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.customRow}>
            <Text style={styles.prefix}>KES</Text>
            <TextInput
              style={styles.customInput}
              placeholder="Custom amount"
              placeholderTextColor={C.mutedFg}
              keyboardType="numeric"
              value={topUpAmt}
              onChangeText={setTopUpAmt}
            />
          </View>

          {!!topUpSuccess && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={16} color={C.success} />
              <Text style={styles.successText}> {topUpSuccess}</Text>
            </View>
          )}
          {!!topUpError && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={14} color={C.destructive} />
              <Text style={styles.errorText}> {topUpError}</Text>
            </View>
          )}

          <Pressable
            style={[styles.topUpBtn, (!topUpAmt || topUpLoading) && styles.topUpDisabled]}
            onPress={() => handleTopUp(parseFloat(topUpAmt))}
            disabled={!topUpAmt || topUpLoading}
          >
            {topUpLoading
              ? <ActivityIndicator size="small" color={C.primaryFg} />
              : <><Ionicons name="add-circle" size={18} color={C.primaryFg} /><Text style={styles.topUpText}>  Top Up via M-Pesa</Text></>
            }
          </Pressable>
        </View>

        {/* Recent transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {txLoading ? (
            <ActivityIndicator color={C.primary} style={{ marginTop: 16 }} />
          ) : transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={28} color={C.mutedFg} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map(t => {
              const income = isIn(t);
              return (
                <View key={t.id} style={styles.txCard}>
                  <View style={[styles.txIcon, income ? styles.txIconIn : styles.txIconOut]}>
                    <Ionicons name={income ? 'arrow-down' : 'arrow-up'} size={16} color={income ? C.success : C.destructive} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txDesc} numberOfLines={1}>{t.description ?? t.transaction_type ?? 'Transaction'}</Text>
                    <Text style={styles.txDate}>{new Date(t.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                  <Text style={[styles.txAmt, income ? styles.amtIn : styles.amtOut]}>
                    {income ? '+' : '-'}KES {Math.abs(t.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  backBtn:    { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  title:      { color: C.fg, fontSize: 18, fontFamily: F.bold },
  scroll:     { padding: 20, gap: 24 },
  balanceCard:{ backgroundColor: C.primary, borderRadius: RADIUS['2xl'], padding: 24, overflow: 'hidden', position: 'relative' },
  glow1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.08)' },
  glow2: { position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0,0,0,0.12)' },
  balLabel:   { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: F.medium, marginBottom: 8 },
  balAmt:     { color: '#FFFFFF', fontSize: 36, fontFamily: F.extraBold, letterSpacing: -0.5, marginBottom: 8 },
  balSub:     { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: F.regular },
  section:    { gap: 12 },
  sectionTitle: { color: C.fg, fontSize: 16, fontFamily: F.bold },
  sectionSub: { color: C.mutedFg, fontSize: 12, fontFamily: F.regular, marginTop: -4 },
  amtGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amtBtn:     { backgroundColor: C.card, borderRadius: RADIUS.lg, paddingVertical: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: C.border },
  amtText:    { color: C.fg, fontSize: 13, fontFamily: F.semiBold },
  customRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
  prefix:     { color: C.mutedFg, fontSize: 12, fontFamily: F.bold, paddingRight: 10, borderRightWidth: 1, borderRightColor: C.border, paddingVertical: 13 },
  customInput:{ flex: 1, paddingVertical: 13, paddingHorizontal: 12, color: C.fg, fontSize: 14, fontFamily: F.regular },
  successBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.successBg, padding: 12, borderRadius: RADIUS.lg },
  successText:{ color: C.success, fontSize: 12, fontFamily: F.medium },
  errorBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.destructiveBg, padding: 12, borderRadius: RADIUS.lg },
  errorText:  { color: C.destructive, fontSize: 12, fontFamily: F.medium },
  topUpBtn:   { backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  topUpDisabled: { opacity: 0.4 },
  topUpText:  { color: C.primaryFg, fontSize: 15, fontFamily: F.bold },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText:  { color: C.mutedFg, fontSize: 13, fontFamily: F.regular },
  txCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  txIcon:     { width: 36, height: 36, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  txIconIn:   { backgroundColor: C.successBg },
  txIconOut:  { backgroundColor: C.destructiveBg },
  txDesc:     { color: C.fg, fontSize: 13, fontFamily: F.semiBold },
  txDate:     { color: C.mutedFg, fontSize: 10, fontFamily: F.regular, marginTop: 2 },
  txAmt:      { fontSize: 13, fontFamily: F.bold },
  amtIn:      { color: C.success },
  amtOut:     { color: C.destructive },
});
