// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cote from 'cote';
import cors from '@fastify/cors';
import cluster from 'cluster';
import { cpus } from 'os';
import { corsConfig, headersConfig, loadInitialData } from './conf.gateway.mjs';
import redis from '../../db_redis/models/index.mjs';

// Module =======================================================================================================================================================================================================================>
if (cluster.isPrimary) {
  const numCPUs = 1 //cpus().length;
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on('exit', (worker) => console.log(`cluster ${worker.process.pid} died`)); console.log(`${numCPUs} Dynamic Gateway Started`);
} else {
  const coteRequesters = {};
  const routeCache = {};

  const dynamicHook = (rq, type, prm) => async (req, res) => { const r = await new Promise(resolve => rq.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.data?.refreshToken) { res.cookie("rt", r.data.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }); delete r.data.refreshToken } return r };
  const getCoteRequester = ({ service, namespace, attr }) => { if (!coteRequesters[attr]) { coteRequesters[attr] = new cote.Requester({ name: service, namespace, timeout: 10000 }) } return coteRequesters[attr] };
  const processMiddlewares = async (middlewares, req, res) => { for (const { service, namespace, action, attr, params } of middlewares) { const requester = getCoteRequester({ service, namespace, attr }); const middlewareResponse = await dynamicHook(requester, action, params)(req, res); if (middlewareResponse !== "next") return middlewareResponse } return null };
  await loadInitialData();

  Fastify().addHook('onRequest', headersConfig).register(cors, corsConfig).register(cookie, { secret: "8jsn;Z,dkEU3HBSk-ksdklSMKa", hook: 'onRequest' })
  .route({
    method: ['GET', 'POST'], url: '/*', handler: async (req, res) => {
      const routeKey = req.raw.url;
      let routeConfig = routeCache[routeKey] || JSON.parse(await redis.hget('route_registry', routeKey));
      
      if (!routeConfig) return res.status(404).send({ code: 404, data: `Route ${routeKey} is incorrect or unsupported` });
      routeCache[routeKey] = routeConfig;

      const { method, middlewares } = routeConfig;
      if (!method || !middlewares?.length) return res.status(200).send({ code: 506, data: `No logic defined for ${routeKey}` });

      const middlewareResponse = await processMiddlewares(middlewares, req, res);
      if (middlewareResponse) res.send(middlewareResponse);
    }
  }).listen({ port: 5000, host: '127.0.0.10' }, (err, address) => { if (err) throw err });
};