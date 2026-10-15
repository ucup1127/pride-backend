import app from './app.js';
import { env } from './config/env.js';
import { info } from './utils/logger.js';

// Vercel serverless: export app sebagai handler
export default app;

// Lokal: jalankan listen (Vercel ignore bagian ini)
if (process.env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    info('Server jalan di http://localhost:' + env.PORT);
    info('   Mode: ' + env.NODE_ENV);
  });
}