import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from './services/clusterProductService.js';
import { isValidUuid, validateProductBody } from './utils/validation.js';
import { createProductSchema } from './schemas/productSchema.js';

interface ProductParams {
  productId: string;
}

function buildWorkerApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get('/api/products', async (_request: FastifyRequest, reply: FastifyReply) => {
    const products = await getAllProducts();
    return reply.code(200).send(products);
  });

  app.get('/api/products/:productId', async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    const { productId } = request.params;

    if (!isValidUuid(productId)) {
      return reply.code(400).send({ message: 'Invalid product ID format' });
    }

    const product = await getProductById(productId);
    if (!product) {
      return reply.code(404).send({ message: 'Product not found' });
    }

    return reply.code(200).send(product);
  });

  app.post('/api/products', async (request: FastifyRequest, reply: FastifyReply) => {
    const validation = validateProductBody(createProductSchema, request.body);
    if (!validation.valid) {
      return reply.code(400).send({ message: validation.error });
    }

    const product = await createProduct(validation.data);
    return reply.code(201).send(product);
  });

  app.put('/api/products/:productId', async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    const { productId } = request.params;

    if (!isValidUuid(productId)) {
      return reply.code(400).send({ message: 'Invalid product ID format' });
    }

    const existing = await getProductById(productId);
    if (!existing) {
      return reply.code(404).send({ message: 'Product not found' });
    }

    const validation = validateProductBody(createProductSchema, request.body);
    if (!validation.valid) {
      return reply.code(400).send({ message: validation.error });
    }

    const updated = await updateProduct(productId, validation.data);
    return reply.code(200).send(updated);
  });

  app.delete('/api/products/:productId', async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    const { productId } = request.params;

    if (!isValidUuid(productId)) {
      return reply.code(400).send({ message: 'Invalid product ID format' });
    }

    const deleted = await deleteProduct(productId);
    if (!deleted) {
      return reply.code(404).send({ message: 'Product not found' });
    }

    return reply.code(204).send();
  });

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ message: 'Resource not found' });
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.code(500).send({ message: 'Internal server error' });
  });

  return app;
}

export async function startWorker(port: number) {
  const app = buildWorkerApp();

  app.listen({ port, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    console.log(`Worker ${process.pid} listening on ${address}`);
  });
}