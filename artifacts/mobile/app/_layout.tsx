import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import * as Font from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RootLayoutNav() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="pin" />
        <Stack.Screen name="set-pin" />
        <Stack.Screen name="unsupported-role" />
        <Stack.Screen name="staff" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="pay-fare" />
        <Stack.Screen name="send-money" />
        <Stack.Screen name="routes" />
        <Stack.Screen name="route-detail" />
        <Stack.Screen name="booking-vehicles" />
        <Stack.Screen name="seat-selection" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;

    // Hard cap: never block the app more than 4 seconds for fonts
    const fallbackTimer = setTimeout(() => {
      if (!done) { done = true; setReady(true); SplashScreen.hideAsync().catch(() => {}); }
    }, 4000);

    Font.loadAsync({
      PlusJakartaSans_400Regular,
      PlusJakartaSans_500Medium,
      PlusJakartaSans_600SemiBold,
      PlusJakartaSans_700Bold,
      PlusJakartaSans_800ExtraBold,
    })
      .catch(() => {
        // Font CDN unreachable — silently fall back to system fonts
      })
      .finally(() => {
        if (!done) {
          done = true;
          clearTimeout(fallbackTimer);
          setReady(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      });

    return () => clearTimeout(fallbackTimer);
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary>
              <RootLayoutNav />
            </ErrorBoundary>
          </QueryClientProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
