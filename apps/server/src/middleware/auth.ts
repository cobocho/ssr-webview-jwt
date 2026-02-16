import { createMiddleware } from 'hono/factory';

import { verifyAccessToken } from '../lib/jwt';

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ message: 'Authorization header missing' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyAccessToken(token);
    c.set('userId', payload.sub);
    await next();
  } catch (error) {
    console.log('error', error);
    return c.json({ message: 'Invalid or expired access token' }, 401);
  }
});
