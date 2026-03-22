import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/productService.js';
import { isValidUuid, validateProductBody } from '../utils/validation.js';
import {createProductSchema} from "../schemas/productSchema.js";

interface ProductParams {
  productId: string;
}

export async function productRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (_request: FastifyRequest, reply: FastifyReply) => {
    const products = getAllProducts();

    return reply.code(200).send(products);
  });

  fastify.get('/:productId', async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    const { productId } = request.params;

    if (!isValidUuid(productId)) {
      return reply.code(400).send({ message: 'Invalid product ID format' });
    }

    const product = getProductById(productId);

    if (!product) {
      return reply.code(404).send({ message: 'Product not found' });
    }

    return reply.code(200).send(product);
  });

  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const  productValidation = validateProductBody(createProductSchema, request.body);

    if (!productValidation.valid) {
      return reply.code(400).send({ message: productValidation.error });
    }

    const product = createProduct(productValidation.data);

    return reply.code(201).send(product);
  });

  fastify.put('/:productId', async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    const { productId } = request.params;

    if (!isValidUuid(productId)) {
      return reply.code(400).send({ message: 'Invalid product ID format' });
    }

    const existing = getProductById(productId);

    if (!existing) {
      return reply.code(404).send({ message: 'Product not found' });
    }

    const validation = validateProductBody(createProductSchema, request.body);

    if (!validation.valid) {
      return reply.code(400).send({ message: validation.error });
    }

    const updated = updateProduct(productId, validation.data);
    return reply.code(200).send(updated);
  });

  fastify.delete('/:productId', async (request: FastifyRequest<{ Params: ProductParams }>, reply: FastifyReply) => {
    const { productId } = request.params;

    if (!isValidUuid(productId)) {
      return reply.code(400).send({ message: 'Invalid product ID format' });
    }

    const deleted = deleteProduct(productId);
    if (!deleted) {
      return reply.code(404).send({ message: 'Product not found' });
    }

    return reply.code(204).send();
  });
}