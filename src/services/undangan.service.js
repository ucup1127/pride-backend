import { prisma } from '../config/database.js';
import { uniqueSlug } from '../utils/slug.js'; // <-- Tambahin import ini

const err = (m, s) => Object.assign(new Error(m), { status: s });

export const list = (userId) =>
  prisma.undangan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export async function detail(id, userId) {
  const item = await prisma.undangan.findUnique({ where: { id } });
  if (!item) throw err('Undangan tidak ditemukan', 404);
  if (item.userId !== userId) throw err('Akses ditolak', 403);
  return item;
}

export async function create(userId, data) {
  const slug = data.slug || uniqueSlug(data.judul || 'undangan');
  
  return prisma.undangan.create({
    data: { 
      judul: data.judul,
      templateId: data.templateId,
      slug: slug,
      isPublic: data.isPublic ?? true,
      status: data.status || 'draft',
      data: data.data || {}, // <-- INI PENTING: Simpan data form (nama, tanggal, lokasi)
      userId,
    },
  });
}

export async function update(id, userId, data) {
  await detail(id, userId);
  return prisma.undangan.update({ where: { id }, data });
}

export async function remove(id, userId) {
  await detail(id, userId);
  return prisma.undangan.delete({ where: { id } });
}