import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { C, F, RADIUS } from '@/constants/theme';
import type { Transaction } from '@/types';

export default function TripsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [trips, setTrips] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(60);
      setTrips((data as Transaction[]) ?? []);
      setLoading(false);
    })();
  }, [user?.id]);

  const isIn = (t: Transaction) =>
    t.type === 'top_up' || t.transaction_type === 'topup' || t.transaction_type === 'receive';

  const renderItem = ({ item }: { item: Transaction }) => {
    const income = isIn(item);
    return (
      <View style={styles.card}>
        <View style={[styles.iconWrap, income ? styles.iconIn : styles.iconOut]}>
          <Ionicons name={income ? 'arrow-down' : 'arrow-up'} size={18} color={income ? C.success : C.destructive} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.desc} numberOfLines={1}>{item.description ?? item.transaction_type ?? 'Transaction'}</Text>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        <Text style={[styles.amount, income ? styles.amtIn : styles.amtOut]}>
          {income ? '+' : '-'}KES {Math.abs(item.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip History</Text>
        <Text style={styles.subtitle}>Tap any trip to view receipt</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={40} color={C.mutedFg} />
          </View>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptyDesc}>Your trip history will appear here once you pay a fare with GoPay.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={t => t.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header:    { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title:     { color: C.fg, fontSize: 24, fontFamily: F.bold },
  subtitle:  { color: C.mutedFg, fontSize: 12, fontFamily: F.regular, marginTop: 4 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: RADIUS.full, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle:{ color: C.fg, fontSize: 18, fontFamily: F.bold },
  emptyDesc: { color: C.mutedFg, fontSize: 13, fontFamily: F.regular, textAlign: 'center', marginTop: 4 },
  list:      { padding: 20, gap: 8 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  iconWrap:  { width: 40, height: 40, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  iconIn:    { backgroundColor: C.successBg },
  iconOut:   { backgroundColor: C.destructiveBg },
  desc:      { color: C.fg, fontSize: 13, fontFamily: F.semiBold },
  date:      { color: C.mutedFg, fontSize: 10, fontFamily: F.regular, marginTop: 2 },
  amount:    { fontSize: 13, fontFamily: F.bold },
  amtIn:     { color: C.success },
  amtOut:    { color: C.destructive },
});
