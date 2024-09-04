// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';
import cluster from 'cluster';
import { cpus, totalmem, freemem } from 'os';
import { corsConfig, headersConfig } from './conf.core.mjs';

// Module =======================================================================================================================================================================================================================>
if (cluster.isPrimary) {
  const numCPUs = cpus().length;
  for (let i = 0; i < 4/*numCPUs*/; i++) cluster.fork();
  console.log(`${(totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB RAM detected\n${(freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB RAM available`); // RAM on device / available RAM
  cluster.on('exit', (worker) => console.log(`cluster ${worker.process.pid} died`));
} else {
  const fastify = Fastify();
  fastify.addHook('onRequest', headersConfig).register(cors, corsConfig)
  .register(proxy, { upstream: 'http://localhost:5020', prefix: '/auth' }) // To auth gateway
  .register(proxy, { upstream: 'http://localhost:5040', prefix: '/services' }) // To project gateway
  .register(proxy, { upstream: 'http://localhost:5060', prefix: '/dev' }) // To dev (test) gateway
  .listen({ port: 5000 }, (err, address) => { if (err) throw err; console.log(`Core Started`) });
};