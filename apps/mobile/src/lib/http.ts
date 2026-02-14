import type { JWTPayload } from '@ssr-webview-jwt/api';
import { Api } from '@ssr-webview-jwt/api';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import ky from 'ky';

import { BASE_URL } from '../constants/url';
import { appBridge } from './bridge';

let refreshPromise: Promise<string> | null = null;

export const getRefreshToken = async () => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');

  if (!refreshToken) return null;

  const response = await ky
    .post(`${BASE_URL}/refresh`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
      retry: 0,
    })
    .json<{ accessToken: string; refreshToken: string }>();

  const decodedAccessToken = jwtDecode<JWTPayload>(response.accessToken);
  const decodedRefreshToken = jwtDecode<JWTPayload>(response.refreshToken);

  console.log({
    accessToken: response.accessToken,
    accessTokenExpiresAt: decodedAccessToken.exp,
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: decodedRefreshToken.exp,
  });

  return {
    accessToken: response.accessToken,
    accessTokenExpiresAt: decodedAccessToken.exp,
    refreshToken: response.refreshToken,
    refreshTokenExpiresAt: decodedRefreshToken.exp,
  };
};

export const httpClient = ky.create({
  prefixUrl: BASE_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await appBridge.getState().getAccessToken();

        if (!token) {
          return;
        }

        request.headers.set('Authorization', `Bearer ${token.accessToken}`);
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status !== 401) {
          return response;
        }

        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (!refreshToken) return response;

        if (!refreshPromise) {
          const newToken = await getRefreshToken();

          if (!newToken) return response;

          appBridge.setState({
            token: {
              accessToken: newToken.accessToken,
              refreshToken: newToken.refreshToken,
              accessTokenExpiresAt: newToken.accessTokenExpiresAt,
              refreshTokenExpiresAt: newToken.refreshTokenExpiresAt,
            },
          });
          refreshPromise = Promise.resolve(newToken.accessToken);
        }

        const newAccessToken = await refreshPromise;

        const newRequest = new Request(request, {
          headers: new Headers(request.headers),
        });
        newRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);

        return ky(newRequest, { ...options, retry: 0 });
      },
    ],
  },
});

export const api = new Api(httpClient);
