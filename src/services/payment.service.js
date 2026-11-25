import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { getPlan } from '../config/plans.js';
import { findActivePackageOrder } from './package-access.service.js';
import { sendWhatsappMessage } from './whatsapp.service.js';

const error = (message, status) => Object.assign(new Error(message), { status });
const PENDING_STATUSES = ['pending', 'review', 'underpaid', 'overpaid'];

function paymentInstructions(method) {
  if (method === 'bank_transfer') {
    return {
      method,
      provider: env.PAYMENT_BANK_NAME,
      accountNumber: env.PAYMENT_BANK_ACCOUNT_NUMBER,
      accountHolder: env.PAYMENT_BANK_ACCOUNT_HOLDER,
      isPlaceholder: env.PAYMENT_BANK_ACCOUNT_NUMBER === '0000000000',
    };
  }

  return {
    method,
    provider: env.PAYMENT_EWALLET_NAME,
    accountNumber: env.PAYMENT_EWALLET_NUMBER,
    accountHolder: env.PAYMENT_EWALLET_ACCOUNT_HOLDER,
  };
}

export function getPaymentOptions() {
  return [
    paymentInstructions('bank_transfer'),
    paymentInstructions('ewallet'),
  ].filter(Boolean);
}

function publicOrder(order) {
  return {
    id: order.id,
    plan: order.plan,
    amount: order.amount,
    paymentMethod: order.paymentMethod,
    contactPhone: order.contactPhone,
    status: order.status,
    expiresAt: order.expiresAt,
    transferAmount: order.transferAmount,
    transferSenderName: order.transferSenderName,
    transferReference: order.transferReference,
    transferDate: order.transferDate,
    refundAmount: order.refundAmount,
    adminFee: order.adminFee,
    reviewNote: order.reviewNote,
    paidAt: order.paidAt,
    reviewedAt: order.reviewedAt,
    reviewedBy: order.reviewedBy,
    createdAt: order.createdAt,
  };
}

export async function createOrder(userId, { plan: planId, paymentMethod, phone }) {
  const plan = getPlan(planId);
  if (!plan) throw error('Paket tidak dikenal', 400);

  const instructions = paymentInstructions(paymentMethod);

  const [activeOrder, unresolvedOrder] = await Promise.all([
    findActivePackageOrder(userId),
    prisma.order.findFirst({
      where: { userId, status: { in: PENDING_STATUSES } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  if (activeOrder) {
    throw error('Paket aktif sudah tersedia di akun ini. Hubungi admin untuk perubahan paket.', 409);
  }
  if (unresolvedOrder && unresolvedOrder.expiresAt > new Date()) {
    throw error('Selesaikan atau tunggu pesanan sebelumnya kedaluwarsa sebelum membuat pesanan baru.', 409);
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const order = await prisma.order.create({
    data: {
      userId,
      plan: plan.id,
      amount: plan.amount,
      paymentMethod,
      contactPhone: phone,
      status: 'pending',
      expiresAt,
    },
  });

  return { order: publicOrder(order), instructions };
}

export async function submitTransfer(userId, orderId, details) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw error('Pesanan tidak ditemukan', 404);
  if (order.userId !== userId) throw error('Akses ditolak', 403);
  if (order.status !== 'pending' && order.status !== 'expired') {
    throw error('Pesanan ini sudah dilaporkan atau telah diproses.', 409);
  }

  const transferDate = new Date(details.transferDate);
  if (Number.isNaN(transferDate.getTime())) throw error('Tanggal transfer tidak valid', 400);
  if (transferDate > new Date()) throw error('Tanggal transfer tidak boleh di masa depan', 400);
  if (order.expiresAt && transferDate > order.expiresAt) {
    throw error('Waktu transfer melewati batas 24 jam pesanan. Buat pesanan baru.', 400);
  }

  const status = details.amount < order.amount
    ? 'underpaid'
    : details.amount > order.amount
      ? 'overpaid'
      : 'review';

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      status,
      transferAmount: details.amount,
      transferSenderName: details.senderName,
      transferReference: details.reference,
      transferDate,
    },
  });

  return publicOrder(updated);
}

export async function getOrder(userId, orderId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw error('Pesanan tidak ditemukan', 404);
  if (order.userId !== userId) throw error('Akses ditolak', 403);

  if (order.status === 'pending' && (!order.expiresAt || order.expiresAt <= new Date())) {
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'expired' },
    });
    return {
      order: publicOrder(updated),
      instructions: paymentInstructions(updated.paymentMethod),
    };
  }
  return {
    order: publicOrder(order),
    instructions: paymentInstructions(order.paymentMethod),
  };
}

