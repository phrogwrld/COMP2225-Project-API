import Fastify, { FastifyInstance } from 'fastify';
import type { FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import { Server, IncomingMessage, ServerResponse } from 'http';

class App {
  private server: FastifyInstance;

  constructor(private options: FastifyServerOptions = {}) {
    this.server = Fastify<Server, IncomingMessage, ServerResponse>(
      this.options
    );

    this.server.register(cors, {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    this.server.get('/', async (request, reply) => {
      return { hello: 'world' };
    });
  }

  async start() {
    try {
      await this.server.listen({ port: 3000, host: 'localhost' });
    } catch (e) {
      console.log(e);
      process.exit(1);
    }
  }
}

export default App;
