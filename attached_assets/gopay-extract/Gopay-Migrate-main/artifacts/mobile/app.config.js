// app.config.js — runs in Node.js build process where Replit secrets are available.
// Injects Supabase config into Constants.expoConfig.extra so the bundle
// works on both web (where EXPO_PUBLIC_ inlining is required) and native.
const base = require('./app.json');

module.exports = {
  ...base,
  expo: {
    ...base.expo,
    extra: {
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL ||
        process.env.SUPABASE_URL ||
        process.env.VITE_SUPABASE_URL ||
        '',
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        '',
    },
  },
};
