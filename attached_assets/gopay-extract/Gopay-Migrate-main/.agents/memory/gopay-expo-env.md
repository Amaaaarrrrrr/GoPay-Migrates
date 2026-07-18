---
name: GoPay Expo env vars
description: How Supabase credentials are injected into the Expo mobile bundle — what worked and what didn't.
---

# Supabase credentials in Expo web + native

## The rule
Secrets must be named `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` exactly — stored as Replit Secrets with that EXPO_PUBLIC_ prefix.

`supabase.ts` reads:
```ts
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
```

**Why:** Expo's babel transform only inlines `EXPO_PUBLIC_*` vars into the client bundle for web. Other env vars (SUPABASE_URL, VITE_*) stay server-side and are undefined in the browser bundle.

## What was tried and failed
1. **`.env` file** — Replit blocks writing to `.env` ("user secrets should never be stored in the filesystem").
2. **`app.config.js` + `Constants.expoConfig.extra`** — `Constants.expoConfig` is undefined/empty in web bundles served by Expo Router.
3. **`$ALIAS` in npm script** — `EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL` in package.json dev script: `SUPABASE_URL` secret wasn't set, so it expanded to empty string.
4. **Non-EXPO_PUBLIC_ secrets** — `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` as Replit secrets: available in Node.js build process but NOT inlined into the web client bundle.

## How to apply
Any future credential the Expo app needs on web must be stored as a Replit Secret with `EXPO_PUBLIC_` prefix.
