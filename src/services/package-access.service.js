import { prisma } from '../config/database.js';

export async function findActivePackageOrder(userId) {
  return prisma.order.findFirst({
    where: {
      userId,
      status: 'paid',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { paidAt: 'desc' },
  });
}
