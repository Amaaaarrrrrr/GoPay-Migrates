import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { C, F, RADIUS } from '@/constants/theme';
import type { Vehicle } from '@/types';

export default function BookingVehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { id, from, to, fare } = useLocalSearchParams<{ id: string; from: string; to: string; fare: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    api.getVehicles(id).then(setVehicles).catch(() => setVehicles([])).finally(() => setLoading(false));
  }, [id]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.fg} />
        </Pressable>
        <View>
          <Text style={styles.title}>Select Vehicle</Text>
          <Text style={styles.subtitle}>Available Fleet{from && to ? ` • ${from} → ${to}` : ''}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.loadingText}>RESOLVING ACTIVE PSV QUEUE...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={v => v.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="bus-outline" size={32} color={C.mutedFg} />
              </View>
              <Text style={styles.emptyTitle}>No vehicles at terminal</Text>
              <Text style={styles.emptyText}>Check back shortly — vehicles update in real-time</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.vehicleCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push({
                pathname: '/seat-selection',
                params: { vehicleId: item.id, routeId: id, from, to, fare, registration: item.registration },
              } as any)}
            >
              <View style={styles.busIcon}>
                <Ionicons name="bus" size={22} color={C.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.vehicleReg}>{item.registration}</Text>
                <Text style={styles.vehicleSacco}>{item.sacco ?? 'Independent'}</Text>
              </View>
              <View style={styles.vehicleRight}>
                <View style={styles.capacityBadge}>
                  <Ionicons name="people-outline" size={12} color={C.primary} />
                  <Text style={styles.capacityText}>{item.capacity} seats</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'boarding' ? styles.statusBoarding : styles.statusIdle]}>
                  <Text style={[styles.statusText, item.status === 'boarding' ? styles.statusBoardingText : styles.statusIdleText]}>
                    {(item.status ?? 'idle').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.mutedFg} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  backBtn:   { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  title:     { color: C.fg, fontSize: 17, fontFamily: F.bold },
  subtitle:  { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 1 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText:{ color: C.mutedFg, fontSize: 9, fontFamily: F.bold, letterSpacing: 2 },
  list:      { padding: 16, gap: 10 },
  empty:     { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: RADIUS.full, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  emptyTitle:{ color: C.fg, fontSize: 16, fontFamily: F.bold },
  emptyText: { color: C.mutedFg, fontSize: 12, fontFamily: F.regular, textAlign: 'center' },
  vehicleCard:{ backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 12 },
  busIcon:   { width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' },
  vehicleReg:{ color: C.fg, fontSize: 13, fontFamily: F.bold },
  vehicleSacco:{ color: C.mutedFg, fontSize: 10, fontFamily: F.regular, marginTop: 2 },
  vehicleRight:{ alignItems: 'flex-end', gap: 6, marginRight: 4 },
  capacityBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacityText: { color: C.primary, fontSize: 11, fontFamily: F.semiBold },
  statusBadge:{ borderRadius: RADIUS.sm, paddingHorizontal: 8, paddingVertical: 3 },
  statusBoarding:{ backgroundColor: C.successBg },
  statusIdle:{ backgroundColor: C.secondary },
  statusText:{ fontSize: 8, fontFamily: F.bold, letterSpacing: 0.5 },
  statusBoardingText:{ color: C.success },
  statusIdleText:{ color: C.mutedFg },
});
