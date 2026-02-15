import { Api } from '@ssr-webview-jwt/api';
import * as SecureStore from 'expo-secure-store';
import ky from 'ky';

import { STORAGE_KEYS } from '../constants/storage';
import { BASE_URL } from '../constants/url';
import { appBridge } from './bridge';

let refreshPromise: Promise<{
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
  refreshTokenExpiresAt: number;
} | null> | null = null;

export const getRefreshToken = async () => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');

  if (!refreshToken) return null;

  try {
    const response = await ky
      .post(`${BASE_URL}/refresh`, {
        headers: { Authorization: `Bearer ${refreshToken}` },
        retry: 0,
      })
      .json<{
        accessToken: string;
        accessTokenExpiresIn: number;
        refreshToken: string;
        refreshTokenExpiresIn: number;
      }>();

    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

    return {
      accessToken: response.accessToken,
      accessTokenExpiresAt: response.accessTokenExpiresIn,
      refreshToken: response.refreshToken,
      refreshTokenExpiresAt: response.refreshTokenExpiresIn,
    };
  } catch (error) {
    console.error('토큰 갱신 실패', error);
    return null;
  }
};

export const httpClient = ky.create({
  prefixUrl: BASE_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await appBridge.getState().getAccessToken();
        if (!token) return;
        request.headers.set('Authorization', `Bearer ${token.accessToken}`);
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) {
          return response;
        }

        if (request.headers.get('X-Retry')) {
          return response;
        }

        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          return response;
        }

        if (!refreshPromise) {
          refreshPromise = getRefreshToken().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;
        if (!newToken) return response;

        await appBridge.getState().setToken({
          accessToken: newToken.accessToken,
          refreshToken: newToken.refreshToken,
        });

        const newRequest = new Request(request, {
          headers: new Headers(request.headers),
        });
        newRequest.headers.set('Authorization', `Bearer ${newToken.accessToken}`);
        newRequest.headers.set('X-Retry', 'true');

        return ky(newRequest, { ...options, retry: 0 });
      },
    ],
  },
});

export const api = new Api(httpClient);
