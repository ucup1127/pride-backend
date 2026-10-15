import * as rsvpService from '../services/rsvp.service.js';
import { ok, created } from '../utils/response.js';

export async function list(req, res, next) {
  try { return ok(res, await rsvpService.list(req.params.undanganId)); } catch (e) { next(e); }
}
export async function create(req, res, next) {
  try { return created(res, await rsvpService.create(req.body)); } catch (e) { next(e); }
}