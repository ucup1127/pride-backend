import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { fail } from '../utils/response.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 401, 'Token tidak ada');
  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    return fail(res, 401, 'Token tidak valid / kadaluarsa');
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return fail(res, 403, 'Akses ditolak');
    next();
  };
}