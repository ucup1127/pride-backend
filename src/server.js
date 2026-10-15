import app from './app.js';
import { env } from './config/env.js';
import { info } from './utils/logger.js';

app.listen(env.PORT, () => {
  info('Server jalan di http://localhost:' + env.PORT);
  info('   Mode: ' + env.NODE_ENV);
});