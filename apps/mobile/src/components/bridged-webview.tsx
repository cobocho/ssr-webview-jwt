import { createWebView } from '@webview-bridge/react-native';
import { useRef, useState } from 'react';
import type { WebView as WebViewType, WebViewProps } from 'react-native-webview';

import { useAuth } from '../context/auth-provider';
import { appBridge } from '../lib/bridge';

interface BridgedWebViewProps extends WebViewProps {
  uri: string;
}

const { WebView } = createWebView({
  bridge: appBridge,
  debug: true,
});

export function BridgedWebView({ uri, style, ...props }: BridgedWebViewProps) {
  const { initialized } = useAuth();

  const webviewRef = useRef<WebViewType>(null);

  const [key, setKey] = useState(0);

  if (!initialized) {
    return null;
  }

  return (
    <WebView
      key={key}
      source={{
        uri,
      }}
      sharedCookiesEnabled={true}
      thirdPartyCookiesEnabled={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      bounces={false}
      overScrollMode="never"
      setBuiltInZoomControls={false}
      mixedContentMode="always"
      nestedScrollEnabled={false}
      scrollEnabled={true}
      originWhitelist={['*']}
      ref={webviewRef}
      setSupportMultipleWindows={false}
      onContentProcessDidTerminate={() => {
        // iOS
        webviewRef.current?.reload();
      }}
      onMessage={(event) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'reload') {
            setKey((k) => k + 1);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }}
      onRenderProcessGone={() => {
        // Android
        setKey((k) => k + 1);
        return true;
      }}
      {...props}
    />
  );
}
