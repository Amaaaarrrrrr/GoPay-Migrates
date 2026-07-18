import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { C, F, RADIUS } from '@/constants/theme';

export default function SplashScreen() {
  const { user, loading } = useAuth();
  const hasRedirected = useRef(false);
  const dot0 = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;

  // Bouncing dots animation
  useEffect(() => {
    const bounce = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -8, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(400 - delay),
        ])
      ).start();
    bounce(dot0, 0);
    bounce(dot1, 120);
    bounce(dot2, 240);
  }, []);

  useEffect(() => {
    if (loading || hasRedirected.current) return;
    hasRedirected.current = true;
    if (user) {
      const role = user.role;
      if (role === 'driver')    { router.replace('/staff'); return; }
      if (role === 'marshal')   { router.replace('/staff'); return; }
      if (role === 'conductor') { router.replace('/staff'); return; }
      router.replace('/(tabs)/');
    } else {
      router.replace('/login');
    }
  }, [user, loading]);

  return (
    <View style={styles.container}>
      {/* Brand */}
      <Text style={styles.brand}>GoPay</Text>
      <View style={styles.flagBar}>
        <View style={[styles.flagStripe, { backgroundColor: '#000000' }]} />
        <View style={[styles.flagStripe, { backgroundColor: '#B71C1C' }]} />
        <View style={[styles.flagStripe, { backgroundColor: C.primary }]} />
      </View>

      {/* Loader */}
      <View style={styles.dotsRow}>
        {[dot0, dot1, dot2].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>

      <Text style={styles.tagline}>Kenya's Transport Payment Platform</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 16 },
  brand:     { color: C.fg, fontSize: 48, fontFamily: F.extraBold, letterSpacing: -1 },
  flagBar:   { flexDirection: 'row', gap: 2 },
  flagStripe:{ width: 36, height: 4, borderRadius: RADIUS.full },
  dotsRow:   { flexDirection: 'row', gap: 8, marginTop: 24 },
  dot:       { width: 8, height: 8, borderRadius: RADIUS.full, backgroundColor: C.primary },
  tagline:   { color: `${C.mutedFg}99`, fontSize: 11, fontFamily: F.medium, letterSpacing: 1, textTransform: 'uppercase' },
});
