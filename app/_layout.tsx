import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, LogBox, BackHandler } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, NotificationProvider, LanguageProvider, useAuth } from '@contexts/index';
import { useMe } from '@hooks/queries/useMe';
import { LoadingIndicator} from '@components/index';
import { I18nextProvider } from 'react-i18next';
import i18n from '@utils/i18n';

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

// Suppress Reanimated 4 deprecation warning
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('createAnimatedPropAdapter')
    ) {
      return;
    }
    originalWarn(...args);
  };
}

const NavigationGuard = () => {
  const { token, loading: authLoading } = useAuth();
  const { data: user, isLoading: queryLoading, isFetched } = useMe();
  const router = useRouter();
  const segments = useSegments();

  // Keep a ref to the latest segments so the auth guard reads the current
  // route without re-running on every navigation change.
  const segmentsRef = useRef(segments);
  useLayoutEffect(() => { segmentsRef.current = segments; }, [segments]);

  const [fontsLoaded] = useFonts({
    Baloo2_700Bold: require('@assets/fonts/Baloo2-VariableFont_wght.ttf'),
  });

  const isLoading = !fontsLoaded || authLoading || (!!token && queryLoading);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (router.canGoBack()) return false;
      const seg = segmentsRef.current;
      const inTabsGroup = seg[0] === '(tabs)';
      const onDashboard = seg.some(s => s === '(dashboard)');
      if (inTabsGroup && !onDashboard) {
        router.replace('/(tabs)/(dashboard)');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!fontsLoaded || authLoading) return;

    const seg = segmentsRef.current;
    const inAuthGroup = seg[0] === '(auth)';
    const inTabsGroup = seg[0] === '(tabs)';

    if (!token) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (isFetched && !queryLoading) {
      if (user) {
        if (!inTabsGroup) {
          router.replace('/(tabs)/(dashboard)');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading, user, queryLoading, fontsLoaded, isFetched]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingIndicator />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
});

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NotificationProvider>
              <NavigationGuard />
            </NotificationProvider>
          </AuthProvider>
        </QueryClientProvider>
      </LanguageProvider>
    </I18nextProvider>
  );
}
