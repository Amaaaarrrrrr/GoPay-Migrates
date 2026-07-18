import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/services/supabase';
import { normalizeKenyanPhoneInput, getKenyanPhoneVariants } from '@/utils/phone';
import { C, F, RADIUS } from '@/constants/theme';

const BG_IMAGE = 'https://images.unsplash.com/photo-1611824904551-3af6a3d5d6d7?w=1080&q=80';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (phone.length < 9 || !agreed || loading) return;
    setLoading(true);
    setError('');
    try {
      const normalizedPhone = normalizeKenyanPhoneInput(phone);
      const variants = getKenyanPhoneVariants(normalizedPhone);

      const runQuery = () =>
        supabase
          .from('profiles')
          .select('email, phone, pin')
          .in('phone', variants)
          .limit(1)
          .maybeSingle();

      const timeout = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error('Lookup timeout')), 8000)
      );
      let { data: profile, error: profileErr } = await Promise.race([runQuery(), timeout]) as Awaited<ReturnType<typeof runQuery>>;

      // Self-heal: expired session attached to anon → 401 PGRST303
      if (profileErr && (profileErr as any).code === 'PGRST303') {
        await supabase.auth.signOut().catch(() => {});
        ({ data: profile, error: profileErr } = await runQuery());
      }
      if (profileErr) throw profileErr;

      if (profile?.email) {
        router.push({ pathname: '/pin', params: { phone: normalizeKenyanPhoneInput(profile.phone) } });
      } else {
        router.push({ pathname: '/signup', params: { phone: normalizedPhone } });
      }
    } catch (e: any) {
      setError(e.message?.includes('timeout') ? 'Network is slow. Please try again.' : 'Unable to check account right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background image */}
      <Image source={{ uri: BG_IMAGE }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brandWrap}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandName}>GoPay</Text>
          <View style={styles.tagline}>
            <Ionicons name="flash" size={13} color={C.primary} />
            <Text style={styles.taglineText}> Kenya's Smart Transit Payment Platform</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ENTER PHONE NUMBER</Text>

          <View style={styles.inputRow}>
            <View style={styles.countryChip}>
              <Text style={styles.flag}>🇰🇪</Text>
              <Text style={styles.countryCode}>+254</Text>
            </View>
            <TextInput
              style={styles.textInput}
              keyboardType="phone-pad"
              placeholder="07XX XXX XXX"
              placeholderTextColor={C.mutedFg}
              value={phone}
              onChangeText={t => { setError(''); setPhone(normalizeKenyanPhoneInput(t)); }}
              maxLength={10}
              editable={!loading}
            />
          </View>

          {!!error && (
            <View style={styles.errorRow}>
              <Ionicons name="warning-outline" size={14} color={C.destructive} />
              <Text style={styles.errorText}> {error}</Text>
            </View>
          )}

          <Pressable style={styles.checkRow} onPress={() => setAgreed(v => !v)}>
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={12} color={C.primaryFg} />}
            </View>
            <Text style={styles.checkText}>
              I agree to the <Text style={styles.link}>Terms & Conditions</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </Pressable>

          <Pressable
            style={[styles.continueBtn, (!agreed || phone.length < 9 || loading) && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={!agreed || phone.length < 9 || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color={C.primaryFg} />
              : <>
                  <Text style={styles.continueBtnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color={C.primaryFg} />
                </>
            }
          </Pressable>

          <Text style={styles.signupHint}>
            New to GoPay?{' '}
            <Text style={styles.signupLink} onPress={() => router.push('/signup')}>Create Account</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,10,19,0.82)' },
  scroll:     { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 36, minHeight: '100%' },

  brandWrap:    { paddingTop: 64, paddingBottom: 40 },
  welcomeText:  { color: C.fg, fontSize: 22, fontFamily: F.extraBold, marginBottom: 4 },
  brandName:    { color: C.fg, fontSize: 48, fontFamily: F.extraBold, letterSpacing: -1 },
  tagline:      { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  taglineText:  { color: C.mutedFg, fontSize: 12, fontFamily: F.regular },

  card:      { backgroundColor: `${C.card}E8`, borderRadius: RADIUS['2xl'], padding: 22, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  cardLabel: { color: C.mutedFg, fontSize: 10, fontFamily: F.bold, letterSpacing: 1.5, marginBottom: 12 },

  inputRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.secondary, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 12 },
  countryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 14, borderRightWidth: 1, borderRightColor: C.border },
  flag:        { fontSize: 18 },
  countryCode: { color: C.fg, fontSize: 14, fontFamily: F.semiBold },
  textInput:   { flex: 1, color: C.fg, fontSize: 15, fontFamily: F.medium, paddingHorizontal: 14, paddingVertical: 14 },

  errorRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  errorText: { color: C.destructive, fontSize: 12, fontFamily: F.medium },

  checkRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18 },
  checkbox:     { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxActive:{ backgroundColor: C.primary, borderColor: C.primary },
  checkText:    { flex: 1, color: C.mutedFg, fontSize: 12, fontFamily: F.regular, lineHeight: 18 },
  link:         { color: C.primary, fontFamily: F.semiBold },

  continueBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 15, marginBottom: 14, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText:     { color: C.primaryFg, fontSize: 16, fontFamily: F.bold },

  signupHint: { color: C.mutedFg, fontSize: 12, fontFamily: F.regular, textAlign: 'center' },
  signupLink: { color: C.primary, fontFamily: F.semiBold },
});
