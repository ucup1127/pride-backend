import { fail } from '../utils/response.js';
export function notFound(req, res) {
  return fail(res, 404, 'Route ' + req.method + ' ' + req.originalUrl + ' tidak ditemukan');
}