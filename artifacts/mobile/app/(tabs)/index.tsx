import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, StyleSheet, Image, Dimensions,
  ScrollView, ActivityIndicator, Platform, Modal, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { C, F, RADIUS } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  { uri: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=70', title: 'Go Cashless', sub: 'Pay your fare with a tap using GoPay' },
  { uri: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=70', title: 'Instant Payments', sub: 'Top up & pay fares in seconds' },
  { uri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=70', title: 'All Saccos Connected', sub: 'One app for every matatu in Nairobi' },
  { uri: 'https://images.unsplash.com/photo-1611824904551-3af6a3d5d6d7?w=800&q=70', title: 'Travel Smart', sub: 'Track routes and trips in real time' },
];

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'Top Up',   route: '/wallet'     },
  { icon: 'card-outline'        as const, label: 'Pay Fare', route: '/pay-fare'   },
  { icon: 'bus-outline'         as const, label: 'Routes',   route: '/routes'     },
  { icon: 'send-outline'        as const, label: 'Send',     route: '/send-money' },
];

const MENU_ITEMS = [
  { icon: 'home-outline'        as const, label: 'Home',          path: '/(tabs)/'      },
  { icon: 'wallet-outline'      as const, label: 'Wallet',        path: '/wallet'       },
  { icon: 'card-outline'        as const, label: 'Pay Fare',      path: '/pay-fare'     },
  { icon: 'send-outline'        as const, label: 'Send Money',    path: '/send-money'   },
  { icon: 'map-outline'         as const, label: 'Routes',        path: '/routes'       },
  { icon: 'time-outline'        as const, label: 'Trip History',  path: '/(tabs)/trips' },
  { icon: 'person-outline'      as const, label: 'Profile',       path: '/(tabs)/profile' },
  { icon: 'shield-outline'      as const, label: 'Security',      path: '/set-pin'      },
  { icon: 'settings-outline'    as const, label: 'Settings',      path: '/(tabs)/profile' },
  { icon: 'notifications-outline' as const, label: 'Notifications', path: '/(tabs)/profile' },
  { icon: 'help-circle-outline' as const, label: 'Help & Support', path: '/(tabs)/profile' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(-280)).current;

  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(menuAnim, { toValue: 0, useNativeDriver: true, damping: 25, stiffness: 200 }).start();
  };
  const closeMenu = () => {
    Animated.spring(menuAnim, { toValue: -280, useNativeDriver: true, damping: 25, stiffness: 200 }).start(() => setMenuOpen(false));
  };

  const loadBalance = useCallback(async () => {
    try { const w = await api.getWallet(); setBalance(w.balance); }
    catch { setBalance(null); }
    finally { setWalletLoading(false); }
  }, []);

  useEffect(() => { loadBalance(); }, [loadBalance]);
  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Commuter';
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      {/* Side drawer */}
      <Modal visible={menuOpen} transparent animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.drawerOverlay} onPress={closeMenu} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: menuAnim }] }]}>
          <View style={[styles.drawerHeader, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.drawerBrand}>GoPay</Text>
            <Pressable onPress={closeMenu} style={styles.drawerClose}>
              <Ionicons name="close" size={18} color={C.fg} />
            </Pressable>
          </View>
          <View style={styles.drawerUser}>
            <View style={styles.drawerAvatar}>
              <Ionicons name="person" size={22} color={C.primaryFg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.drawerName}>{user?.name ?? 'Guest'}</Text>
              <Text style={styles.drawerPhone}>{user?.phone ?? ''}</Text>
              <Text style={styles.drawerRole}>{user?.role}</Text>
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {MENU_ITEMS.map(item => (
              <Pressable key={item.label} style={styles.drawerItem} onPress={() => { closeMenu(); router.push(item.path as any); }}>
                <Ionicons name={item.icon} size={20} color={C.mutedFg} />
                <Text style={styles.drawerItemLabel}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={[styles.drawerFooter, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable style={styles.signOutBtn} onPress={async () => { closeMenu(); await logout(); router.replace('/' as any); }}>
              <Ionicons name="log-out-outline" size={18} color={C.destructive} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Modal>

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: topPad + 8 }]}>
        <View style={styles.topLeft}>
          <Pressable style={styles.iconBtn} onPress={openMenu}>
            <Ionicons name="menu" size={22} color={C.fg} />
          </Pressable>
          <View>
            <Text style={styles.greetingText}>{greeting()}</Text>
            <Text style={styles.userName}>{firstName} 👋</Text>
          </View>
        </View>
        <View style={styles.topRight}>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={C.fg} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: 100 + insets.bottom }]}
      >
        {/* Wallet balance card */}
        <View style={styles.cardWrap}>
          <Pressable style={styles.walletCard} onPress={() => router.push('/wallet' as any)}>
            <View style={styles.glow1} />
            <View style={styles.glow2} />
            <View style={styles.cardInner}>
              <View style={styles.cardRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="wallet-outline" size={14} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.cardLabel}>Available Balance</Text>
                </View>
                <View style={styles.activeDot} />
              </View>
              <View style={styles.cardBalance}>
                {walletLoading
                  ? <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
                  : <Text style={styles.balanceAmt}>
                      KES {balance != null ? balance.toLocaleString('en-KE', { minimumFractionDigits: 2 }) : '—'}
                    </Text>
                }
              </View>
              <Text style={styles.cardSub}>{user?.name} • {user?.phone}</Text>
            </View>
          </Pressable>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map(a => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [styles.actionBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.96 }] }]}
              onPress={() => router.push(a.route as any)}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name={a.icon} size={22} color={C.primary} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Hero carousel */}
        <View style={styles.carousel}>
          <Image source={{ uri: SLIDES[slide].uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <View style={styles.carouselOverlay} />
          <View style={styles.carouselContent}>
            <Text style={styles.carouselTitle}>{SLIDES[slide].title}</Text>
            <Text style={styles.carouselSub}>{SLIDES[slide].sub}</Text>
          </View>
          <View style={styles.dotRow}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Routes CTA */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Nairobi Routes</Text>
            <Pressable onPress={() => router.push('/routes' as any)}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          <Pressable style={({ pressed }) => [styles.routeCard, pressed && { opacity: 0.9 }]} onPress={() => router.push('/routes' as any)}>
            <View style={styles.routeIcon}>
              <Ionicons name="map-outline" size={22} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeTitle}>Explore Available Routes</Text>
              <Text style={styles.routeSub}>Browse saccos, fares and book seats</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.mutedFg} />
          </Pressable>
        </View>

        {/* Footer branding */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>POWERED BY GOPAY</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  drawerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,10,19,0.7)' },
  drawer: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, backgroundColor: C.card, borderRightWidth: 1, borderRightColor: C.border, zIndex: 100 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  drawerBrand:  { color: C.fg, fontSize: 18, fontFamily: F.bold },
  drawerClose:  { width: 32, height: 32, borderRadius: RADIUS.md, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  drawerUser:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  drawerAvatar: { width: 48, height: 48, borderRadius: RADIUS.full, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  drawerName:   { color: C.fg, fontSize: 14, fontFamily: F.semiBold },
  drawerPhone:  { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 1 },
  drawerRole:   { color: C.accent, fontSize: 10, fontFamily: F.semiBold, marginTop: 2, textTransform: 'capitalize' },
  drawerItem:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13 },
  drawerItemLabel: { color: C.fg, fontSize: 13, fontFamily: F.medium },
  drawerFooter: { borderTopWidth: 1, borderTopColor: C.border, padding: 20 },
  signOutBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: RADIUS.lg, backgroundColor: C.destructiveBg, borderWidth: 1, borderColor: `${C.destructive}33` },
  signOutText:  { color: C.destructive, fontSize: 13, fontFamily: F.semiBold },
  topBar:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  topLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topRight:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn:   { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  greetingText: { color: C.mutedFg, fontSize: 11, fontFamily: F.regular },
  userName:  { color: C.fg, fontSize: 16, fontFamily: F.bold, marginTop: 1 },
  notifDot:  { position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: RADIUS.full, backgroundColor: C.destructive },
  scroll: { paddingTop: 16 },
  cardWrap: { paddingHorizontal: 20, marginBottom: 20 },
  walletCard: { backgroundColor: C.primary, borderRadius: RADIUS['2xl'], overflow: 'hidden', shadowColor: C.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8 },
  glow1: { position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)' },
  glow2: { position: 'absolute', bottom: -30, left: -30, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(0,0,0,0.12)' },
  cardInner: { padding: 24, position: 'relative', zIndex: 1 },
  cardRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cardLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontFamily: F.medium },
  activeDot: { width: 8, height: 8, borderRadius: RADIUS.full, backgroundColor: C.success },
  cardBalance: { marginBottom: 8, minHeight: 44, justifyContent: 'center' },
  balanceAmt: { color: C.primaryFg, fontSize: 36, fontFamily: F.extraBold, letterSpacing: -0.5 },
  cardSub:   { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: F.regular },
  actionsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 20 },
  actionBtn:  { flex: 1, backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  actionIconWrap: { width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { color: C.fg, fontSize: 10, fontFamily: F.bold },
  carousel: { marginHorizontal: 20, borderRadius: RADIUS.xl, height: 160, overflow: 'hidden', marginBottom: 24, position: 'relative' },
  carouselOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,10,19,0.48)' },
  carouselContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  carouselTitle: { color: C.fg, fontSize: 17, fontFamily: F.bold },
  carouselSub:   { color: 'rgba(238,242,245,0.75)', fontSize: 11, fontFamily: F.regular, marginTop: 2 },
  dotRow:   { position: 'absolute', bottom: 14, right: 16, flexDirection: 'row', gap: 4 },
  dot:      { width: 5, height: 5, borderRadius: RADIUS.full, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive:{ backgroundColor: C.fg, width: 18, height: 5, borderRadius: RADIUS.full },
  section:     { paddingHorizontal: 20, marginBottom: 16 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:{ color: C.fg, fontSize: 15, fontFamily: F.bold },
  seeAll:      { color: C.primary, fontSize: 12, fontFamily: F.semiBold },
  routeCard:   { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, gap: 14 },
  routeIcon:   { width: 44, height: 44, borderRadius: RADIUS.lg, backgroundColor: `${C.primary}18`, alignItems: 'center', justifyContent: 'center' },
  routeTitle:  { color: C.fg, fontSize: 13, fontFamily: F.bold },
  routeSub:    { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 2 },
  footer:     { alignItems: 'center', paddingVertical: 12 },
  footerText: { color: `${C.mutedFg}55`, fontSize: 9, fontFamily: F.medium, letterSpacing: 2 },
});
