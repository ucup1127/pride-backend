import { z } from 'zod';

export const createRsvpSchema = z.object({
  undanganId: z.string().min(1),
  nama: z.string().min(2),
  kehadiran: z.enum(['hadir', 'tidak_hadir', 'ragu']),
  jumlah: z.coerce.number().int().min(1).max(20).optional().default(1),
  ucapan: z.string().max(500).optional(),
});