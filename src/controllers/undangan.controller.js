import * as undanganService from '../services/undangan.service.js';
import { prisma } from '../config/database.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res, next) {
  try { return ok(res, await undanganService.list(req.user.sub)); } catch (e) { next(e); }
}
export async function detail(req, res, next) {
  try { return ok(res, await undanganService.detail(req.params.id, req.user.sub)); } catch (e) { next(e); }
}
export async function create(req, res, next) {
  try { return created(res, await undanganService.create(req.user.sub, req.body)); } catch (e) { next(e); }
}
export async function update(req, res, next) {
  try { return ok(res, await undanganService.update(req.params.id, req.user.sub, req.body)); } catch (e) { next(e); }
}
export async function remove(req, res, next) {
  try { return ok(res, await undanganService.remove(req.params.id, req.user.sub)); } catch (e) { next(e); }
}
export async function publish(req, res, next) {
  try { return ok(res, await undanganService.publish(req.params.id, req.user.sub), 'Undangan dipublikasikan'); } catch (e) { next(e); }
}
export async function detailPublic(req, res, next) {
  try {
    const undangan = await prisma.undangan.findUnique({
      where: { slug: req.params.slug },
      include: { template: true }
    });

    if (!undangan) {
      return res.status(404).json({ success: false, message: 'Undangan tidak ditemukan' });
    }

    // SATPAM: Kalau statusnya masih draft atau isPublic false, tolak!
    if (undangan.status !== 'published' || !undangan.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Undangan ini masih dalam status DRAFT. Silakan selesaikan pembayaran.'
      });
    }
    if (undangan.expiresAt && undangan.expiresAt <= new Date()) {
      return res.status(410).json({
        success: false,
        message: 'Masa aktif undangan telah berakhir.',
      });
    }

    return ok(res, undangan);
  } catch (e) { next(e); }
}