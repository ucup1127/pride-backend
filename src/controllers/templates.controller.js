import * as templatesService from '../services/templates.service.js';
import { ok } from '../utils/response.js';

export async function list(req, res, next) {
  try { return ok(res, await templatesService.list(req.query)); }
  catch (e) { next(e); }
}
export async function detail(req, res, next) {
  try { return ok(res, await templatesService.detail(req.params.id)); }
  catch (e) { next(e); }
}