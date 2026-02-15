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

  const [, setKey] = useState(0);

  if (!initialized) {
    return null;
  }

  return (
    <WebView
      source={{
        uri,
      }}
      sharedCookiesEnabled={true}
      thirdPartyCookiesEnabled={true} // Android에서 필요할 때가 많음
      javaScriptEnabled={true}
      domStorageEnabled={true}
      bounces={false}
      overScrollMode="never"
      setBuiltInZoomControls={false}
      nestedScrollEnabled={false}
      mixedContentMode="always"
      scrollEnabled={false}
      originWhitelist={['*']}
      ref={webviewRef}
      setSupportMultipleWindows={false}
      onContentProcessDidTerminate={() => {
        // iOS
        webviewRef.current?.reload();
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
