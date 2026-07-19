import { supabase } from './supabase';
import type { Route, Vehicle, Transaction } from '@/types';

// ─── Wallet ───────────────────────────────────────────────────────────────────

export async function getWallet(userIdHint?: string): Promise<{ balance: number; id: string; currency: string }> {
  // Prefer the caller-supplied id (already known from auth context) to avoid
  // an extra network round-trip to supabase.auth.getUser().
  const uid = userIdHint ?? (await supabase.auth.getUser()).data.user?.id;
  if (!uid) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('wallet_accounts')
    .select('id, balance')
    .eq('user_id', uid)
    .maybeSingle();

  if (error) throw error;

  // Auto-create wallet if one doesn't exist for this user
  if (!data) {
    const { data: created, error: createErr } = await supabase
      .from('wallet_accounts')
      .insert({ user_id: uid, balance: 0 })
      .select('id, balance')
      .single();
    if (createErr) {
      console.warn('[api] getWallet: could not auto-create wallet:', createErr.message);
      return { id: '', balance: 0, currency: 'KES' };
    }
    return { id: created.id, balance: created.balance ?? 0, currency: 'KES' };
  }

  // currency is always KES — the column does not exist in the schema
  return { id: data.id, balance: data.balance ?? 0, currency: 'KES' };
}

export async function topUpWallet(amount: number, _pin?: string): Promise<{ reference: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const reference = 'TOP' + Date.now().toString(36).toUpperCase();

  // Try RPC first; fall back to direct update if RPC is not deployed
  const { error: rpcErr } = await supabase.rpc('process_top_up', {
    p_user_id: user.id,
    p_amount: amount,
    p_reference: reference,
  });

  if (rpcErr) {
    // Fallback: fetch current balance, add amount, write new total
    const wallet = await getWallet(user.id);
    const newBalance = (wallet.balance ?? 0) + amount;
    const { error: updateErr } = await supabase
      .from('wallet_accounts')
      .update({ balance: newBalance })
      .eq('id', wallet.id);
    if (updateErr) throw updateErr;

    // Record the top-up transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount,
      type: 'top_up',
      transaction_type: 'topup',
      description: `Wallet top-up via M-Pesa`,
      reference,
      status: 'success',
    });
  }

  return { reference };
}

// ─── Pay Fare ─────────────────────────────────────────────────────────────────

export async function payFare(
  tillNumber: string,
  amount: number,
  pin: string
): Promise<{ reference: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify PIN
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('pin, email')
    .eq('id', user.id)
    .single();
  if (profileErr) throw profileErr;

  const storedPin = profile?.pin ?? '';
  const candidates = buildPinCandidates(pin.toUpperCase(), storedPin);
  const pinOk = candidates.some(c => c === storedPin || c === pin || pin.toUpperCase() === c.toUpperCase());
  if (!pinOk) {
    // Try with the raw pin against stored
    const rawMatch = pin.toUpperCase() === storedPin.toUpperCase() ||
      `pin_${pin.toUpperCase()}_secure` === storedPin ||
      storedPin.includes(pin.toUpperCase());
    if (!rawMatch) throw new Error('Incorrect PIN. Please try again.');
  }

  // Check balance
  const wallet = await getWallet();
  if (wallet.balance < amount) throw new Error('Insufficient balance.');

  const reference = 'TXN' + Date.now().toString(36).toUpperCase();

  // Record transaction
  const { error: txErr } = await supabase.from('transactions').insert({
    user_id: user.id,
    amount: -amount,
    type: 'fare_payment',
    transaction_type: 'fare_payment',
    description: `Fare payment to ${tillNumber}`,
    fleet_number: tillNumber,
    reference,
    status: 'success',
  });
  if (txErr) throw txErr;

  // Deduct from wallet
  const { error: walErr } = await supabase
    .from('wallet_accounts')
    .update({ balance: wallet.balance - amount })
    .eq('id', wallet.id);
  if (walErr) throw walErr;

  return { reference };
}

function buildPinCandidates(rawPin: string, stored: string): string[] {
  const up = rawPin.toUpperCase();
  return [
    rawPin,
    up,
    rawPin.toLowerCase(),
    `pin_${up}_secure`,
    `pin_${rawPin}_secure`,
    stored,
  ];
}

// ─── Wallet Transfer ──────────────────────────────────────────────────────────

