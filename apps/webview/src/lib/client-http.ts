'use client';

import { Api } from '@ssr-webview-jwt/api';
import ky from 'ky';

import { CLIENT_BASE_URL } from '@/constants/url';

import { bridge } from '../providers/bridge-provider';

let refreshPromise: Promise<string> | null = null;

export const clientHttp = ky.create({
  prefixUrl: CLIENT_BASE_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (typeof window === 'undefined') return;

        const token = await bridge.getAccessToken();
        if (!request.headers.get('Authorization') && token?.accessToken) {
          request.headers.set('Authorization', `Bearer ${token.accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (typeof window === 'undefined') return;

        if (response.status !== 401) {
          return response;
        }

        if (!refreshPromise) {
          refreshPromise = bridge
            .refreshToken()
            .then(async (refreshedToken) => {
              if (!refreshedToken) {
                throw new Error('Failed to refresh token');
              }
              return refreshedToken.accessToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
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

export const clientAPI = new Api(clientHttp);
