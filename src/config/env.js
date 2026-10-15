import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  WHATSAPP_PROVIDER: z.enum(['console', 'custom']).default('console'),
  WHATSAPP_API_URL: z.string().optional().default(''),
  WHATSAPP_API_KEY: z.string().optional().default(''),
  WHATSAPP_SENDER: z.string().optional().default(''),
  OTP_TTL_MINUTES: z.coerce.number().default(5),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('ENV tidak valid:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;