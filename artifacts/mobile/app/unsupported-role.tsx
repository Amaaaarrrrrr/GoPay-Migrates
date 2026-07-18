import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { C, F, RADIUS } from '@/constants/theme';

export default function UnsupportedRoleScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="warning-outline" size={48} color={C.warning} />
      </View>
      <Text style={styles.title}>Role Not Supported</Text>
      <Text style={styles.desc}>
        Your account role ({user?.role}) is not yet supported on the mobile app.
        Please use the web application for full access.
      </Text>
      <Pressable style={styles.backBtn} onPress={() => router.replace('/login' as any)}>
        <Text style={styles.backText}>Back to Login</Text>
      </Pressable>
      <Pressable style={styles.logoutBtn} onPress={async () => { await logout(); router.replace('/login' as any); }}>
        <Ionicons name="log-out-outline" size={16} color={C.destructive} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  iconWrap:  { width: 96, height: 96, borderRadius: RADIUS.full, backgroundColor: C.warningBg, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title:     { color: C.fg, fontSize: 22, fontFamily: F.bold, textAlign: 'center' },
  desc:      { color: C.mutedFg, fontSize: 14, fontFamily: F.regular, textAlign: 'center', lineHeight: 22 },
  backBtn:   { backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 14, paddingHorizontal: 40, marginTop: 8 },
  backText:  { color: C.primaryFg, fontSize: 15, fontFamily: F.bold },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
  logoutText:{ color: C.destructive, fontSize: 13, fontFamily: F.semiBold },
});
