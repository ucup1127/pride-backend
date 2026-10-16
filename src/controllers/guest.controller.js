import * as guestService from '../services/guest.service.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res, next) {
  try {
    const { undanganId } = req.query;
    if (!undanganId) return res.status(400).json({ success: false, message: 'undanganId wajib diisi' });
    return ok(res, await guestService.list(req.user.sub, undanganId));
  } catch (e) { next(e); }
}

export async function detail(req, res, next) {
  try { return ok(res, await guestService.findBySlug(req.params.slug)); }
  catch (e) { next(e); }
}

export async function create(req, res, next) {
  try { return created(res, await guestService.create(req.user.sub, req.body), 'Tamu ditambahkan'); }
  catch (e) { next(e); }
}

export async function bulkCreate(req, res, next) {
  try {
    const { undanganId, guests } = req.body;
    const result = await guestService.bulkCreate(req.user.sub, undanganId, guests);
    return created(res, result, `${result.count} tamu ditambahkan`);
  } catch (e) { next(e); }
}

export async function update(req, res, next) {
  try { return ok(res, await guestService.update(req.user.sub, req.params.id, req.body), 'Tamu diupdate'); }
  catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try { return ok(res, await guestService.remove(req.user.sub, req.params.id), 'Tamu dihapus'); }
  catch (e) { next(e); }
}

export async function stats(req, res, next) {
  try {
    const { undanganId } = req.query;
    return ok(res, await guestService.stats(req.user.sub, undanganId));
  } catch (e) { next(e); }
}

export async function rsvp(req, res, next) {
  try { return ok(res, await guestService.rsvpBySlug(req.body), 'RSVP terkirim'); }
  catch (e) { next(e); }
}