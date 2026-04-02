import { Product } from '../types/product.js';

let messageId = 0;
const pendingRequests = new Map<number, {
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}>();

process.on('message', (msg: any) => {
  const pending = pendingRequests.get(msg.id);
  if (pending) {
    pending.resolve(msg.data);
    pendingRequests.delete(msg.id);
  }
});

function sendToMaster(action: string, payload: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!process.send) {
      return reject(new Error('process.send is not available (not in worker context)'));
    }

    const id = messageId++;
    pendingRequests.set(id, { resolve, reject });

    try {
      process.send({ id, action, ...payload });
    } catch (err: any) {
      pendingRequests.delete(id);
      reject(new Error(`Failed to send message to master: ${err.message}`));
      return;
    }

    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error(`Master timeout (action: ${action})`));
      }
    }, 5000);
  });
}

export const clusterDb = {
  async getAll(): Promise<Product[]> {
    return sendToMaster('GET_ALL');
  },

  async getById(id: string): Promise<Product | null> {
    return sendToMaster('GET_BY_ID', { productId: id });
  },

  async create(product: Product): Promise<Product> {
    return sendToMaster('CREATE', { product });
  },

  async update(id: string, product: Product): Promise<Product | null> {
    return sendToMaster('UPDATE', { productId: id, product });
  },

  async delete(id: string): Promise<boolean> {
    return sendToMaster('DELETE', { productId: id });
  },
};