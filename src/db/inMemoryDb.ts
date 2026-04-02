import { Product } from '../types/product.js';

class InMemoryDatabase {
  private products: Map<string, Product> = new Map();

  getAll(): Product[] {
    return Array.from(this.products.values());
  }

  getById(id: string): Product | undefined {
    return this.products.get(id);
  }

  create(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }

  update(id: string, product: Product): Product {
    this.products.set(id, product);
    return product;
  }

  delete(id: string): boolean {
    return this.products.delete(id);
  }
}

export const db = new InMemoryDatabase();