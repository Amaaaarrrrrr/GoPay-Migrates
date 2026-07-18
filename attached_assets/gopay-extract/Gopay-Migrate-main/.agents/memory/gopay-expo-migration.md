---
name: GoPay Expo migration
description: Architecture and file layout of the GoPay mobile app migrated to Expo Router.
---

# GoPay Expo Router app

## Location
`artifacts/mobile` — workflow: `artifacts/mobile: expo`

## Key decisions
- **Expo Router file-based routing** — no react-router-dom or @react-navigation
- **Supabase direct** — all data calls go to Supabase; no Express backend
- **Auth guard in `app/index.tsx`** (Splash) — checks auth, redirects to /(tabs), /login, /staff, or /unsupported-role
- **3 tabs**: Home (`(tabs)/index`), Trips (`(tabs)/trips`), Profile (`(tabs)/profile`)
- **NativeTabs** for iOS 26 Liquid Glass via `isLiquidGlassAvailable()`, classic Tabs otherwise

## Navigation pattern
`router.push('/route')` / `router.replace('/')` — no useNavigation. Params via `useLocalSearchParams()`.

## Auth context
`contexts/AuthContext.tsx` — signIn looks up profile by phone variants → signInWithPassword(email, pin). signUp creates auth user + profile + user_roles + wallet_accounts.

## Services
- `services/supabase.ts` — createClient with AsyncStorage
- `services/api.ts` — wallet, ledger, routes (falls back to mock data), bookings, seats, payFare, walletTransfer, setPin
- `services/storage.ts` — AsyncStorage wrapper
- `utils/phone.ts` — normalizeKenyanPhoneInput, getKenyanPhoneVariants

## Screens
index (Splash), login, signup, pin, set-pin, unsupported-role, staff, wallet, pay-fare, send-money, routes, route-detail, booking-vehicles, seat-selection, (tabs)/index, (tabs)/trips, (tabs)/profile
