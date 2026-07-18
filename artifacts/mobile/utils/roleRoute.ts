import type { UserRole } from '@/types';

/**
 * Returns the Expo Router path to navigate to after login, based on role.
 * All callers (pin, signup, splash) use this to stay consistent.
 */
export function roleHomeRoute(role: UserRole): string {
  if (role === 'driver' || role === 'conductor' || role === 'marshal') {
    return '/staff';
  }
  return '/(tabs)/';
}
