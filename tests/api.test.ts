import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';

let app: FastifyInstance;

beforeAll(async () => {
  app = buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('Products API', () => {
  let createdProductId: string;

  it('should return empty array initially', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/products',
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  it('should create a new product', async () => {
    const newProduct = {
      name: 'Test Product',
      description: 'Test description',
      price: 99.99,
      category: 'electronics',
      inStock: true,
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/products',
      payload: newProduct,
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.name).toBe(newProduct.name);
    expect(body.id).toBeDefined();
    createdProductId = body.id;
  });

  it('should get product by id', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/products/${createdProductId}`,
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).id).toBe(createdProductId);
  });

  it('should update product', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/products/${createdProductId}`,
      payload: {
        name: 'Updated Product',
        description: 'Updated description',
        price: 149.99,
        category: 'electronics',
        inStock: false,
      },
    });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body).name).toBe('Updated Product');
  });

  it('should delete product', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/api/products/${createdProductId}`,
    });
    expect(response.statusCode).toBe(204);
  });

  it('should return 404 for deleted product', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/products/${createdProductId}`,
    });
    expect(response.statusCode).toBe(404);
  });

  it('should return 400 for invalid uuid', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/products/invalid-id',
    });
    expect(response.statusCode).toBe(400);
  });
});