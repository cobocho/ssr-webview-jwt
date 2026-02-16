import { Hono } from 'hono';

import { POSTS, USERS } from '../data/seed';
import { authMiddleware } from '../middleware/auth';

const users = new Hono();

users.use('*', authMiddleware);

// GET /users?page=1&limit=10
users.get('/', (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? '10')));
  const offset = (page - 1) * limit;

  const total = USERS.length;
  const totalPages = Math.ceil(total / limit);
  const items = USERS.slice(offset, offset + limit).map(({ password: _, ...user }) => user);

  return c.json({
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
});

// GET /users/:user_id
users.get('/:user_id', async (c) => {
  const userId = c.req.param('user_id');
  const user = USERS.find((u) => u.id === userId);

  if (!user) {
    return c.json({ message: 'User not found' }, 404);
  }

  const { password: _, ...safeUser } = user;

  const postCount = POSTS.filter((p) => p.userId === userId).length;

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return c.json({ data: { ...safeUser, postCount } });
});

export default users;
