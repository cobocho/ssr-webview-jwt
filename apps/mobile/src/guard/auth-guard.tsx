import { Redirect } from 'expo-router';
import { Text } from 'react-native';

import { useAuth } from '../context/auth-provider';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, initialized } = useAuth();

  if (!initialized) {
    return <Text>Loading...</Text>;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
};
