import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { C, F, RADIUS } from '@/constants/theme';

const STAFF_ACTIONS: Record<string, Array<{ icon: any; label: string; desc: string; path: string }>> = {
  driver: [
    { icon: 'cash-outline', label: 'View Earnings', desc: 'Today\'s fare collection', path: '' },
    { icon: 'people-outline', label: 'Passengers', desc: 'Current passenger list', path: '' },
    { icon: 'map-outline', label: 'Active Route', desc: 'Route and stop info', path: '' },
    { icon: 'wallet-outline', label: 'Driver Wallet', desc: 'Wallet balance', path: '' },
  ],
  conductor: [
    { icon: 'card-outline', label: 'Collect Fares', desc: 'Scan or enter payments', path: '' },
    { icon: 'list-outline', label: 'Passenger List', desc: 'Booked passengers', path: '' },
    { icon: 'wallet-outline', label: 'Conductor Wallet', desc: 'Wallet balance', path: '' },
  ],
  marshal: [
    { icon: 'bus-outline', label: 'Manage Vehicles', desc: 'Fleet at terminal', path: '' },
    { icon: 'person-add-outline', label: 'Assign Driver', desc: 'Assign to route', path: '' },
    { icon: 'stats-chart-outline', label: 'Terminal Stats', desc: 'Daily summary', path: '' },
  ],
};

export default function StaffScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const role = user?.role ?? 'driver';
  const actions = STAFF_ACTIONS[role] ?? STAFF_ACTIONS.driver;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const roleLabel: Record<string, string> = { driver: 'Driver', conductor: 'Conductor', marshal: 'Marshal' };

  return (
    <ScrollView style={[styles.container, { paddingTop: topPad }]} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.brand}>GoPay Staff</Text>
        <Pressable style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/' as any); }}>
          <Ionicons name="log-out-outline" size={20} color={C.destructive} />
        </Pressable>
      </View>

      {/* Staff card */}
      <View style={styles.staffCard}>
        <View style={styles.glow} />
        <View style={styles.cardContent}>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={14} color={C.primaryFg} />
            <Text style={styles.roleText}>{roleLabel[role] ?? role}</Text>
          </View>
          <Text style={styles.staffName}>{user?.name ?? 'Staff Member'}</Text>
          <Text style={styles.staffPhone}>{user?.phone ?? ''}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {actions.map(a => (
            <Pressable key={a.label} style={({ pressed }) => [styles.actionCard, pressed && { opacity: 0.8 }]} onPress={() => {}}>
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon} size={24} color={C.primary} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
              <Text style={styles.actionDesc}>{a.desc}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Switch to passenger mode */}
      <Pressable style={styles.switchBtn} onPress={() => router.replace('/(tabs)/' as any)}>
        <Ionicons name="person-outline" size={16} color={C.primary} />
        <Text style={styles.switchText}>Switch to Passenger Mode</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 20, gap: 20 },
  topBar:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  brand:     { color: C.fg, fontSize: 18, fontFamily: F.bold },
  logoutBtn: { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.destructiveBg, alignItems: 'center', justifyContent: 'center' },
  staffCard: { backgroundColor: C.primary, borderRadius: RADIUS['2xl'], overflow: 'hidden', position: 'relative' },
  glow:      { position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardContent:{ padding: 24 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: RADIUS.full, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 12 },
  roleText:  { color: C.primaryFg, fontSize: 11, fontFamily: F.bold },
  staffName: { color: C.primaryFg, fontSize: 22, fontFamily: F.bold, marginBottom: 4 },
  staffPhone:{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: F.regular },
  section:   { gap: 12 },
  sectionTitle:{ color: C.fg, fontSize: 16, fontFamily: F.bold },
  actionsGrid:{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard:{ flex: 1, minWidth: '45%', backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, borderWidth: 1, borderColor: C.border, gap: 8 },
  actionIcon:{ width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' },
  actionLabel:{ color: C.fg, fontSize: 13, fontFamily: F.bold },
  actionDesc: { color: C.mutedFg, fontSize: 10, fontFamily: F.regular },
  switchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.secondary, borderRadius: RADIUS.xl, paddingVertical: 14, borderWidth: 1, borderColor: C.border },
  switchText:{ color: C.primary, fontSize: 14, fontFamily: F.semiBold },
});
