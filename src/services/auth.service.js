import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { sendWhatsappMessage } from './whatsapp.service.js';

const err = (msg, status) => Object.assign(new Error(msg), { status });

export async function sendOtp(phone) {
  await prisma.otpCode.deleteMany({ where: { phone, used: false } });
  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = new Date(Date.now() + env.OTP_TTL_MINUTES * 60 * 1000);
  await prisma.otpCode.create({ data: { phone, code, expiresAt } });
 const pesan = `*PRIDE STUDIO*\n\nKode verifikasi kamu adalah:\n\n*${code}*\n\nKode ini berlaku selama ${env.OTP_TTL_MINUTES} menit. JANGAN berikan kode ini kepada siapa pun.`;
await sendWhatsappMessage(phone, pesan);
  return { phone, expiresInMinutes: env.OTP_TTL_MINUTES };
}

export async function verifyOtp(phone, code, { plan, template } = {}) {
  const otp = await prisma.otpCode.findFirst({
    where: { phone, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!otp) throw err('Kode salah atau sudah kadaluarsa', 400);

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone, name: 'User ' + phone.slice(-4) },
    select: { id: true, phone: true, name: true, role: true, createdAt: true },
  });

  if (plan || template) {
    await prisma.order.create({
      data: { userId: user.id, plan: plan ?? null, templateId: template ?? null, status: 'pending' },
    });
  }

  const token = jwt.sign(
    { sub: user.id, phone: user.phone, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
  return { token, user, phone };
}

export async function getProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, phone: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw err('User tidak ditemukan', 404);
  return user;
}