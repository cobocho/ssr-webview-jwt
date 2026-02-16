import { Hono } from 'hono';
import { cors } from 'hono/cors';

import auth from './routes/auth';
import posts from './routes/posts';
import users from './routes/users';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: '*',
    credentials: true,
    allowHeaders: ['Authorization', 'Content-Type'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.get('/health', (c) => c.json({ status: 'ok' }));

app.route('/', auth);
app.route('/users', users);
app.route('/posts', posts);

export default app;
