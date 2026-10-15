import { prisma } from '../config/database.js';

export const list = ({ category } = {}) =>
  prisma.template.findMany({
    where: category && category !== 'Semua' ? { category } : undefined,
    orderBy: [{ tag: 'asc' }, { name: 'asc' }],
  });

export async function detail(id) {
  const t = await prisma.template.findUnique({ where: { id } });
  if (!t) throw Object.assign(new Error('Template tidak ditemukan'), { status: 404 });
  return t;
}