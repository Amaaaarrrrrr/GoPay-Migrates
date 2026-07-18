import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { C, F, RADIUS } from '@/constants/theme';

const PIN_REGEX   = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4}$/;
const LEGACY_PIN  = /^\d{4}$/;

export default function PinScreen() {
  const insets = useSafeAreaInsets();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signIn } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 300); }, []);

  const handleSubmit = async () => {
    const val = pin.trim();
    if (val.length !== 4 || loading) return;
    if (!PIN_REGEX.test(val) && !LEGACY_PIN.test(val)) {
      setError('PIN must be 4 characters (e.g. AB12)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(phone ?? '', val);
      router.replace('/');
    } catch (e: any) {
      setPin('');
      setError(e.message ?? 'Invalid PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.fg} />
        </Pressable>

        <View style={styles.body}>
          {/* Phone pill */}
          <View style={styles.phonePill}>
            <Ionicons name="call-outline" size={16} color={C.primary} />
            <Text style={styles.phoneText}>{phone}</Text>
          </View>

          <Text style={styles.heading}>Enter Your PIN</Text>
          <Text style={styles.hint}>Your PIN is 2 letters + 2 numbers (e.g., AB12)</Text>

          {/* PIN input */}
          <View style={styles.inputWrap}>
            <TextInput
              ref={inputRef}
              style={styles.pinInput}
              value={pin}
              onChangeText={v => {
                setError('');
                setPin(v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase());
              }}
              secureTextEntry={!showPin}
              placeholder="e.g. AB12"
              placeholderTextColor={C.mutedFg}
              maxLength={4}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!loading}
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPin(s => !s)}>
              <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={20} color={C.mutedFg} />
            </TouchableOpacity>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={15} color={C.destructive} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          <Pressable
            style={({ pressed }) => [styles.submitBtn, (pin.length !== 4 || loading) && styles.submitBtnDisabled, pressed && { opacity: 0.9 }]}
            onPress={handleSubmit}
            disabled={pin.length !== 4 || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color={C.primaryFg} />
              : <Text style={styles.submitText}>{loading ? 'Verifying…' : 'Login'}</Text>
            }
          </Pressable>

          {/* Forgot PIN */}
          <View style={styles.footerRow}>
            <Ionicons name="help-circle-outline" size={16} color={C.mutedFg} />
            <Text style={styles.footerText}> Forgot PIN?</Text>
          </View>

          <Text style={styles.signupRow}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => router.replace('/signup')}>
              Sign Up
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll:    { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn:   { width: 48, height: 48, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 16 },

  body:      { alignItems: 'center', paddingTop: 8 },
  phonePill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.secondary, borderRadius: RADIUS.full, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 28 },
  phoneText: { color: C.fg, fontSize: 14, fontFamily: F.medium },

  heading:   { color: C.fg, fontSize: 22, fontFamily: F.bold, marginBottom: 6, textAlign: 'center' },
  hint:      { color: C.mutedFg, fontSize: 12, fontFamily: F.regular, textAlign: 'center', marginBottom: 28 },

  inputWrap: { position: 'relative', width: '100%', marginBottom: 16 },
  pinInput:  {
    width: '100%', backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    borderRadius: RADIUS.xl, paddingVertical: 14, paddingHorizontal: 48,
    color: C.fg, fontSize: 22, fontFamily: F.bold, textAlign: 'center', letterSpacing: 8,
  },
  eyeBtn:    { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center', padding: 8 },

  errorBox:  { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.destructiveBg, borderRadius: RADIUS.lg, padding: 10, width: '100%', marginBottom: 16 },
  errorText: { color: C.destructive, fontSize: 12, fontFamily: F.medium, flex: 1 },

  submitBtn: {
    width: '100%', backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 16,
    alignItems: 'center', marginBottom: 24,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12,
  },
  submitBtnDisabled: { opacity: 0.4 },
  submitText: { color: C.primaryFg, fontSize: 16, fontFamily: F.bold },

  footerRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  footerText: { color: C.mutedFg, fontSize: 13, fontFamily: F.regular },
  signupRow:  { color: C.mutedFg, fontSize: 13, fontFamily: F.regular },
  signupLink: { color: C.primary, fontFamily: F.semiBold },
});
