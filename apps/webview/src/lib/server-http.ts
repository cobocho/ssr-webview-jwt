import { Api } from '@ssr-webview-jwt/api';
import ky from 'ky-universal';
import { cookies } from 'next/headers';

import { BASE_URL } from '@/constants/url';

export const serverHttp = ky.create({
  prefixUrl: BASE_URL,
  hooks: {
    beforeRequest: [
      async (request) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (!request.headers.get('Authorization') && accessToken?.value) {
          request.headers.set('Authorization', `Bearer ${accessToken.value}`);
        }
      },
    ],
  },
});

export const serverAPI = new Api(serverHttp);
