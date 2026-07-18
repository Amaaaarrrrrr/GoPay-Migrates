---
name: GoPay PIN auth password format
description: The Supabase auth password format used by the original GoPay app — critical for sign-in to work.
---

# GoPay PIN / Supabase auth password format

## The rule
The original GoPay app stored PINs in `profiles.pin` as `pin_XXXX_secure` (e.g. `pin_AB12_secure`) AND used that **same full formatted string** as the Supabase auth password — NOT the raw PIN the user types.

**Why:** Confirmed by the error: profile lookup succeeded (stored `pin_AB12_secure` normalized to `AB12` matched what user typed), but `signInWithPassword(email, "AB12")` failed — meaning the auth password is `pin_AB12_secure`, not `AB12`.

## Current fix (in AuthContext.tsx signIn)
Tries 7 password candidates in order (raw, uppercase, lowercase, formatted variants, full stored value, normalized stored value). On first success, silently calls `supabase.auth.updateUser({ password: rawPin })` to self-repair so future logins use the simple path.

## How to apply
- If auth still breaks, check whether `profiles.pin` has a different format in the database.
- `normalizeProfilePin()` strips the `pin_..._secure` wrapper to get the raw PIN.
- New accounts created via signUp always use raw PIN as the Supabase auth password (already standardized).
