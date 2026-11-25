import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

const err = (msg, status) => Object.assign(new Error(msg), { status });
const googleClient = new OAuth2Client();

function createSession(user) {
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

export async function register({ email, password, name }) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw err('Email sudah terdaftar', 400);

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, password: hash, name },
    select: { id: true, email: true, name: true, role: true },
  });
  return createSession(user);
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw err('Email atau password salah', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw err('Email atau password salah', 401);

  return createSession(user);
}

export async function googleLogin(credential) {
  if (!env.GOOGLE_CLIENT_ID) throw err('Login Google belum dikonfigurasi', 503);

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
  } catch (verificationError) {
    if (verificationError.response || verificationError.code) throw verificationError;
    throw err('Token Google tidak valid atau sudah kedaluwarsa', 401);
  }

  const profile = ticket.getPayload();
  if (!profile?.email || profile.email_verified !== true) {
    throw err('Akun Google harus memiliki email terverifikasi', 401);
  }

  const email = profile.email.toLowerCase();
  const password = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      name: profile.name || null,
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return createSession(user);
}

export async function getProfile(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });
  if (!user) throw err('User tidak ditemukan', 404);
  return user;
}