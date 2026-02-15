import type { JWTPayload } from '@ssr-webview-jwt/api';
import { type Bridge, bridge } from '@webview-bridge/react-native';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';

import { STORAGE_KEYS } from '../constants/storage';
import { getRefreshToken } from './http';

interface AppBridgeState extends Bridge {
  token: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
  } | null;
  getAccessToken: () => Promise<{ accessToken: string; accessTokenExpiresAt: number } | null>;
  getRefreshToken: () => Promise<{ refreshToken: string; refreshTokenExpiresAt: number } | null>;
  setToken: (token: { accessToken: string; refreshToken: string }) => Promise<void>;
  refreshToken: () => Promise<{
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: number;
    refreshTokenExpiresAt: number;
  } | null>;
  clearToken: () => Promise<void>;
}

export const appBridge = bridge<AppBridgeState>(({ get, set }) => {
  return {
    token: null,
    getAccessToken: async () => {
      const accessToken = get().token?.accessToken;

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
    setToken: async (token: { accessToken: string; refreshToken: string }) => {
      const decodedAccessToken = jwtDecode<JWTPayload>(token.accessToken);
      const decodedRefreshToken = jwtDecode<JWTPayload>(token.refreshToken);

      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token.refreshToken);

      set({
        token: {
          accessToken: token.accessToken,
          accessTokenExpiresAt: decodedAccessToken.exp,
          refreshToken: token.refreshToken,
          refreshTokenExpiresAt: decodedRefreshToken.exp,
        },
      });
    },
    refreshToken: async () => {
      const refreshToken = get().token?.refreshToken;

      if (!refreshToken) {
        return null;
      }

      const response = await getRefreshToken();

      if (!response) {
        return null;
      }

      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      set({
        token: {
          accessToken: response.accessToken,
          accessTokenExpiresAt: response.accessTokenExpiresAt,
          refreshToken: response.refreshToken,
          refreshTokenExpiresAt: response.refreshTokenExpiresAt,
        },
      });

      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        accessTokenExpiresAt: response.accessTokenExpiresAt,
        refreshTokenExpiresAt: response.refreshTokenExpiresAt,
      };
    },
    clearToken: async () => {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    },
  };
});

export type AppBridge = typeof appBridge;
