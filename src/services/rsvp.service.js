import { prisma } from '../config/database.js';

export const list = (undanganId) =>
  prisma.rsvp.findMany({ where: { undanganId }, orderBy: { createdAt: 'desc' } });

export const create = (data) => prisma.rsvp.create({ data });