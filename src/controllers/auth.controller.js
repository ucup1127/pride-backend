import * as authService from '../services/auth.service.js';
import { ok } from '../utils/response.js';

export async function sendOtp(req, res, next) {
  try {
    const result = await authService.sendOtp(req.body.phone);
    return ok(res, result, 'Kode verifikasi dikirim');
  } catch (e) { next(e); }
}

export async function verifyOtp(req, res, next) {
  try {
    const { phone, code, plan, template } = req.body;
    const result = await authService.verifyOtp(phone, code, { plan, template });
    return ok(res, result, 'Login berhasil');
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try { return ok(res, await authService.getProfile(req.user.sub)); }
  catch (e) { next(e); }
}