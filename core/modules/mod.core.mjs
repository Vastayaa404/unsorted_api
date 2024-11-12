// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cors from '@fastify/cors';
import proxy from '@fastify/http-proxy';
import cluster from 'cluster';
import { cpus, totalmem, freemem } from 'os';
import { corsConfig, headersConfig } from './conf.core.mjs';

// Module =======================================================================================================================================================================================================================>
if (cluster.isPrimary) {
  const numCPUs = 1 //cpus().length;
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  console.log(`${(totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB RAM detected\n${(freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB RAM available`);
  cluster.on('exit', (worker) => console.log(`cluster ${worker.process.pid} died`)); console.log(`${numCPUs} Core Started`);
} else {
  const fastify = Fastify();
  fastify.addHook('onRequest', headersConfig).register(cors, corsConfig)
  .addHook('preValidation', (req, res, done) => {
    console.log({
      // method: req.method,
      // url: req.url,
      // headers: req.headers,
      // query: req.query,
      // body: req.body,
      // params: req.params
      body: req.body
    });
    done();
  })
  .register(proxy, { upstream: 'http://127.0.0.20:5020', prefix: '/dynamic' }) // To dynamic gateway
  .listen({ port: 5000, host: '127.0.0.10' }, (err, address) => { if (err) throw err });
};