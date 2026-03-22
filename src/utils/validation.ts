import { validate as uuidValidate } from 'uuid';
import { z } from 'zod';

export function isValidUuid(id: string): boolean {
  return uuidValidate(id);
}

export function validateProductBody<T>(schema: z.ZodType<T>, body: unknown): { valid: true; data: T } | { valid: false; error: string } {
  try {
    const data = schema.parse(body);
    return { valid: true, data };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { valid: false, error: err.issues[0]?.message || 'Validation failed' };
    }
    return { valid: false, error: 'Validation failed' };
  }
}