import Fastify from 'fastify';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.setNotFoundHandler((_request, reply) => {
    reply.code(404).send({ message: 'Resource not found' });
  });

  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);
    reply.code(500).send({ message: 'Internal server error' });
  });

  return app;
}