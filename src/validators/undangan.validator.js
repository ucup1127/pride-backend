import { z } from 'zod';

const base = {
  judul: z.string().min(2),
  templateId: z.string().min(1),
  data: z.record(z.any()).optional(),
  status: z.enum(['draft', 'published']).optional(),
};

export const createUndanganSchema = z.object(base);
export const updateUndanganSchema = z.object(base).partial();