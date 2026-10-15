import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import app, { initializeServices } from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);

async function start() {
  await initializeServices();
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use((await import('express')).default.static(path.join(root, 'dist')));
    app.use((req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      return res.sendFile(path.join(root, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }
  app.listen(port, '0.0.0.0', () => console.log(`IPL Bookings listening on http://0.0.0.0:${port}`));
}

start().catch((error) => { console.error(error); process.exit(1); });
