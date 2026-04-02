import { randomUUID } from 'node:crypto';
import { clusterDb } from '../db/clusterDb.js';
import { Product } from '../types/product.js';
import { CreateProductDto } from '../schemas/productSchema.js';

export async function getAllProducts(): Promise<Product[]> {
  return clusterDb.getAll();
}

export async function getProductById(id: string): Promise<Product | null> {
  return clusterDb.getById(id);
}

export async function createProduct(data: CreateProductDto): Promise<Product> {
  const product: Product = {
    id: randomUUID(),
    ...data,};
  return clusterDb.create(product);
}

export async function updateProduct(id: string, data: Partial<CreateProductDto>): Promise<Product | null> {
  const existing = await clusterDb.getById(id);
  if (!existing) return null;

  const updated: Product = { ...existing, ...data };
  return clusterDb.update(id, updated);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const existing = await clusterDb.getById(id);
  if (!existing) return false;
  return clusterDb.delete(id);
}