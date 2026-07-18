/**
 * Kenyan phone number normalisation utilities.
 *
 * Accepts any common Kenyan format:
 *   07XX XXX XXX  →  +254XXXXXXXXX
 *   +254 7XX...   →  +254XXXXXXXXX
 *   254 7XX...    →  +254XXXXXXXXX
 */

export function normalizeKenyanPhoneInput(raw: string): string {
  // Strip spaces, dashes, brackets
  const digits = raw.replace(/[\s\-()]/g, '');

  if (digits.startsWith('+254')) return digits;
  if (digits.startsWith('254')) return '+' + digits;
  if (digits.startsWith('0')) return '+254' + digits.slice(1);
  if (digits.startsWith('7') || digits.startsWith('1')) return '+254' + digits;
  return digits;
}

/**
 * Returns all plausible stored variants for a normalised phone number.
 * Supabase profiles may have the number stored in various formats.
 */
export function getKenyanPhoneVariants(normalized: string): string[] {
  const core = normalized.replace(/^\+254/, '');
  return [
    normalized,            // +2547XXXXXXXX
    '254' + core,          // 2547XXXXXXXX
    '0' + core,            // 07XXXXXXXX
    core,                  // 7XXXXXXXX
  ];
}

/** Strips pin_XXXX_secure wrapper to raw PIN (legacy format). */
export function normalizeProfilePin(stored: string): string {
  const match = stored.match(/^pin_([A-Z0-9]{4})_secure$/i);
  return match ? match[1].toUpperCase() : stored.toUpperCase();
}
