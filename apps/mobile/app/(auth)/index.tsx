import { useBridge } from '@webview-bridge/react-native';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BridgedWebView } from '@/src/components/bridged-webview';
import { WEBVIEW_ROUTES } from '@/src/constants/url';
import { useAuth } from '@/src/context/auth-provider';
import { appBridge } from '@/src/lib/bridge';
import { api } from '@/src/lib/http';

export default function Index() {
  const { logout } = useAuth();
  const token = useBridge(appBridge, (state) => state.token);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nativeContainer}>
        <Text style={styles.title}>NATIVE APP</Text>
        <Text>{token?.accessToken}</Text>
        <Text>{token?.refreshToken}</Text>
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
      <View style={styles.webviewContainer}>
        <BridgedWebView uri={WEBVIEW_ROUTES.home} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  nativeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  webviewContainer: {
    flex: 1,
    width: '100%',
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
