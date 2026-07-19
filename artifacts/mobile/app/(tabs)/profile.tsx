import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { C, F, RADIUS } from '@/constants/theme';

const MENU_ITEMS = [
  { icon: 'wallet-outline'      as const, label: 'Wallet',         desc: 'Manage your balance',    path: '/wallet'   },
  { icon: 'card-outline'        as const, label: 'Pay Fare',       desc: 'Cashless matatu payment', path: '/pay-fare' },
  { icon: 'send-outline'        as const, label: 'Send Money',     desc: 'Transfer to another user', path: '/send-money' },
  { icon: 'map-outline'         as const, label: 'Routes',         desc: 'Browse Nairobi routes',  path: '/routes'   },
  { icon: 'shield-outline'      as const, label: 'Security',       desc: 'PIN & authentication',   path: '/set-pin'  },
  { icon: 'settings-outline'    as const, label: 'Settings',       desc: 'App preferences',        path: null        },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', desc: 'Get assistance',         path: null        },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleLogout = async () => {
    await logout();
    router.replace('/login' as any);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: topPad }]}
      contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User card */}
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={C.primaryFg} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Guest'}</Text>
          {!!user?.email && (
            <View style={styles.phoneRow}>
              <Ionicons name="mail-outline" size={13} color={C.mutedFg} />
              <Text style={styles.phone}>{user.email}</Text>
            </View>
          )}
          {!!user?.phone && (
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={13} color={C.mutedFg} />
              <Text style={styles.phone}>{user.phone}</Text>
            </View>
          )}
          <Text style={styles.role}>{user?.role ?? ''} Account</Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menuList}>
        {MENU_ITEMS.map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.8 }]}
            onPress={() => item.path && router.push(item.path as any)}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={C.mutedFg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.mutedFg} />
          </Pressable>
        ))}
      </View>

      {/* Sign out */}
      <Pressable style={styles.signOutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={C.destructive} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 20 },
  header:    { marginBottom: 20 },
  title:     { color: C.fg, fontSize: 24, fontFamily: F.bold },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderRadius: RADIUS['2xl'], padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 24 },
  avatar:   { width: 64, height: 64, borderRadius: RADIUS.full, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  userName: { color: C.fg, fontSize: 17, fontFamily: F.bold },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  phone:    { color: C.mutedFg, fontSize: 12, fontFamily: F.regular },
  role:     { color: C.accent, fontSize: 10, fontFamily: F.semiBold, marginTop: 4, textTransform: 'capitalize' },
  menuList: { gap: 8, marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, borderWidth: 1, borderColor: C.border },
  menuIcon:  { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { color: C.fg, fontSize: 13, fontFamily: F.semiBold },
  menuDesc:  { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 1 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.destructiveBg, borderWidth: 1, borderColor: `${C.destructive}33`, borderRadius: RADIUS.xl, padding: 16 },
  signOutText: { color: C.destructive, fontSize: 14, fontFamily: F.semiBold },
});
