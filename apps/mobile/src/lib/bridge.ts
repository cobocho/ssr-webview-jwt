import { type Bridge, bridge } from '@webview-bridge/react-native';
import * as SecureStore from 'expo-secure-store';

import { STORAGE_KEYS } from '../constants/storage';

interface AppBridgeState extends Bridge {
  token: {
    accessToken: string;
    refreshToken: string;
  } | null;
  getToken: () => Promise<{ accessToken: string; refreshToken: string } | null>;
}

export const appBridge = bridge<AppBridgeState>({
  token: null,
  getToken: async () => {
    const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  },
});

export type AppBridge = typeof appBridge;
