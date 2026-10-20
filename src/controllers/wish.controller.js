import * as wishService from '../services/wish.service.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    return ok(res, await wishService.list(req.params.undanganId));
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const wish = await wishService.create(req.body);
    return created(res, wish, 'Ucapan terkirim');
  } catch (e) { next(e); }
}