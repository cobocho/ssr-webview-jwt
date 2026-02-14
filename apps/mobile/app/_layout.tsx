import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';

import { AuthProvider, useAuth } from '@/src/context/auth-provider';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { initialized, isAuthenticated } = useAuth();

  useEffect(() => {
    if (initialized) {
      SplashScreen.hideAsync();
    }
  }, [initialized]);

  if (!initialized) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack initialRouteName={isAuthenticated ? '(auth)' : 'login'}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}
