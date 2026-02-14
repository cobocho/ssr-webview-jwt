import type { JWTPayload } from '@ssr-webview-jwt/api';
import { type Bridge, bridge } from '@webview-bridge/react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

import { STORAGE_KEYS } from '../constants/storage';

interface AppBridgeState extends Bridge {
  token: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
  } | null;
  getAccessToken: () => Promise<{ accessToken: string; accessTokenExpiresAt: number } | null>;
  getRefreshToken: () => Promise<{ refreshToken: string; refreshTokenExpiresAt: number } | null>;
  setToken: (token: {
    accessToken: string;
    accessTokenExpiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  }) => Promise<void>;
  clearToken: () => Promise<void>;
}

export const appBridge = bridge<AppBridgeState>(({ set }) => {
  return {
    token: null,
    getAccessToken: async () => {
      const accessToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

      if (!accessToken) {
        return null;
      }

      const decodedAccessToken = jwtDecode<JWTPayload>(accessToken);

      return { accessToken, accessTokenExpiresAt: decodedAccessToken.exp };
    },
    getRefreshToken: async () => {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        return null;
      }

      const decodedRefreshToken = jwtDecode<JWTPayload>(refreshToken);

      return { refreshToken, refreshTokenExpiresAt: decodedRefreshToken.exp };
    },
    setToken: async (token: {
      accessToken: string;
      accessTokenExpiresAt: number;
      refreshToken: string;
      refreshTokenExpiresAt: number;
    }) => {
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken);

      set({
        token: {
          accessToken: token.accessToken,
          accessTokenExpiresAt: token.accessTokenExpiresAt,
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        },
      });
    },
    clearToken: async () => {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    },
  };
});

export type AppBridge = typeof appBridge;
