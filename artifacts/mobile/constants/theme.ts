/**
 * GoPay Design System
 * Mirrors the web app's design tokens (hsl-based palette converted to hex).
 *
 * Primary:     hsl(207, 90%, 40%) → #0A6FC2
 * Accent:      hsl(207, 85%, 50%) → #1A8FDC
 * Success:     hsl(145, 65%, 38%) → #21A15B
 * Destructive: hsl(0, 72%, 55%)   → #E04646
 * Background:  hsl(230, 25%, 4%)  → #070A13 (dark)
 * Card:        hsl(230, 22%, 8%)  → #0F1220
 * Radius:      0.75rem            → 12px base
 */

export const C = {
  // Core surfaces
  bg:       '#070A13',
  card:     '#0F1220',
  secondary:'#131929',

  // Typography
  fg:       '#EEF2F5',
  mutedFg:  '#8A9BBE',

  // Brand
  primary:   '#0A6FC2',
  primaryFg: '#FFFFFF',
  accent:    '#1A8FDC',

  // Semantic
  success:       '#21A15B',
  successBg:     '#0D2E1C',
  destructive:   '#E04646',
  destructiveBg: '#2E0D0D',
  warning:       '#D97706',
  warningBg:     '#2D1E08',

  // Structure
  border:  '#1E2D4D',
} as const;

export const F = {
  regular:   'PlusJakartaSans_400Regular',
  medium:    'PlusJakartaSans_500Medium',
  semiBold:  'PlusJakartaSans_600SemiBold',
  bold:      'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const RADIUS = {
  sm:   6,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl':20,
  full: 9999,
} as const;
