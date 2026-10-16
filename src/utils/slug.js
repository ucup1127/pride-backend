import crypto from 'node:crypto';

/**
 * Convert nama jadi slug:
 * "Budi Santoso" -> "budi-santoso"
 * "Keluarga Bpk. Ahmad" -> "keluarga-bpk-ahmad"
 */
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate slug unik dengan suffix random pendek.
 * "Budi Santoso" -> "budi-santoso-a1b2"
 */
export function uniqueSlug(text) {
  const base = slugify(text) || 'guest';
  const suffix = crypto.randomBytes(2).toString('hex');
  return `${base}-${suffix}`;
}