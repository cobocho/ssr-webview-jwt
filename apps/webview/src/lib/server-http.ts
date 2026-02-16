import { Api } from '@ssr-webview-jwt/api';
import ky from 'ky-universal';
import { cookies } from 'next/headers';

import { SERVER_BASE_URL } from '@/constants/url';

import {
  ApiError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from './error';

export const serverHttp = ky.create({
  prefixUrl: SERVER_BASE_URL,
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      async (request) => {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken');

        if (accessToken?.value) {
          request.headers.set('Authorization', `Bearer ${accessToken.value}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status >= 400) {
          const res = (await response.json()) as { message: string };
          switch (response.status) {
            case 400:
              throw new BadRequestError(res.message);
            case 401:
              throw new UnauthorizedError(res.message);
            case 403:
              throw new ForbiddenError(res.message);
            case 500:
              throw new InternalServerError(res.message);
            default:
              throw new ApiError(res.message);
          }
        }
        return response;
      },
    ],
  },
});

export const serverAPI = new Api(serverHttp);
