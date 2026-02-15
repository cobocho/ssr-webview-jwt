import { Hono } from 'hono';
import { cors } from 'hono/cors';

import auth from './routes/auth';

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

export default app;
