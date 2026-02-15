'use client';

import type { AppBridge } from '@ssr-webview-jwt/mobile';
import { createLinkBridgeProvider } from '@webview-bridge/react';

export const {
  BridgeProvider,
  useBridgeStore,
  useBridgeStatus,
  useBridgeLoose,
  useBridgeEventListener,
  bridge,
} = createLinkBridgeProvider<AppBridge>({
  throwOnError: true,
  initialBridge: {
    getAccessToken: async () => {
      return {
        accessToken: '',
        accessTokenExpiresAt: 0,
      };
    },
  },
});
