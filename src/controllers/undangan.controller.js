import * as undanganService from '../services/undangan.service.js';
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