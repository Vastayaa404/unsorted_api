// Import all dependencies ======================================================================================================================================================================================================>
  import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cote from 'cote';
import redis from '../../db_redis/models/index.mjs';
import { headersConfig } from './conf.gateway.mjs';
import { loadInitialData } from './conf.test.gateway.registry.mjs';

// Module =======================================================================================================================================================================================================================>
const dynamicHook = (rq, type, prm) => async (req, res) => { const r = await new Promise(resolve => rq.send({ type, params: { [prm]: req[prm] } }, resolve)); r.data?.refreshToken && (res.cookie("rt", r.data.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }), delete r.data.refreshToken); return r };
const coteRequesters = {};
const routeCache = {}; // Локальный кэш маршрутов

await loadInitialData();

const getCoteRequester = ({ coteName, coteNamespace, coteAttr }) => { try { if (!coteRequesters[coteAttr]) { coteRequesters[coteAttr] = new cote.Requester({ name: coteName, namespace: coteNamespace, timeout: 10000 }) }; return coteRequesters[coteAttr] } catch (e) { console.log(e) } };

const runMiddlewares = async (middlewares, req, res) => {
  try {
    for (const middlewareName of middlewares) {
      const middlewareConfigStr = await redis.hget('middlewares', middlewareName);
      if (!middlewareConfigStr) { return res.status(500).send({ code: 500, data: `Middleware ${middlewareName} is not configured correctly.` }) };

      const middlewareConfig = JSON.parse(middlewareConfigStr); // Вроде не нужно
      const { coteName, coteNamespace, coteAttr, paramsKey, params } = middlewareConfig;
      if (!coteName || !coteNamespace || !coteAttr) { return res.status(500).send({ code: 500, data: `Middleware ${middlewareName} is missing required fields.` }) };

      const middlewareRequester = getCoteRequester({ coteName, coteNamespace, coteAttr });
      const middlewareResponse = await dynamicHook(middlewareRequester, paramsKey, params)(req, res);
      if (middlewareResponse !== "next") return middlewareResponse;
    }
    return null;
  } catch (e) {
    console.log(e);
    return res.status(500).send({ code: 500, data: 'An error occurred while processing middlewares.' });
  }
};

const fastify = Fastify();
fastify.addHook('onRequest', headersConfig)
.register(cookie, { secret: "my-secret", hook: 'onRequest', parseOptions: {} })
.route({ // TODO: fix method GET/POST, the method is not being compared now
  method: ['GET', 'POST'],
  url: '/*',
  handler: async (req, res) => {
    const routeKey = req.raw.url;
    let routeConfig = routeCache[routeKey];
    if (!routeConfig) {
      routeConfig = await redis.hget('routes', routeKey);
      if (!routeConfig) return res.status(404).send({ code: 404, data: `Route is incorrect, or functionality is not supported` });

      routeConfig = JSON.parse(routeConfig);
      routeCache[routeKey] = routeConfig;
    }

    const { method, middlewares, coteName, coteNamespace, coteAttr, paramsKey, params } = routeConfig;
    const requester = getCoteRequester({ coteName, coteNamespace, coteAttr });

    // Выполняем миддлвары перед основным запросом
    if (middlewares && middlewares.length > 0) { const middlewareResponse = await runMiddlewares(middlewares, req, res); if (middlewareResponse) return middlewareResponse };
    const response = await dynamicHook(requester, paramsKey, params)(req, res);

    res.send(response);
  },
})
.listen({ port: 5080 }, (err, address) => { if (err) throw err; console.log('Dynamic Gateway Started') });

// Функция для сброса локального кэша при изменении маршрутов в Redis
// const resetRouteCache = () => { console.log("Resetting route cache due to configuration changes..."); for (const key in routeCache) delete routeCache[key] };

// Подписка на изменения маршрутов в Redis TODO: два коннекта для режима подписчика/обновление таймером
// redis.subscribe('route_changes', () => console.log("Subscribed to Redis route changes channel"));
// redis.on('message', (channel, message) => { if (channel === 'route_changes') resetRouteCache() });
