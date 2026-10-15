import { fail } from '../utils/response.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return fail(res, 400, 'Validasi gagal', result.error.flatten().fieldErrors);
  }
  req[source] = result.data;
  next();
};