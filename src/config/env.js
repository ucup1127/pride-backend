import 'dotenv/config';
import { z } from 'zod';

const paymentSetting = (fallback) =>
  z.string().default(fallback).transform((value) => value.trim() || fallback);

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GOOGLE_CLIENT_ID: z.string().optional().default(''),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  WHATSAPP_PROVIDER: z.enum(['console', 'custom']).default('console'),
  WHATSAPP_API_URL: z.string().optional().default(''),
  WHATSAPP_API_KEY: z.string().optional().default(''),
  WHATSAPP_SENDER: z.string().optional().default(''),
  OTP_TTL_MINUTES: z.coerce.number().default(5),
  XENDIT_SECRET_KEY: z.string().optional().default(''),
  XENDIT_WEBHOOK_TOKEN: z.string().optional().default(''),
  // The bank number remains a visibly marked dummy until an active account is provided.
  PAYMENT_BANK_NAME: paymentSetting('SeaBank'),
  PAYMENT_BANK_ACCOUNT_NUMBER: paymentSetting('0000000000'),
  PAYMENT_BANK_ACCOUNT_HOLDER: paymentSetting('Luthfi Yusuf'),
  PAYMENT_EWALLET_NAME: paymentSetting('DANA'),
  PAYMENT_EWALLET_NUMBER: paymentSetting('081225367526'),
  PAYMENT_EWALLET_ACCOUNT_HOLDER: paymentSetting('Luthfi Yusuf'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('ENV tidak valid:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = parsed.data;