import * as SecureStore from 'expo-secure-store';
import ky from 'ky';

import { BASE_URL } from '../constants/url';
import { appBridge } from './bridge';

let refreshPromise: Promise<string> | null = null;

export const getRefreshToken = async () => {
  const refreshToken = await SecureStore.getItemAsync('refreshToken');

  if (!refreshToken) return null;

  const response = await ky
    .post(`${BASE_URL}/auth/refresh`, {
      headers: { Authorization: `Bearer ${refreshToken}` },
      retry: 0,
    })
    .json<{ accessToken: string; refreshToken: string }>();

  return response;
};

export const api = ky.create({
  prefixUrl: BASE_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const token = await appBridge.getState().getToken();

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
            token: newToken,
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
