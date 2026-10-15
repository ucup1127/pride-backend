import { z } from 'zod';

const phoneSchema = z.string().regex(/^8\d{8,12}$/, 'Nomor tidak valid (contoh: 81234567890)');

export const sendOtpSchema = z.object({ phone: phoneSchema });

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6).regex(/^\d+$/, 'Kode harus 6 digit'),
  plan: z.string().optional(),
  template: z.string().optional(),
});