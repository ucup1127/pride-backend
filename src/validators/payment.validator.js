import { z } from 'zod';

export const createManualOrderSchema = z.object({
  plan: z.enum(['basic', 'premium', 'exclusive']),
  paymentMethod: z.enum(['bank_transfer', 'ewallet']),
  phone: z.string().regex(/^(?:\+?62|0)?8\d{8,12}$/, 'Masukkan nomor WhatsApp Indonesia yang valid'),
});

export const submitTransferSchema = z.object({
  amount: z.coerce.number().int().positive(),
  senderName: z.string().min(2).max(120),
  reference: z.string().min(3).max(120),
  transferDate: z.string().datetime(),
});

export const refundSchema = z.object({
  refundAmount: z.coerce.number().int().nonnegative(),
  adminFee: z.coerce.number().int().nonnegative(),
  note: z.string().min(3).max(500),
});

