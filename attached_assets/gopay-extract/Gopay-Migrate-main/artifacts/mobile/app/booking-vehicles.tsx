import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Vehicle } from '@/types';

export default function BookingVehiclesScreen() {
  const insets = useSafeAreaInsets();
  const { id, from, to, fare } = useLocalSearchParams<{ id: string; from: string; to: string; fare: string }>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVehicles().then(setVehicles).catch(() => setVehicles([])).finally(() => setLoading(false));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#1E293B" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Select Vehicle</Text>
          <Text style={styles.headerSub}>Available Fleet</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#2563EB" />
          <Text style={styles.loadingText}>RESOLVING ACTIVE PSV QUEUE...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.introText}>
              Select a matatu to proceed with seat booking.
              {from && to ? ` Route: ${from} → ${to}.` : ''}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bus-outline" size={32} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No vehicles at terminal</Text>
              <Text style={styles.emptyText}>Check back shortly — vehicles update in real-time</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.vehicleCard, pressed && styles.cardPressed]}
              onPress={() => router.push({
                pathname: '/seat-selection',
                params: { vehicleId: item.id, routeId: id, from, to, fare, registration: item.registration },
              })}
            >
              <View style={styles.vehicleLeft}>
                <View style={styles.busIcon}>
                  <Ionicons name="bus" size={22} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.vehicleReg}>{item.registration}</Text>
                  <Text style={styles.vehicleSacco}>{item.sacco ?? 'Independent'}</Text>
                </View>
              </View>
              <View style={styles.vehicleRight}>
                <View style={styles.capacityBadge}>
                  <Ionicons name="people-outline" size={12} color="#2563EB" />
                  <Text style={styles.capacityText}>{item.capacity} seats</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'boarding' ? styles.statusBoarding : styles.statusIdle]}>
                  <Text style={[styles.statusText, item.status === 'boarding' ? styles.statusBoardingText : styles.statusIdleText]}>
                    {(item.status ?? 'idle').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12,
  },
  backBtn: { padding: 8, backgroundColor: '#F8FAFC', borderRadius: 12 },
  headerTitle: { color: '#0F172A', fontSize: 16, fontFamily: 'Inter_700Bold' },
  headerSub: { color: '#94A3B8', fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: '#94A3B8', fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 2 },
  list: { padding: 16, gap: 10 },
  introText: { color: '#64748B', fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, marginBottom: 8 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { color: '#0F172A', fontSize: 16, fontFamily: 'Inter_700Bold' },
  emptyText: { color: '#94A3B8', fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  vehicleCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, flexDirection: 'row',
    alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9', gap: 12,
  },
  cardPressed: { opacity: 0.9 },
  vehicleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  busIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  vehicleReg: { color: '#0F172A', fontSize: 13, fontFamily: 'Inter_700Bold' },
  vehicleSacco: { color: '#94A3B8', fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 2 },
  vehicleRight: { alignItems: 'flex-end', gap: 6, marginRight: 4 },
  capacityBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  capacityText: { color: '#2563EB', fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBoarding: { backgroundColor: '#ECFDF5' },
  statusIdle: { backgroundColor: '#F8FAFC' },
  statusText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  statusBoardingText: { color: '#10B981' },
  statusIdleText: { color: '#94A3B8' },
});
