import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';

import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../lib/jwt';

const auth = new Hono();

const DUMMY_USERS: Record<string, { password: string }> = {
  'user@example.com': { password: '1234' },
};

function buildTokenResponse(accessToken: string, refreshToken: string) {
  const now = Math.floor(Date.now() / 1000);

  return {
    accessToken,
    accessTokenExpiresIn: now + ACCESS_TOKEN_EXPIRES_IN,
    refreshToken,
    refreshTokenExpiresIn: now + REFRESH_TOKEN_EXPIRES_IN,
  };
}

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();

  const user = DUMMY_USERS[body.email];

  if (!user || user.password !== body.password) {
    return c.json({ message: 'Invalid credentials' }, 401);
  }

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(body.email),
    signRefreshToken(body.email),
  ]);

  c.header(
    'Set-Cookie',
    `refresh-token=${refreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRES_IN}; SameSite=Strict`,
  );

  return c.json(buildTokenResponse(accessToken, refreshToken));
});

auth.post('/refresh', async (c) => {
  const authHeader = c.req.header('Authorization');
  let token: string | undefined;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    token = getCookie(c, 'refresh-token');
  }

  if (!token) {
    return c.json({ message: 'Refresh token not found' }, 401);
  }

  try {
    const payload = await verifyRefreshToken(token);
    const sub = payload.sub;

    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken(sub),
      signRefreshToken(sub),
    ]);

    c.header(
      'Set-Cookie',
      `refresh-token=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRES_IN}; SameSite=Strict`,
    );

    return c.json(buildTokenResponse(newAccessToken, newRefreshToken));
  } catch {
    return c.json({ message: 'Invalid or expired refresh token' }, 401);
  }
});

auth.get('/public', (c) => {
  return c.json({ message: 'This is a public endpoint. No auth required.' });
});

auth.get('/protected', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: 'Authorization header missing' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyAccessToken(token);
    return c.json({ message: 'Access granted', user: payload.sub });
  } catch {
    return c.json({ message: 'Invalid or expired access token' }, 401);
  }
});

export default auth;
