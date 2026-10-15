import { fail } from '../utils/response.js';
import { error as logError } from '../utils/logger.js';

export function errorHandler(err, req, res, _next) {
  logError(err);
  return fail(res, err.status || 500, err.message || 'Internal Server Error');
}