export async function getAccess(userId) {
  const order = await findActivePackageOrder(userId);
  if (!order) return { active: false, package: null, invitationCount: 0 };

  const plan = getPlan(order.plan);
  const invitationCount = order.publishedCount;
  return {
    active: true,
    package: {
      id: plan.id,
      name: plan.name,
      amount: plan.amount,
      invitationLimit: plan.invitationLimit,
      galleryLimit: plan.galleryLimit,
      expiresAt: order.expiresAt,
    },
    invitationCount,
    remainingInvitations: Math.max(0, plan.invitationLimit - invitationCount),
  };
}

export async function listAdminOrders({ status, search, page, pageSize }) {
  const where = status && status !== 'all' ? { status } : {};
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { contactPhone: { contains: search, mode: 'insensitive' } },
      {
        user: {
          is: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);
  return {
    orders: orders.map((order) => ({
      ...publicOrder(order),
      user: order.user,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getAdminSummary() {
  const now = new Date();
  const [
    totalOrders,
    pendingOrders,
    pendingReviews,
    paidOrders,
    activePackages,
    refundedOrders,
    users,
    revenue,
    refunds,
    groupedStatuses,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.count({ where: { status: { in: ['review', 'underpaid', 'overpaid'] } } }),
    prisma.order.count({ where: { status: 'paid' } }),
    prisma.order.count({
      where: {
        status: 'paid',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    }),
    prisma.order.count({ where: { status: 'refunded' } }),
    prisma.user.count(),
    prisma.order.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    prisma.order.aggregate({ where: { status: 'refunded' }, _sum: { refundAmount: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  const grossRevenue = revenue._sum.amount || 0;
  const refundTotal = refunds._sum.refundAmount || 0;

  return {
    totalOrders,
    pendingOrders,
    pendingReviews,
    paidOrders,
    activePackages,
    refundedOrders,
    users,
    grossRevenue,
    refundTotal,
    netRevenue: grossRevenue - refundTotal,
    statusCounts: Object.fromEntries(
      groupedStatuses.map((item) => [item.status, item._count._all]),
    ),
  };
}

export async function approveOrder(orderId, adminId) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw error('Pesanan tidak ditemukan', 404);
  if (order.status !== 'review' || order.transferAmount !== order.amount) {
    throw error('Hanya transfer dengan nominal tepat yang dapat disetujui.', 409);
  }

  const approval = await prisma.order.updateMany({
    where: { id: orderId, status: 'review', transferAmount: order.amount },
    data: {
      status: 'paid',
      paidAt: new Date(),
      reviewedAt: new Date(),
      reviewedBy: adminId,
      expiresAt: null,
    },
  });
  if (approval.count !== 1) throw error('Pesanan sudah diproses admin lain.', 409);
  const updated = await prisma.order.findUnique({ where: { id: orderId } });

  if (updated.contactPhone) {
    await sendWhatsappMessage(
      updated.contactPhone,
      `Pembayaran Pride untuk paket ${getPlan(updated.plan).name} telah diverifikasi. Paket aktif. Buka dashboard: ${env.CORS_ORIGIN.replace(/\/+$/, '')}/dashboard`,
    );
  }
  return publicOrder(updated);
}

export async function refundOrder(orderId, adminId, { refundAmount, adminFee, note }) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw error('Pesanan tidak ditemukan', 404);
  if (!['review', 'underpaid', 'overpaid'].includes(order.status) || order.transferAmount === null) {
    throw error('Refund hanya dapat dicatat untuk transfer yang sedang ditinjau.', 409);
  }
  if (refundAmount + adminFee !== order.transferAmount) {
    throw error('Nominal refund dan biaya admin harus sama dengan jumlah transfer yang diterima.', 400);
  }

  const refund = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: order.status,
      transferAmount: order.transferAmount,
    },
    data: {
      status: 'refunded',
      refundAmount,
      adminFee,
      reviewNote: note,
      reviewedAt: new Date(),
      reviewedBy: adminId,
    },
  });
  if (refund.count !== 1) throw error('Pesanan sudah diproses admin lain.', 409);
  const updated = await prisma.order.findUnique({ where: { id: orderId } });

  if (updated.contactPhone) {
    await sendWhatsappMessage(
      updated.contactPhone,
      `Pembayaran Pride untuk pesanan ${updated.id} belum dapat diproses. Paket tidak diaktifkan. Refund yang dicatat admin: Rp${refundAmount.toLocaleString('id-ID')}; biaya admin: Rp${adminFee.toLocaleString('id-ID')}. Catatan: ${note}`,
    );
  }
  return publicOrder(updated);
}

