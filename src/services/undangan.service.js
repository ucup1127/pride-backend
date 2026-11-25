import { prisma } from '../config/database.js';
import { uniqueSlug } from '../utils/slug.js'; // <-- Tambahin import ini
import { getPlan } from '../config/plans.js';
import { findActivePackageOrder } from './package-access.service.js';

const err = (m, s) => Object.assign(new Error(m), { status: s });

async function activeOrderForUser(userId) {
  const order = await findActivePackageOrder(userId);
  if (!order) throw err('Paket aktif tidak ditemukan. Selesaikan pembayaran untuk melanjutkan.', 403);
  return order;
}

export const list = (userId) =>
  prisma.undangan.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });

export async function detail(id, userId) {
  const item = await prisma.undangan.findUnique({ where: { id } });
  if (!item) throw err('Undangan tidak ditemukan', 404);
  if (item.userId !== userId) throw err('Akses ditolak', 403);
  return item;
}

export async function create(userId, data) {
  const order = await activeOrderForUser(userId);
  const plan = getPlan(order.plan);
  if (!plan || order.publishedCount >= plan.invitationLimit) {
    throw err('Kuota undangan pada paket ini sudah habis.', 403);
  }

  const slug = data.slug || uniqueSlug(data.judul || 'undangan');
  
  return prisma.undangan.create({
    data: { 
      judul: data.judul,
      templateId: data.templateId,
      slug: slug,
      orderId: order.id,
      isPublic: false, // <-- PASTIKAN FALSE (Belum Publik)
      status: 'draft', // <-- PASTIKAN DRAFT (Belum Bayar)
      data: data.data || {},
      userId,
    },
  });
}

export async function update(id, userId, data) {
  const item = await detail(id, userId);
  if (!item.orderId) throw err('Undangan ini belum memiliki paket aktif.', 403);
  const order = await activeOrderForUser(userId);
  if (order.id !== item.orderId) throw err('Paket aktif tidak sesuai dengan undangan ini.', 403);
  return prisma.undangan.update({ where: { id }, data });
}

export async function publish(id, userId) {
  return prisma.$transaction(async (tx) => {
    const item = await tx.undangan.findUnique({ where: { id } });
    if (!item) throw err('Undangan tidak ditemukan', 404);
    if (item.userId !== userId) throw err('Akses ditolak', 403);
    if (!item.orderId) throw err('Undangan ini belum memiliki paket aktif.', 403);

    const order = await tx.order.findUnique({ where: { id: item.orderId } });
    if (!order || order.userId !== userId || order.status !== 'paid') {
      throw err('Paket aktif tidak ditemukan. Selesaikan pembayaran untuk melanjutkan.', 403);
    }

    const plan = getPlan(order.plan);
    if (!plan || (order.expiresAt && order.expiresAt <= new Date())) {
      throw err('Masa aktif paket sudah berakhir.', 403);
    }

    let orderExpiry = order.expiresAt;
    if (item.status !== 'published') {
      const now = new Date();
      const nextExpiry = plan.durationDays
        ? new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
        : null;
      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          status: 'paid',
          publishedCount: { lt: plan.invitationLimit },
          OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        data: {
          publishedCount: { increment: 1 },
          ...(plan.durationDays && !order.expiresAt ? { expiresAt: nextExpiry } : {}),
        },
      });
      if (updated.count !== 1) throw err('Kuota undangan pada paket ini sudah habis.', 403);
      if (!orderExpiry && plan.durationDays) orderExpiry = nextExpiry;
    }

    return tx.undangan.update({
      where: { id },
      data: {
        status: 'published',
        isPublic: true,
        publishedAt: item.publishedAt || new Date(),
        expiresAt: orderExpiry,
      },
    });
  });
}

export async function remove(id, userId) {
  await detail(id, userId);
  return prisma.undangan.delete({ where: { id } });
}