import { Alert, Button, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/src/context/auth-provider';
import { api } from '@/src/lib/http';

export default function Index() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NATIVE APP</Text>
      <Button title="Logout" onPress={logout} />
      <Button
        title="public"
        onPress={async () => {
          const response = await api.getPublic();
          Alert.alert('Public', response.message);
        }}
      />
      <Button
        title="protected"
        onPress={async () => {
          const response = await api.getProtected();
          Alert.alert('Protected', response.message);
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    width: '100%',
    gap: 16,
  },
});
