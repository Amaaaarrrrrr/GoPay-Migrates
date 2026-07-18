import React, { useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { C, F, RADIUS } from '@/constants/theme';

export default function PayFareScreen() {
  const insets = useSafeAreaInsets();
  const [tillNumber, setTillNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ref, setRef] = useState('');
  const [error, setError] = useState('');

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (!tillNumber || isNaN(amt) || amt <= 0 || pin.length < 4) return;
    setLoading(true); setError('');
    try {
      const result = await api.payFare(tillNumber, amt, pin);
      setRef(result.reference);
      setSuccess(true);
    } catch (e: any) {
      setError(e.message || 'Payment failed. Check balance or connectivity.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.successWrap}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={C.success} />
          </View>
          <Text style={styles.successTitle}>Fare Paid!</Text>
          <Text style={styles.successAmt}>KES {parseFloat(amount).toLocaleString()}</Text>
          <Text style={styles.successSub}>to vehicle {tillNumber}</Text>
          <View style={styles.refBox}>
            <Text style={styles.refLabel}>TXN REFERENCE</Text>
            <Text style={styles.refVal}>{ref}</Text>
          </View>
          <Pressable style={styles.doneBtn} onPress={() => router.back()}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={C.fg} />
          </Pressable>
          <View>
            <Text style={styles.title}>Pay Fare</Text>
            <Text style={styles.subtitle}>Cashless Matatu Payment</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            {/* Vehicle */}
            <View>
              <Text style={styles.label}>Vehicle Fleet / Till Number</Text>
              <View style={styles.inputRow}>
                <Ionicons name="bus-outline" size={18} color={C.mutedFg} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. KDD 456B"
                  placeholderTextColor={C.mutedFg}
                  autoCapitalize="characters"
                  value={tillNumber}
                  onChangeText={t => setTillNumber(t.toUpperCase())}
                />
              </View>
            </View>

            {/* Amount */}
            <View>
              <Text style={styles.label}>Fare Amount (KES)</Text>
              <View style={styles.inputRow}>
                <Text style={styles.prefix}>KES</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={C.mutedFg}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>

            {/* PIN */}
            <View>
              <Text style={styles.label}>Security PIN</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={C.mutedFg} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input}
                  placeholder="4-character PIN"
                  placeholderTextColor={C.mutedFg}
                  secureTextEntry
                  maxLength={4}
                  autoCapitalize="characters"
                  value={pin}
                  onChangeText={setPin}
                />
              </View>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={14} color={C.destructive} />
                <Text style={styles.errorText}>  {error}</Text>
              </View>
            )}

            <Pressable
              style={[styles.submitBtn, (!tillNumber || !amount || pin.length < 4 || loading) && styles.submitDisabled]}
              onPress={handlePay}
              disabled={!tillNumber || !amount || pin.length < 4 || loading}
            >
              {loading
                ? <ActivityIndicator size="small" color={C.primaryFg} />
                : <>
                    <Ionicons name="card" size={18} color={C.primaryFg} />
                    <Text style={styles.submitText}>  Pay Fare</Text>
                  </>
              }
            </Pressable>

            <View style={styles.secureRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={C.success} />
              <Text style={styles.secureText}>  Secured by GoPay encryption</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border, gap: 12 },
  backBtn:    { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: C.secondary, alignItems: 'center', justifyContent: 'center' },
  title:      { color: C.fg, fontSize: 17, fontFamily: F.bold },
  subtitle:   { color: C.mutedFg, fontSize: 11, fontFamily: F.regular, marginTop: 1 },
  scroll:     { padding: 24 },
  form:       { gap: 16 },
  label:      { color: C.mutedFg, fontSize: 11, fontFamily: F.semiBold, marginBottom: 6 },
  inputRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
  input:      { flex: 1, paddingVertical: 13, color: C.fg, fontSize: 14, fontFamily: F.regular },
  prefix:     { color: C.mutedFg, fontSize: 12, fontFamily: F.bold, marginRight: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: C.border, paddingVertical: 13 },
  errorBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: C.destructiveBg, padding: 12, borderRadius: RADIUS.lg },
  errorText:  { color: C.destructive, fontSize: 12, fontFamily: F.medium },
  submitBtn:  { backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, shadowColor: C.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12 },
  submitDisabled: { opacity: 0.4 },
  submitText: { color: C.primaryFg, fontSize: 15, fontFamily: F.bold },
  secureRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secureText: { color: C.success, fontSize: 11, fontFamily: F.medium },
  // Success
  successWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  successIcon:  { width: 100, height: 100, borderRadius: RADIUS['2xl'], backgroundColor: C.successBg, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { color: C.fg, fontSize: 26, fontFamily: F.bold, marginBottom: 4 },
  successAmt:   { color: C.primary, fontSize: 32, fontFamily: F.extraBold },
  successSub:   { color: C.mutedFg, fontSize: 13, fontFamily: F.regular, marginBottom: 28 },
  refBox:       { backgroundColor: C.card, borderRadius: RADIUS.xl, padding: 16, alignItems: 'center', marginBottom: 28, width: '100%', borderWidth: 1, borderColor: C.border },
  refLabel:     { color: C.mutedFg, fontSize: 9, fontFamily: F.bold, letterSpacing: 2, marginBottom: 6 },
  refVal:       { color: C.fg, fontSize: 13, fontFamily: F.semiBold },
  doneBtn:      { backgroundColor: C.primary, borderRadius: RADIUS.xl, paddingVertical: 15, paddingHorizontal: 48 },
  doneBtnText:  { color: C.primaryFg, fontSize: 15, fontFamily: F.bold },
});
