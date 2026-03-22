import { validate as uuidValidate } from 'uuid';
import { CreateProductDto } from '../types/product.js';

export function isValidUuid(id: string): boolean {
  return uuidValidate(id);
}

export function validateProductBody(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const product = body as CreateProductDto;

  if (!product.name) {
    return { valid: false, error: 'Name is required' };
  }

  if (!product.description) {
    return { valid: false, error: 'Description is required' };
  }

  if (!product.price || product.price <= 0) {
    return { valid: false, error: 'Price is required and must be a positive number' };
  }

  if (!product.category) {
    return { valid: false, error: 'Category is required' };
  }

  if (!product.inStock) {
    return { valid: false, error: 'inStock is required' };
  }

  return { valid: true };
}