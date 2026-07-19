import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase';
import { normalizeKenyanPhoneInput, getKenyanPhoneVariants, normalizeProfilePin } from '@/utils/phone';
import type { User, UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (phone: string, pin: string) => Promise<User>;
  signUp: (phone: string, name: string, pin: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const hasBootstrapped = useRef(false);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (session?.user) {
        await loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Loads profile + role, sets state, and returns the resolved User. */
  async function loadProfile(userId: string): Promise<User> {
    const [{ data }, { data: roleData }, { data: { user: authUser } }] = await Promise.all([
      supabase.from('profiles').select('id, name, full_name, phone, email, avatar_url').eq('id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle(),
      supabase.auth.getUser(),
    ]);

    // Name: profile.name → profile.full_name → auth metadata → ''
    const authMeta = authUser?.user_metadata ?? {};
    const name =
      data?.name?.trim() ||
      data?.full_name?.trim() ||
      authMeta.full_name?.trim() ||
      authMeta.name?.trim() ||
      '';

    // Email: profile → auth
    const email = data?.email?.trim() || authUser?.email?.trim() || '';

    // Phone: profile only
    const phone = data?.phone?.trim() || '';

    // If profile is missing name/phone, sync from auth metadata silently
    if (data && (!data.name || !data.phone)) {
      void supabase.from('profiles').upsert({
        id: userId,
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
      }).then(() => {});
    }

    const resolved: User = {
      id: data?.id ?? userId,
      name,
      phone,
      email,
      role: (roleData?.role ?? 'passenger') as UserRole,
      avatarUrl: data?.avatar_url ?? null,
    };
    setUser(resolved);
    return resolved;
  }

  async function signIn(phone: string, pin: string): Promise<User> {
    const normalizedPhone = normalizeKenyanPhoneInput(phone);
    const variants = getKenyanPhoneVariants(normalizedPhone);

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('email, pin, id')
      .in('phone', variants)
      .limit(1)
      .maybeSingle();

    if (profileErr) throw new Error('Unable to find account. Please check your number.');
    if (!profile?.email) throw new Error('Account not found. Please sign up.');

    const rawPin = pin.toUpperCase().trim();
    const storedPin = profile.pin ?? '';

    const passwords = [
      rawPin,
      `pin_${rawPin}_secure`,
      rawPin.toLowerCase(),
      storedPin,
      normalizeProfilePin(storedPin),
    ];

    let lastErr = 'Incorrect PIN. Please try again.';
    for (const password of passwords) {
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      if (!error) {
        if (password !== rawPin) {
          // Fire-and-forget self-repair: use void + IIFE so errors never surface to the caller
          void (async () => { try { await supabase.auth.updateUser({ password: rawPin }); } catch {} })();
          void (async () => { try { await supabase.from('profiles').update({ pin: rawPin }).eq('id', profile.id); } catch {} })();
        }
        return await loadProfile(profile.id);
      }
      lastErr = error.message;
    }

    throw new Error(lastErr.includes('Invalid') ? 'Incorrect PIN. Please try again.' : lastErr);
  }

  async function signUp(phone: string, name: string, pin: string): Promise<User> {
    const normalizedPhone = normalizeKenyanPhoneInput(phone);
    const email = `${normalizedPhone.replace('+', '')}@gopay.ke`;

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: pin.toUpperCase(),
    });
    if (authErr) throw authErr;
    if (!authData.user) throw new Error('Sign up failed. Please try again.');

    const userId = authData.user.id;

    await supabase.from('profiles').upsert({
      id: userId,
      name,
      phone: normalizedPhone,
      email,
      pin: pin.toUpperCase(),
    });

    await supabase.from('user_roles').upsert({
      user_id: userId,
      role: 'passenger',
    });

    await supabase.from('wallet_accounts').upsert({
      user_id: userId,
      balance: 0,
      currency: 'KES',
    });

    return await loadProfile(userId);
  }

  async function logout(): Promise<void> {
    setUser(null);                          // clear immediately so UI reacts at once
    await supabase.auth.signOut().catch(() => {});
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
