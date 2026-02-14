import { router } from 'expo-router';
import { Button, StyleSheet, View } from 'react-native';

import { useAuth } from '@/src/context/auth-provider';
import { api } from '@/src/lib/http';

export default function Login() {
  const { login } = useAuth();

  return (
    <View style={styles.container}>
      <Button
        title="Login"
        onPress={async () => {
          const response = await api.login({ email: 'user@example.com', password: '1234' });

          await login({
            accessToken: response.accessToken,
            accessTokenExpiresAt: response.accessTokenExpiresIn,
            refreshToken: response.refreshToken,
            refreshTokenExpiresAt: response.refreshTokenExpiresIn,
          });

          router.replace('/(auth)');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  list: {
    flex: 1,
    width: '100%',
    gap: 16,
  },
});
