---
name: GoPay Mobile App Build
description: Complete Expo mobile app — screens, auth, design system, Supabase integration
---

## Design System
- Color tokens in `constants/theme.ts` (C, F, RADIUS exports)
- bg: #070A13, card: #0F1220, primary: #0A6FC2 (hsl 207,90%,40%)
- Font: PlusJakartaSans (400/500/600/700/800)

## Auth
- AuthContext at `contexts/AuthContext.tsx`
- signIn tries 6 password candidates for legacy pin_XXXX_secure format
- signUp creates profile + user_roles + wallet_accounts rows

## Supabase
- Client in `services/supabase.ts` — lazy-initialized with Proxy pattern
- Falls back to placeholder client when EXPO_PUBLIC_SUPABASE_URL is missing (prevents crash)
- **Why:** Supabase createClient throws on empty URL; app shell must load even unconfigured

## Screens built
login, pin, signup, set-pin, wallet, pay-fare, send-money, routes, route-detail,
booking-vehicles, seat-selection, staff, unsupported-role, +not-found,
(tabs)/index, (tabs)/trips, (tabs)/profile

## Env vars required
- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY
Both must be Replit Secrets (EXPO_PUBLIC_ prefix required for Expo web preview)

## PIN format quirk
Stored as raw 4-char alphanum (e.g. AB12); legacy format was pin_XXXX_secure.
Self-repairs legacy format on first successful login.
