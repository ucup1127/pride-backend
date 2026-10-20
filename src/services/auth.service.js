import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

const err = (msg, status) => Object.assign(new Error(msg), { status });

export async function register({ email, password, name }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw err('Email sudah terdaftar', 400);

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, name },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw err('Email atau password salah', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw err('Email atau password salah', 401);

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}

export async function getProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw err('User tidak ditemukan', 404);
  return user;
}