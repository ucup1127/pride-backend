import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

const app = express();
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const isLocalDevelopmentOrigin =
      env.NODE_ENV !== 'production'
      && /^http:\/\/(?:localhost|127\.0\.0\.1):\d+$/.test(origin || '');
    if (!origin || origin === env.CORS_ORIGIN || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} tidak diizinkan oleh CORS.`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);
export default app;