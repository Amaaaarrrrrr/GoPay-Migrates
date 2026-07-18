import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Fallback to a mock when credentials are not configured.
// The app renders correctly and shows a helpful message on login.
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Return a minimal stub so the app shell loads without crashing.
    // Real calls will fail gracefully when creds are absent.
    _client = createClient('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        storage: AsyncStorage as any,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    return _client;
  }

  _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage as any,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});

export const isSupabaseConfigured = () => !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
