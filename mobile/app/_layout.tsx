import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';
import * as SystemUI from 'expo-system-ui';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useNotifications } from '@/hooks/useNotifications';

SystemUI.setBackgroundColorAsync(Colors.background);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useNotifications();

  useEffect(() => {
    useAuthStore.getState().restoreSession().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const atReset = segments[0] === 'reset-to-welcome';
    const atRoot = segments.length === 0;
    const nowAuthenticated = useAuthStore.getState().isAuthenticated;

    if (nowAuthenticated && atRoot) {
      router.replace('/(tabs)');
    } else if (!nowAuthenticated && !inAuth && !inOnboarding && !atRoot && !atReset) {
      router.replace('/reset-to-welcome');
    }
  }, [isAuthenticated, segments, ready]);

  if (!ready) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      </Stack>
      <StatusBar style="light" />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
