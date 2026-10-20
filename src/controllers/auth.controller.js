import * as authService from '../services/auth.service.js';
import { ok, created } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return created(res, result, 'Registrasi berhasil');
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return ok(res, result, 'Login berhasil');
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try { return ok(res, await authService.getProfile(req.user.sub)); }
  catch (e) { next(e); }
}