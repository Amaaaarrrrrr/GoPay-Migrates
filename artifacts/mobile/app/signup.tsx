import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeKenyanPhoneInput } from '@/utils/phone';
import { roleHomeRoute } from '@/utils/roleRoute';
import { C, F, RADIUS } from '@/constants/theme';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { phone: phoneParam } = useLocalSearchParams<{ phone: string }>();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState(phoneParam ?? '');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pinValid = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4}$/.test(pin);
  const canSubmit = name.length >= 2 && phone.length >= 9 && pinValid && pin === confirmPin && !loading;

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleSignUp = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const user = await signUp(normalizeKenyanPhoneInput(phone), name.trim(), pin.toUpperCase());
      router.replace(roleHomeRoute(user.role) as any);
    } catch (e: any) {
      setError(e.message ?? 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: topPad }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={C.fg} />
        </Pressable>

        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subheading}>Join GoPay — Kenya's transit payment platform</Text>

        <View style={styles.form}>
          {/* Name */}
          <View>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputRow}>
              <Ionicons name="person-outline" size={18} color={C.mutedFg} />
              <TextInput
                style={styles.input}
                placeholder="e.g. John Kamau"
                placeholderTextColor={C.mutedFg}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Phone */}
          <View>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputRow}>
              <Text style={styles.prefix}>🇰🇪 +254</Text>
              <TextInput
                style={styles.input}
                placeholder="07XX XXX XXX"
                placeholderTextColor={C.mutedFg}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={t => setPhone(normalizeKenyanPhoneInput(t))}
                editable={!loading}
              />
            </View>
          </View>

          {/* PIN */}
          <View>
            <Text style={styles.label}>Set PIN (2 letters + 2 numbers)</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={C.mutedFg} />
              <TextInput
                style={styles.input}
                placeholder="e.g. AB12"
                placeholderTextColor={C.mutedFg}
                secureTextEntry={!showPin}
                maxLength={4}
                autoCapitalize="characters"
                value={pin}
                onChangeText={v => setPin(v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase())}
                editable={!loading}
              />
              <Pressable onPress={() => setShowPin(s => !s)}>
                <Ionicons name={showPin ? 'eye-off-outline' : 'eye-outline'} size={18} color={C.mutedFg} />
              </Pressable>
            </View>
            {pin.length === 4 && !pinValid && (
              <Text style={styles.hintText}>PIN must contain both letters and numbers</Text>
            )}
          </View>

          {/* Confirm PIN */}
          <View>
            <Text style={styles.label}>Confirm PIN</Text>
            <View style={styles.inputRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color={C.mutedFg} />
              <TextInput
                style={styles.input}
                placeholder="Repeat your PIN"
                placeholderTextColor={C.mutedFg}
                secureTextEntry={!showPin}
                maxLength={4}
                autoCapitalize="characters"
                value={confirmPin}
                onChangeText={v => setConfirmPin(v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase())}
                editable={!loading}
              />
            </View>
            {confirmPin.length === 4 && pin !== confirmPin && (
              <Text style={[styles.hintText, { color: C.destructive }]}>PINs do not match</Text>
            )}
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={14} color={C.destructive} />
              <Text style={styles.errorText}> {error}</Text>
            </View>
          )}

          <Pressable
            style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
            onPress={handleSignUp}
            disabled={!canSubmit}
          >
            {loading
              ? <ActivityIndicator size="small" color={C.primaryFg} />
              : <Text style={styles.submitText}>Create Account</Text>
            }
          </Pressable>

          <Text style={styles.loginHint}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => router.replace('/login' as any)}>Sign In</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  scroll:     { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backBtn:    { width: 48, height: 48, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 20 },
  heading:    { color: C.fg, fontSize: 26, fontFamily: F.bold, marginBottom: 6 },
  subheading: { color: C.mutedFg, fontSize: 13, fontFamily: F.regular, marginBottom: 28, lineHeight: 20 },
  form:       { gap: 16 },
  label:      { color: C.mutedFg, fontSize: 11, fontFamily: F.semiBold, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, gap: 10 },
  input:      { flex: 1, paddingVertical: 13, color: C.fg, fontSize: 14, fontFamily: F.regular },
  prefix:     { color: C.fg, fontSize: 13, fontFamily: F.semiBold },
  hintText:   { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 4 },
  errorBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.destructiveBg, padding: 12, borderRadius: RADIUS.lg },
  errorText:  { color: C.destructive, fontSize: 12, fontFamily: F.medium },
  submitBtn:  { backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 16, alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: C.primaryFg, fontSize: 16, fontFamily: F.bold },
  loginHint:  { color: C.mutedFg, fontSize: 12, fontFamily: F.regular, textAlign: 'center', marginTop: 8 },
  loginLink:  { color: C.primary, fontFamily: F.semiBold },
});
