import { Decimal } from '@prisma/client/runtime/library';

export function toPlain(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Decimal && obj instanceof Decimal) return Number(obj);
  if (Array.isArray(obj)) return obj.map(toPlain);
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = toPlain(v);
    return out;
  }
  return obj;
}
