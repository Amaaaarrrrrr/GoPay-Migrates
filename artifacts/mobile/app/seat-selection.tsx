import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, F, RADIUS } from '@/constants/theme';

const TOTAL_SEATS = 14;

export default function SeatSelectionScreen() {
  const insets = useSafeAreaInsets();
  const { vehicleId, routeId, from, to, fare, registration } = useLocalSearchParams<{ vehicleId: string; routeId: string; from: string; to: string; fare: string; registration: string }>();
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  // Mock some seats as taken
  const takenSeats = [2, 5, 7, 9, 12];
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const getSeatStatus = (n: number): 'available' | 'taken' | 'selected' => {
    if (selectedSeat === n) return 'selected';
    if (takenSeats.includes(n)) return 'taken';
    return 'available';
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.fg} />
        </Pressable>
        <View>
          <Text style={styles.title}>Select Seat</Text>
          <Text style={styles.subtitle}>{registration} • {from} → {to}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 80 }]}>
        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: C.card, label: 'Available' },
            { color: C.secondary, label: 'Taken' },
            { color: C.primary, label: 'Selected' },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color, borderColor: l.color === C.card ? C.border : l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Bus layout */}
        <View style={styles.busFrame}>
          {/* Driver area */}
          <View style={styles.driverRow}>
            <View style={styles.steeringWrap}>
              <Ionicons name="radio-button-off" size={18} color={C.mutedFg} />
              <Text style={styles.driverText}>Driver</Text>
            </View>
          </View>

          {/* Seat grid */}
          <View style={styles.seatsGrid}>
            {Array.from({ length: TOTAL_SEATS }, (_, i) => i + 1).map(n => {
              const status = getSeatStatus(n);
              return (
                <Pressable
                  key={n}
                  style={[
                    styles.seat,
                    status === 'available' && styles.seatAvail,
                    status === 'taken'     && styles.seatTaken,
                    status === 'selected'  && styles.seatSelected,
                  ]}
                  onPress={() => status !== 'taken' && setSelectedSeat(n)}
                  disabled={status === 'taken'}
                >
                  <Text style={[styles.seatNum, status === 'selected' && { color: C.primaryFg }]}>{n}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Confirm CTA */}
      <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
        {selectedSeat && (
          <Text style={styles.selectedInfo}>Seat {selectedSeat} selected • KES {fare}</Text>
        )}
        <Pressable
          style={[styles.confirmBtn, !selectedSeat && styles.confirmDisabled]}
          disabled={!selectedSeat}
          onPress={() => router.push('/pay-fare' as any)}
        >
          <Text style={styles.confirmText}>Confirm & Pay KES {fare}</Text>
          <Ionicons name="arrow-forward" size={18} color={C.primaryFg} />
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
  scroll:    { padding: 20 },
  legend:    { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 20 },
  legendItem:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 16, height: 16, borderRadius: 4, borderWidth: 1 },
  legendText:{ color: C.mutedFg, fontSize: 11, fontFamily: F.regular },
  busFrame:  { backgroundColor: C.card, borderRadius: RADIUS['2xl'], padding: 20, borderWidth: 1, borderColor: C.border },
  driverRow: { alignItems: 'flex-end', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  steeringWrap:{ alignItems: 'center', gap: 4 },
  driverText:{ color: C.mutedFg, fontSize: 10, fontFamily: F.medium },
  seatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  seat:      { width: 52, height: 52, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  seatAvail: { backgroundColor: C.secondary, borderColor: C.border },
  seatTaken: { backgroundColor: C.border, borderColor: C.border },
  seatSelected:{ backgroundColor: C.primary, borderColor: C.primary },
  seatNum:   { color: C.fg, fontSize: 14, fontFamily: F.bold },
  cta:       { paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border, gap: 8 },
  selectedInfo:{ color: C.mutedFg, fontSize: 12, fontFamily: F.medium, textAlign: 'center' },
  confirmBtn:{ backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  confirmDisabled:{ opacity: 0.4 },
  confirmText:{ color: C.primaryFg, fontSize: 15, fontFamily: F.bold },
});
