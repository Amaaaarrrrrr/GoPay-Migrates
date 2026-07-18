import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, ActivityIndicator, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { C, F, RADIUS } from '@/constants/theme';
import type { Route } from '@/types';

export default function RoutesScreen() {
  const insets = useSafeAreaInsets();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filtered, setFiltered] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    api.getRoutes().then(data => { setRoutes(data); setFiltered(data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) { setFiltered(routes); return; }
    const q = search.toLowerCase();
    setFiltered(routes.filter(r => r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q) || r.sacco.toLowerCase().includes(q)));
  }, [search, routes]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.fg} />
        </Pressable>
        <View>
          <Text style={styles.title}>Nairobi Routes</Text>
          <Text style={styles.subtitle}>Find your matatu route</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={C.mutedFg} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by area or sacco..."
          placeholderTextColor={C.mutedFg}
          value={search}
          onChangeText={setSearch}
        />
        {!!search && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={C.mutedFg} />
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={styles.loadingText}>Loading routes...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={r => r.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="map-outline" size={36} color={C.mutedFg} />
              <Text style={styles.emptyText}>No routes found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.routeCard, pressed && { opacity: 0.9 }]}
              onPress={() => router.push({ pathname: '/route-detail', params: { id: item.id, from: item.from, to: item.to, fare: item.fare.toString(), sacco: item.sacco } } as any)}
            >
              <View style={styles.routeLeft}>
                <View style={styles.routeIcon}>
                  <Ionicons name="bus" size={20} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeRoute}>{item.from} → {item.to}</Text>
                  <Text style={styles.routeSacco}>{item.sacco}</Text>
                  {item.duration && <Text style={styles.routeMeta}>{item.duration} • {item.distance}</Text>}
                </View>
              </View>
              <View style={styles.routeRight}>
                <Text style={styles.routeFare}>KES {item.fare}</Text>
                <Ionicons name="chevron-forward" size={16} color={C.mutedFg} />
              </View>
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
  searchWrap:{ flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: C.card, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, gap: 10 },
  searchInput:{ flex: 1, paddingVertical: 13, color: C.fg, fontSize: 14, fontFamily: F.regular },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingTop: 40 },
  loadingText:{ color: C.mutedFg, fontSize: 13, fontFamily: F.regular },
  emptyText: { color: C.mutedFg, fontSize: 13, fontFamily: F.regular },
  list:      { padding: 16, gap: 10 },
  routeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, borderWidth: 1, borderColor: C.border },
  routeLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  routeIcon: { width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' },
  routeRoute:{ color: C.fg, fontSize: 13, fontFamily: F.bold },
  routeSacco:{ color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 2 },
  routeMeta: { color: C.accent, fontSize: 10, fontFamily: F.medium, marginTop: 2 },
  routeRight:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeFare: { color: C.primary, fontSize: 14, fontFamily: F.bold },
});