export async function walletTransfer(
  toPhone: string,
  amount: number,
  pin: string
): Promise<{ reference: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Verify PIN against profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('pin')
    .eq('id', user.id)
    .single();

  const storedPin = profile?.pin ?? '';
  const rawPin = pin.toUpperCase().trim();
  const pinOk =
    rawPin === storedPin.toUpperCase() ||
    `pin_${rawPin}_secure` === storedPin ||
    rawPin === storedPin;
  if (!pinOk) throw new Error('Incorrect PIN. Please try again.');

  // Check sender balance
  const senderWallet = await getWallet(user.id);
  if (senderWallet.balance < amount) throw new Error('Insufficient balance.');

  // Find recipient by phone
  const variants = [toPhone, toPhone.replace('+', ''), toPhone.replace('+254', '0')];
  const { data: recipientProfile } = await supabase
    .from('profiles')
    .select('id')
    .in('phone', variants)
    .limit(1)
    .maybeSingle();

  const reference = 'TRF' + Date.now().toString(36).toUpperCase();

  // Deduct from sender
  const { error: debitErr } = await supabase
    .from('wallet_accounts')
    .update({ balance: senderWallet.balance - amount })
    .eq('id', senderWallet.id);
  if (debitErr) throw debitErr;

  // Record sender transaction
  await supabase.from('transactions').insert({
    user_id: user.id,
    amount: -amount,
    type: 'transfer',
    transaction_type: 'transfer',
    description: `Money sent to ${toPhone}`,
    reference,
    status: 'success',
  });

  // Credit recipient if found
  if (recipientProfile?.id) {
    const recipientWallet = await getWallet(recipientProfile.id);
    if (recipientWallet.id) {
      await supabase
        .from('wallet_accounts')
        .update({ balance: recipientWallet.balance + amount })
        .eq('id', recipientWallet.id);

      await supabase.from('transactions').insert({
        user_id: recipientProfile.id,
        amount,
        type: 'transfer',
        transaction_type: 'transfer',
        description: `Money received`,
        reference,
        status: 'success',
      });
    }
  }

  return { reference };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const MOCK_ROUTES: Route[] = [
  { id: '1', from: 'CBD', to: 'Westlands', fare: 50, sacco: 'KBS', duration: '25 min', distance: '8 km' },
  { id: '2', from: 'CBD', to: 'Eastlands', fare: 40, sacco: 'Metro Trans', duration: '30 min', distance: '10 km' },
  { id: '3', from: 'CBD', to: 'Karen', fare: 80, sacco: '2NK', duration: '45 min', distance: '20 km' },
  { id: '4', from: 'CBD', to: 'Ngong', fare: 100, sacco: 'KBS', duration: '60 min', distance: '28 km' },
  { id: '5', from: 'Westlands', to: 'Kikuyu', fare: 60, sacco: 'Citi Hoppa', duration: '40 min', distance: '15 km' },
  { id: '6', from: 'CBD', to: 'Thika', fare: 120, sacco: 'Metro Trans', duration: '90 min', distance: '42 km' },
  { id: '7', from: 'CBD', to: 'Ruiru', fare: 90, sacco: 'KBS', duration: '70 min', distance: '35 km' },
  { id: '8', from: 'CBD', to: 'Rongai', fare: 110, sacco: 'Rongai Route', duration: '80 min', distance: '38 km' },
];

/** Normalise a raw DB row to our Route shape, handling alternate column names. */
function normaliseRoute(row: Record<string, any>): Route {
  return {
    id:       String(row.id ?? ''),
    from:     row.from ?? row.origin ?? row.pickup_location ?? row.start ?? row.source ?? '',
    to:       row.to   ?? row.destination ?? row.drop_location ?? row.end ?? row.dest ?? '',
    fare:     Number(row.fare ?? row.price ?? row.cost ?? 0),
    sacco:    row.sacco ?? row.sacco_name ?? row.operator ?? '',
    duration: row.duration ?? row.estimated_duration ?? row.travel_time ?? undefined,
    distance: row.distance ?? row.km ?? undefined,
  };
}

export async function getRoutes(): Promise<Route[]> {
  try {
    const { data, error } = await supabase.from('routes').select('*').limit(50);
    if (error) { console.warn('[api] getRoutes error:', error.message); return MOCK_ROUTES; }
    if (!data?.length) return MOCK_ROUTES;
    const mapped = data.map(normaliseRoute).filter(r => r.from || r.to);
    return mapped.length ? mapped : MOCK_ROUTES;
  } catch (e: any) {
    console.warn('[api] getRoutes exception:', e?.message);
    return MOCK_ROUTES;
  }
}

export async function getRouteById(id: string): Promise<Route | null> {
  try {
    const { data } = await supabase.from('routes').select('*').eq('id', id).single();
    if (data) return normaliseRoute(data as Record<string, any>);
    return MOCK_ROUTES.find(r => r.id === id) ?? null;
  } catch {
    return MOCK_ROUTES.find(r => r.id === id) ?? null;
  }
}

// ─── Vehicles ─────────────────────────────────────────────────────────────────

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'v1', registration: 'KDA 123A', sacco: 'KBS', capacity: 14, status: 'boarding', fleet_number: 'KDA123' },
  { id: 'v2', registration: 'KBC 456B', sacco: 'Metro Trans', capacity: 33, status: 'idle', fleet_number: 'KBC456' },
  { id: 'v3', registration: 'KDB 789C', sacco: '2NK', capacity: 14, status: 'boarding', fleet_number: 'KDB789' },
  { id: 'v4', registration: 'KCA 321D', sacco: 'Citi Hoppa', capacity: 52, status: 'idle', fleet_number: 'KCA321' },
];

export async function getVehicles(routeId?: string): Promise<Vehicle[]> {
  try {
    let q = supabase.from('vehicles').select('*');
    if (routeId) q = q.eq('route_id', routeId);
    const { data, error } = await q.limit(20);
    if (error || !data?.length) return MOCK_VEHICLES;
    return data as Vehicle[];
  } catch {
    return MOCK_VEHICLES;
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data as Transaction[]) ?? [];
}

// ─── Set PIN ──────────────────────────────────────────────────────────────────

export async function setPin(newPin: string, currentPin?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  // Update auth password
  const { error: authErr } = await supabase.auth.updateUser({ password: newPin });
  if (authErr) throw authErr;

  // Update stored pin
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ pin: newPin.toUpperCase() })
    .eq('id', user.id);
  if (profileErr) throw profileErr;
}

// Convenience export
export const api = {
  getWallet,
  topUpWallet,
  payFare,
  walletTransfer,
  getRoutes,
  getRouteById,
  getVehicles,
  getTransactions,
  setPin,
};
