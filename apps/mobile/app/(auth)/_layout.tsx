import { Stack } from 'expo-router';

import { AuthGuard } from '@/src/guard/auth-guard';

export default function AuthLayout() {
  return (
    <AuthGuard>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </AuthGuard>
  );
}
