import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, F, RADIUS } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="compass-outline" size={48} color={C.mutedFg} />
      </View>
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.desc}>This screen doesn't exist in the GoPay app.</Text>
      <Pressable style={styles.homeBtn} onPress={() => router.replace('/(tabs)/' as any)}>
        <Ionicons name="home-outline" size={16} color={C.primaryFg} />
        <Text style={styles.homeBtnText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  iconWrap:  { width: 88, height: 88, borderRadius: RADIUS.full, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title:     { color: C.fg, fontSize: 22, fontFamily: F.bold },
  desc:      { color: C.mutedFg, fontSize: 13, fontFamily: F.regular, textAlign: 'center' },
  homeBtn:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 12, paddingHorizontal: 28, marginTop: 12 },
  homeBtnText:{ color: C.primaryFg, fontSize: 14, fontFamily: F.semiBold },
});
