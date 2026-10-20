import { prisma } from '../config/database.js';

export const list = (undanganId) => {
  return prisma.wish.findMany({
    where: { undanganId },
    orderBy: { createdAt: 'desc' },
  });
};

export const create = (data) => {
  return prisma.wish.create({ data });
};