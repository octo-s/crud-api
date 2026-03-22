import { randomUUID } from 'crypto';
import { db } from '../db/inMemoryDb.js';
import { Product, CreateProductDto, UpdateProductDto } from '../types/product.js';

export function getAllProducts(): Product[] {
  return db.getAll();
}

export function getProductById(id: string): Product | undefined {
  return db.getById(id);
}

export function createProduct(data: CreateProductDto): Product {
  const product: Product = {
    id: randomUUID(),
    ...data,};
  return db.create(product);
}

export function updateProduct(id: string, data: UpdateProductDto): Product | undefined {
  const existing = db.getById(id);
  if (!existing) return undefined;

  const updated: Product = { ...existing, ...data };
  return db.update(id, updated);
}

export function deleteProduct(id: string): boolean {
  const existing = db.getById(id);
  if (!existing) return false;
  return db.delete(id);
}