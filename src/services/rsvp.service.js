import { prisma } from '../config/database.js';

const err = (message, status) => Object.assign(new Error(message), { status });

async function ensurePublicInvitation(undanganId) {
  const undangan = await prisma.undangan.findUnique({ where: { id: undanganId } });
  if (!undangan) throw err('Undangan tidak ditemukan', 404);
  if (!undangan.isPublic || undangan.status !== 'published') {
    throw err('Undangan belum dipublikasikan.', 403);
  }
  if (undangan.expiresAt && undangan.expiresAt <= new Date()) {
    throw err('Masa aktif undangan telah berakhir.', 410);
  }
}

export async function list(undanganId) {
  await ensurePublicInvitation(undanganId);
  return prisma.rsvp.findMany({ where: { undanganId }, orderBy: { createdAt: 'desc' } });
}

export async function create(data) {
  await ensurePublicInvitation(data.undanganId);
  return prisma.rsvp.create({ data });
}