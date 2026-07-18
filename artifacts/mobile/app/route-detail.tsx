import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { C, F, RADIUS } from '@/constants/theme';
import type { Route } from '@/types';

export default function RouteDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id, from, to, fare, sacco } = useLocalSearchParams<{ id: string; from: string; to: string; fare: string; sacco: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    if (id) {
      api.getRouteById(id).then(r => setRoute(r)).finally(() => setLoading(false));
    } else {
      setRoute({ id: id ?? '0', from: from ?? '', to: to ?? '', fare: parseFloat(fare ?? '0'), sacco: sacco ?? '', duration: '~30 min', distance: '~10 km' });
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return <View style={[styles.container, { paddingTop: topPad }]}><ActivityIndicator color={C.primary} size="large" style={{ marginTop: 40 }} /></View>;
  }

  const r = route;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.fg} />
        </Pressable>
        <View>
          <Text style={styles.title}>Route Details</Text>
          <Text style={styles.subtitle}>{r?.from} → {r?.to}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        {/* Route summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.glow1} />
          <View style={styles.cardContent}>
            <View style={styles.routeRow}>
              <View style={styles.stop}>
                <View style={styles.stopDot} />
                <Text style={styles.stopName}>{r?.from}</Text>
              </View>
              <View style={styles.routeLine}>
                <View style={styles.line} />
                <Ionicons name="bus" size={20} color={C.primaryFg} />
                <View style={styles.line} />
              </View>
              <View style={[styles.stop, { alignItems: 'flex-end' }]}>
                <View style={[styles.stopDot, { backgroundColor: C.success }]} />
                <Text style={styles.stopName}>{r?.to}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              {r?.duration && <View style={styles.metaItem}><Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.6)" /><Text style={styles.metaText}>{r.duration}</Text></View>}
              {r?.distance && <View style={styles.metaItem}><Ionicons name="navigate-outline" size={13} color="rgba(255,255,255,0.6)" /><Text style={styles.metaText}>{r.distance}</Text></View>}
              <View style={styles.metaItem}><Ionicons name="business-outline" size={13} color="rgba(255,255,255,0.6)" /><Text style={styles.metaText}>{r?.sacco}</Text></View>
            </View>
          </View>
        </View>

        {/* Fare info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Standard Fare</Text>
          <View style={styles.fareCard}>
            <View style={styles.fareItem}>
              <Text style={styles.fareLabel}>Adult</Text>
              <Text style={styles.fareAmt}>KES {r?.fare}</Text>
            </View>
            <View style={styles.fareDivider} />
            <View style={styles.fareItem}>
              <Text style={styles.fareLabel}>Student</Text>
              <Text style={styles.fareAmt}>KES {Math.round((r?.fare ?? 0) * 0.75)}</Text>
            </View>
            <View style={styles.fareDivider} />
            <View style={styles.fareItem}>
              <Text style={styles.fareLabel}>Child</Text>
              <Text style={styles.fareAmt}>KES {Math.round((r?.fare ?? 0) * 0.5)}</Text>
            </View>
          </View>
        </View>

        {/* Service info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Service Information</Text>
          {[
            { icon: 'business-outline' as const, label: 'Sacco', value: r?.sacco },
            { icon: 'time-outline' as const, label: 'Operating Hours', value: '5:00 AM – 10:00 PM' },
            { icon: 'refresh-outline' as const, label: 'Frequency', value: 'Every 15-20 minutes' },
            { icon: 'shield-checkmark-outline' as const, label: 'Payment', value: 'GoPay accepted' },
          ].map(item => (
            <View key={item.label} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name={item.icon} size={18} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoRowLabel}>{item.label}</Text>
                <Text style={styles.infoRowValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Book CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={styles.bookBtn}
          onPress={() => router.push({ pathname: '/booking-vehicles', params: { id: r?.id, from: r?.from, to: r?.to, fare: r?.fare.toString() } } as any)}
        >
          <Ionicons name="bus" size={18} color={C.primaryFg} />
          <Text style={styles.bookText}>  Select Vehicle</Text>
        </Pressable>
        <Pressable style={styles.payBtn} onPress={() => router.push('/pay-fare' as any)}>
          <Ionicons name="card-outline" size={18} color={C.primary} />
          <Text style={styles.payText}>  Pay Fare</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  backBtn:   { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  title:     { color: C.fg, fontSize: 17, fontFamily: F.bold },
  subtitle:  { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 1 },
  scroll:    { padding: 20, gap: 20 },
  summaryCard:{ backgroundColor: C.primary, borderRadius: RADIUS['2xl'], overflow: 'hidden', position: 'relative' },
  glow1: { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardContent:{ padding: 24, position: 'relative', zIndex: 1 },
  routeRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stop:      { flex: 1 },
  stopDot:   { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primaryFg, marginBottom: 4 },
  stopName:  { color: C.primaryFg, fontSize: 15, fontFamily: F.bold },
  routeLine: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8 },
  line:      { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  metaRow:   { flexDirection: 'row', gap: 16 },
  metaItem:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText:  { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: F.regular },
  infoSection:{ gap: 8 },
  infoLabel: { color: C.fg, fontSize: 14, fontFamily: F.bold },
  fareCard:  { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, flexDirection: 'row', borderWidth: 1, borderColor: C.border },
  fareItem:  { flex: 1, alignItems: 'center' },
  fareLabel: { color: C.mutedFg, fontSize: 10, fontFamily: F.medium, marginBottom: 4 },
  fareAmt:   { color: C.fg, fontSize: 15, fontFamily: F.bold },
  fareDivider:{ width: 1, backgroundColor: C.border },
  infoRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, borderWidth: 1, borderColor: C.border, gap: 12 },
  infoIcon:  { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' },
  infoRowLabel:{ color: C.mutedFg, fontSize: 10, fontFamily: F.medium },
  infoRowValue:{ color: C.fg, fontSize: 13, fontFamily: F.semiBold, marginTop: 2 },
  cta:       { paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: C.border },
  bookBtn:   { flex: 1, backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  bookText:  { color: C.primaryFg, fontSize: 14, fontFamily: F.bold },
  payBtn:    { flex: 1, backgroundColor: C.secondary, borderRadius: RADIUS.xl, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  payText:   { color: C.primary, fontSize: 14, fontFamily: F.bold },
});
