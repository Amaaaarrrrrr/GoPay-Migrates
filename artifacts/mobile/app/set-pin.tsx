import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { C, F, RADIUS } from '@/constants/theme';

export default function SetPinScreen() {
  const insets = useSafeAreaInsets();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const pinValid = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{4}$/.test(newPin);
  const canSubmit = currentPin.length >= 4 && pinValid && newPin === confirmPin && !loading;
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const handleSetPin = async () => {
    if (!canSubmit) return;
    setLoading(true); setError('');
    try {
      await api.setPin(newPin.toUpperCase(), currentPin.toUpperCase());
      setSuccess(true);
    } catch (e: any) {
      setError(e.message ?? 'Failed to update PIN.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="shield-checkmark" size={52} color={C.success} />
          </View>
          <Text style={styles.successTitle}>PIN Updated!</Text>
          <Text style={styles.successSub}>Your new PIN is active. Use it to authorise payments.</Text>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={C.fg} />
          </Pressable>
          <View>
            <Text style={styles.title}>Change PIN</Text>
            <Text style={styles.subtitle}>Update your security PIN</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {[
              { label: 'Current PIN', value: currentPin, setter: setCurrentPin },
              { label: 'New PIN (2 letters + 2 numbers)', value: newPin, setter: setNewPin },
              { label: 'Confirm New PIN', value: confirmPin, setter: setConfirmPin },
            ].map(({ label, value, setter }) => (
              <View key={label}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="lock-closed-outline" size={18} color={C.mutedFg} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. AB12"
                    placeholderTextColor={C.mutedFg}
                    secureTextEntry={!showPins}
                    maxLength={4}
                    autoCapitalize="characters"
                    value={value}
                    onChangeText={v => setter(v.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase())}
                  />
                </View>
              </View>
            ))}

            <Pressable style={styles.showRow} onPress={() => setShowPins(s => !s)}>
              <Ionicons name={showPins ? 'eye-off-outline' : 'eye-outline'} size={16} color={C.primary} />
              <Text style={styles.showText}>{showPins ? 'Hide' : 'Show'} PINs</Text>
            </Pressable>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={14} color={C.destructive} />
                <Text style={styles.errorText}> {error}</Text>
              </View>
            )}

            <Pressable style={[styles.submitBtn, !canSubmit && styles.submitDisabled]} onPress={handleSetPin} disabled={!canSubmit}>
              {loading
                ? <ActivityIndicator size="small" color={C.primaryFg} />
                : <Text style={styles.submitText}>Update PIN</Text>
              }
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  backBtn:   { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  title:     { color: C.fg, fontSize: 17, fontFamily: F.bold },
  subtitle:  { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 1 },
  scroll:    { padding: 24 },
  form:      { gap: 16 },
  label:     { color: C.mutedFg, fontSize: 11, fontFamily: F.semiBold, marginBottom: 6 },
  inputRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, gap: 10 },
  input:     { flex: 1, paddingVertical: 13, color: C.fg, fontSize: 18, fontFamily: F.bold, textAlign: 'center', letterSpacing: 8 },
  showRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  showText:  { color: C.primary, fontSize: 13, fontFamily: F.medium },
  errorBox:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.destructiveBg, padding: 12, borderRadius: RADIUS.lg },
  errorText: { color: C.destructive, fontSize: 12, fontFamily: F.medium },
  submitBtn: { backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 16, alignItems: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitDisabled: { opacity: 0.4 },
  submitText:{ color: C.primaryFg, fontSize: 16, fontFamily: F.bold },
  successWrap:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successIcon:{ width: 100, height: 100, borderRadius: RADIUS['2xl'], backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle:{ color: C.fg, fontSize: 26, fontFamily: F.bold, marginBottom: 8, textAlign: 'center' },
  successSub: { color: C.mutedFg, fontSize: 14, fontFamily: F.regular, textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  doneBtn:   { backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 15, paddingHorizontal: 48 },
  doneBtnText:{ color: C.primaryFg, fontSize: 15, fontFamily: F.bold },
});
