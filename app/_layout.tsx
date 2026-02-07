import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, NotificationProvider, useAuth } from '@contexts/index';
import { useMe } from '@hooks/queries/useMe';
import { LoadingIndicator} from '@components/index';

const NavigationGuard = () => {
  const { token, loading: authLoading } = useAuth();
  const { data: user, isLoading: queryLoading, isFetched } = useMe();
  const router = useRouter();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Baloo2_700Bold: require('@assets/fonts/Baloo2-VariableFont_wght.ttf'),
  });

  useEffect(() => {
    if (!fontsLoaded || authLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

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
  }, [token, authLoading, user, queryLoading, fontsLoaded, isFetched, segments]);

  if (!fontsLoaded || authLoading || (token && queryLoading)) {
    return <LoadingIndicator />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
};

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <NavigationGuard /> 
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
