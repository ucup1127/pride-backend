import { prisma } from '../config/database.js';
import { uniqueSlug } from '../utils/slug.js';

const err = (msg, status) => Object.assign(new Error(msg), { status });

/** Pastikan undangan milik user ini */
async function ensureOwnership(undanganId, userId) {
  const u = await prisma.undangan.findUnique({ where: { id: undanganId } });
  if (!u) throw err('Undangan tidak ditemukan', 404);
  if (u.userId !== userId) throw err('Akses ditolak', 403);
  return u;
}

/** List semua tamu untuk satu undangan */
export async function list(userId, undanganId) {
  await ensureOwnership(undanganId, userId);
  return prisma.guest.findMany({
    where: { undanganId },
    orderBy: [{ kategori: 'asc' }, { nama: 'asc' }],
  });
}

/** Detail tamu berdasarkan slug (publik) */
export async function findBySlug(slug) {
  const guest = await prisma.guest.findUnique({
    where: { slug },
    include: {
      undangan: {
        include: { template: true },
      },
    },
  });
  if (!guest) throw err('Tamu tidak ditemukan', 404);
  if (!guest.undangan.isPublic) throw err('Undangan belum dipublikasikan', 403);
  return guest;
}

/** Tambah tamu baru */
export async function create(userId, data) {
  await ensureOwnership(data.undanganId, userId);
  const slug = uniqueSlug(data.nama);
  return prisma.guest.create({
    data: { ...data, slug },
  });
}

/** Tambah banyak tamu sekaligus (bulk) */
export async function bulkCreate(userId, undanganId, guests) {
  await ensureOwnership(undanganId, userId);

  const data = guests.map((g) => ({
    ...g,
    undanganId,
    slug: uniqueSlug(g.nama),
  }));

  const result = await prisma.guest.createMany({ data });
  return { count: result.count };
}

/** Update tamu */
export async function update(userId, id, data) {
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) throw err('Tamu tidak ditemukan', 404);
  await ensureOwnership(guest.undanganId, userId);
  return prisma.guest.update({ where: { id }, data });
}

/** Hapus tamu */
export async function remove(userId, id) {
  const guest = await prisma.guest.findUnique({ where: { id } });
  if (!guest) throw err('Tamu tidak ditemukan', 404);
  await ensureOwnership(guest.undanganId, userId);
  return prisma.guest.delete({ where: { id } });
}

/** Statistik tamu per undangan */
export async function stats(userId, undanganId) {
  await ensureOwnership(undanganId, userId);
  const [total, hadir, tidakHadir, ragu, pending] = await Promise.all([
    prisma.guest.count({ where: { undanganId } }),
    prisma.guest.count({ where: { undanganId, status: 'hadir' } }),
    prisma.guest.count({ where: { undanganId, status: 'tidak_hadir' } }),
    prisma.guest.count({ where: { undanganId, status: 'ragu' } }),
    prisma.guest.count({ where: { undanganId, status: 'pending' } }),
  ]);
  return { total, hadir, tidakHadir, ragu, pending };
}

/** RSVP publik lewat slug tamu */
export async function rsvpBySlug({ slug, kehadiran, jumlah, ucapan }) {
  const guest = await prisma.guest.findUnique({ where: { slug } });
  if (!guest) throw err('Tamu tidak ditemukan', 404);

  const updated = await prisma.guest.update({
    where: { id: guest.id },
    data: { status: kehadiran, jumlah: jumlah ?? guest.jumlah },
  });

  if (ucapan) {
    await prisma.rsvp.create({
      data: {
        undanganId: guest.undanganId,
        nama: guest.nama,
        kehadiran,
        jumlah: jumlah ?? guest.jumlah,
        ucapan,
      },
    });
  }

  return updated;
}