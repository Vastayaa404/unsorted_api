// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cote from 'cote';
import cluster from 'cluster';
import { cpus } from 'os';
import redis from '../../db_redis/models/index.mjs';
import { headersConfig } from './conf.gateway.mjs';
import { loadInitialData } from './conf.gateway.mjs';

// Module =======================================================================================================================================================================================================================>
if (cluster.isPrimary) {
  const numCPUs = 1 //cpus().length;
  for (let i = 0; i < numCPUs; i++) cluster.fork();
  cluster.on('exit', (worker) => console.log(`cluster ${worker.process.pid} died`)); console.log(`${numCPUs} Dynamic Gateway Started`);
} else {
  const coteRequesters = {};
  const routeCache = {};
  const dynamicHook = (rq, type, prm) => async (req, res) => { const r = await new Promise(resolve => rq.send({ type, params: { [prm]: req[prm] } }, resolve)); r.data?.refreshToken && (res.cookie("rt", r.data.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }), delete r.data.refreshToken); return r };
  const getCoteRequester = ({ service, namespace, attr }) => { try { if (!coteRequesters[attr]) { coteRequesters[attr] = new cote.Requester({ name: service, namespace: namespace, timeout: 10000 }) }; return coteRequesters[attr] } catch (e) { console.log(e) } };
  const processMiddlewares = async (middlewares, req, res) => { for (const { service, namespace, action, attr, params } of middlewares) { const requester = getCoteRequester({ service, namespace, attr }); const middlewareResponse = await dynamicHook(requester, action, params)(req, res); if (middlewareResponse !== "next") return middlewareResponse } return null };
  
  await loadInitialData();
  
  const fastify = Fastify();
  fastify.addHook('onRequest', headersConfig)
  .register(cookie, { secret: "8jsn;Z,dkEU3HBSk-ksdklSMKa", hook: 'onRequest', parseOptions: {} })
  .route({ method: ['GET', 'POST'], url: '/*', handler: async (req, res) => {

    console.log('Получил отпроксированный запрос')

    const routeKey = req.raw.url;
    let routeConfig = routeCache[routeKey];

    if (!routeConfig) {
      routeConfig = await redis.hget('route_registry', routeKey);
      if (!routeConfig) return res.status(404).send({ code: 404, data: `Route ${routeKey} is incorrect, or functionality is not supported` });
      routeConfig = JSON.parse(routeConfig);
      routeCache[routeKey] = routeConfig;
    }

    const { method, middlewares } = routeConfig;
    if (!method || !middlewares || middlewares.length === 0) return res.status(200).send({ code: 506, data: `No logic defined for ${routeKey}` });
    const middlewareResponse = await processMiddlewares(middlewares, req, res); // погнали обрабатывать маршрут миддлами
    if (middlewareResponse) { console.log(middlewareResponse); return res.send(middlewareResponse); }
    }})
  .listen({ port: 5020, host: '127.0.0.20' }, (err, address) => { if (err) throw err });
};