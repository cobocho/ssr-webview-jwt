import { Hono } from 'hono';

import { POSTS, USERS } from '../data/seed';
import { authMiddleware } from '../middleware/auth';

const posts = new Hono();

posts.use('*', authMiddleware);

// GET /posts?page=1&limit=20&userId=user-1
posts.get('/', async (c) => {
  const page = Math.max(1, Number(c.req.query('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(c.req.query('limit') ?? '20')));
  const userIdFilter = c.req.query('userId');
  const offset = (page - 1) * limit;

  const filtered = userIdFilter ? POSTS.filter((p) => p.userId === userIdFilter) : POSTS;

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const items = filtered.slice(offset, offset + limit).map((post) => {
    const author = USERS.find((u) => u.id === post.userId);
    return {
      ...post,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
    };
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

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

// GET /posts/:post_id
posts.get('/:post_id', async (c) => {
  const postId = c.req.param('post_id');
  const post = POSTS.find((p) => p.id === postId);

  if (!post) {
    return c.json({ message: 'Post not found' }, 404);
  }

  const author = USERS.find((u) => u.id === post.userId);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  return c.json({
    data: {
      ...post,
      author: author ? { id: author.id, name: author.name, avatar: author.avatar } : null,
    },
  });
});

export default posts;
