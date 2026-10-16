import { z } from 'zod';

export const createGuestSchema = z.object({
  undanganId: z.string().min(1),
  nama: z.string().min(2),
  kategori: z.enum(['keluarga', 'teman', 'kerja', 'vip', 'lainnya']).optional(),
  telepon: z.string().regex(/^8\d{8,12}$/, 'Nomor tidak valid (contoh: 81234567890)').optional(),
  jumlah: z.coerce.number().int().min(1).max(20).optional().default(1),
  catatan: z.string().max(300).optional(),
});

export const updateGuestSchema = createGuestSchema.partial().omit({ undanganId: true });

export const bulkGuestSchema = z.object({
  undanganId: z.string().min(1),
  guests: z.array(
    z.object({
      nama: z.string().min(2),
      kategori: z.enum(['keluarga', 'teman', 'kerja', 'vip', 'lainnya']).optional(),
      telepon: z.string().regex(/^8\d{8,12}$/).optional(),
      jumlah: z.coerce.number().int().min(1).max(20).optional().default(1),
    }),
  ).min(1).max(200),
});

export const rsvpBySlugSchema = z.object({
  slug: z.string().min(1),
  kehadiran: z.enum(['hadir', 'tidak_hadir', 'ragu']),
  jumlah: z.coerce.number().int().min(1).max(20).optional().default(1),
  ucapan: z.string().max(500).optional(),
});