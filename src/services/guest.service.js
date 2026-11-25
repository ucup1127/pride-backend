import { prisma } from '../config/database.js';
import { uniqueSlug } from '../utils/slug.js';

const err = (msg, status) => Object.assign(new Error(msg), { status });

function ensureInvitationAvailable(undangan) {
  if (!undangan.isPublic || undangan.status !== 'published') {
    throw err('Undangan ini masih dalam status DRAFT.', 403);
  }
  if (undangan.expiresAt && undangan.expiresAt <= new Date()) {
    throw err('Masa aktif undangan telah berakhir.', 410);
  }
}

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
  // 1. Coba cari di tabel Guest (link personal tamu)
  const guest = await prisma.guest.findUnique({
    where: { slug },
    include: {
      undangan: {
        include: { template: true },
      },
    },
  });

  if (guest) {
    ensureInvitationAvailable(guest.undangan);
    return guest;
  }

  // 2. Kalau gak ketemu di Guest, coba cari di tabel Undangan (link utama)
  const undangan = await prisma.undangan.findUnique({
    where: { slug },
    include: { template: true },
  });

  if (undangan) {
    ensureInvitationAvailable(undangan);

    // Kembalikan format yang mirip Guest, biar frontend gak bingung
    return {
      nama: '[Nama Tamu]', // Default kalau buka link utama
      undanganId: undangan.id,
      undangan: undangan,
    };
  }

  // 3. Kalau dua-duanya gak ketemu
  throw err('Undangan atau Tamu tidak ditemukan', 404);
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

  // Siapin data tamu dengan slug unik
  const data = guests.map((g) => ({
    undanganId,
    nama: g.nama,
    kategori: g.kategori,
    telepon: g.telepon,
    jumlah: Number(g.jumlah) || 1,
    slug: uniqueSlug(g.nama), // otomatis bikin slug dari nama
    status: 'pending',
  }));

  // Simpan ke database
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
  const guest = await prisma.guest.findUnique({
    where: { slug },
    include: { undangan: true },
  });
  if (!guest) throw err('Tamu tidak ditemukan', 404);
  ensureInvitationAvailable(guest.undangan);

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