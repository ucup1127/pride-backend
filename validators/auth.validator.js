import { z } from 'zod';

// Nomor disimpan tanpa awalan (contoh: 81234567890)
// Kita longgarin dikit, asal angkanya ada 9-13 digit
const phoneSchema = z.string().min(9, 'Nomor terlalu pendek').max(15, 'Nomor terlalu panjang');

export const sendOtpSchema = z.object({ phone: phoneSchema });

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'Kode harus 6 digit'),
  plan: z.string().optional().nullable(),
  template: z.string().optional().nullable(),
});