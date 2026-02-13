import { serve } from '@hono/node-server';

import app from './app';

serve(
  {
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8787,
  },
  (info) => {
    console.log(`Server is running on port http://localhost:${info.port}`);
  },
);
