import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import { createServer, request as httpRequest } from 'node:http';
import 'dotenv/config';

const PORT = parseInt(process.env.PORT || '4000', 10);
const numWorkers = availableParallelism() - 1;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Starting ${numWorkers} workers...`);

  const products = new Map<string, any>();
  const workers: any[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = cluster.fork({ WORKER_PORT: String(PORT + 1 + i) });

    workers.push(worker);

    worker.on('online', () => {
      console.log(`Worker ${worker.process.pid} is online`);
    });

    worker.on('message', (msg: any) => {
      let response: any;

      switch (msg.action) {
        case 'GET_ALL':
          response = { id: msg.id, data: Array.from(products.values()) };
          break;

        case 'GET_BY_ID':
          response = { id: msg.id, data: products.get(msg.productId) ?? null };
          break;

        case 'CREATE':
          products.set(msg.product.id, msg.product);
          response = { id: msg.id, data: msg.product };
          break;

        case 'UPDATE':
          if (products.has(msg.productId)) {
            const existing = products.get(msg.productId);
            const updated = { ...existing, ...msg.product };
            products.set(msg.productId, updated);
            response = { id: msg.id, data: updated };
          } else {
            response = { id: msg.id, data: null };
          }
          break;

        case 'DELETE':
          if (products.has(msg.productId)) {
            products.delete(msg.productId);
            response = { id: msg.id, data: true };
          } else {
            response = { id: msg.id, data: false };
          }
          break;

        default:
          response = { id: msg.id, data: null };
      }

      if (worker.isConnected()) {
        worker.send(response);
      }
    });

    worker.on('disconnect', () => {
      console.log(`Worker ${worker.process.pid} disconnected`);
    });
  }

  let currentWorkerIndex = 0;

  const balancer = createServer((req, res) => {
    const targetPort = PORT + 1 + currentWorkerIndex;
    currentWorkerIndex = (currentWorkerIndex + 1) % numWorkers;

    const proxyReq = httpRequest(
      {
        hostname: 'localhost',
        port: targetPort,
        path: req.url,
        method: req.method,
        headers: req.headers,
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on('error', (err) => {
      console.error(`Proxy error (target port ${targetPort}):`, err.message);
      res.writeHead(502);
      res.end('Bad Gateway');
    });

    req.pipe(proxyReq, { end: true });
  });

  balancer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please free it or change PORT in .env`);
      process.exit(1);
    } else {
      console.error('Load balancer error:', err);
      process.exit(1);
    }
  });

  balancer.listen(PORT, () => {
    console.log(`Load balancer listening on port ${PORT}`);
  });

  cluster.on('exit', (worker, code) => {
    console.log(`Worker ${worker.process.pid} died (code ${code}). Restarting...`);

    const newWorker = cluster.fork({ WORKER_PORT: process.env.WORKER_PORT });
    const index = workers.findIndex(w => w.process.pid === worker.process.pid);

    if (index !== -1) {
      workers[index] = newWorker;
    }
  });

} else {
  import('./workerApp.js').then(({ startWorker }) => {
    const workerPort = parseInt(process.env.WORKER_PORT || '4001', 10);
    startWorker(workerPort);
  });
}