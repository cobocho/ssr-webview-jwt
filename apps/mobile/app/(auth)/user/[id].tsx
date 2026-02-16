import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BridgedWebView } from '@/src/components/bridged-webview';
import { WEBVIEW_ROUTES } from '@/src/constants/url';

export default function Article() {
  const { id } = useLocalSearchParams();

  if (!id) {
    return <Text>User not found</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.webviewContainer}>
        <BridgedWebView uri={WEBVIEW_ROUTES.userDetail.replace(':id', id as string)} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webviewContainer: {
    flex: 1,
    width: '100%',
  },
});
