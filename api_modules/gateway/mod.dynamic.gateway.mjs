// Import all dependencies ======================================================================================================================================================================================================>
import 'dotenv/config'
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import redis from './conf.redis.mjs';
import { corsConfig, headersConfig } from './conf.gateway.mjs';
import { getRequester, warmupRequesters } from './service.accelerator.mjs';
import { initialSystem } from '../microservices/api.initial.functions.mjs';
// import { handleError } from '../microservices/api.deborah.mjs';
// process.on('unhandledRejection', (reason, promise) => handleError('FATAL Rejection', reason, 'gateway'));
// process.on('uncaughtException', (err) => handleError('FATAL Exception', err, 'gateway'));

// Module =======================================================================================================================================================================================================================>
const routeCache = {};
await initialSystem();
await warmupRequesters();

/**
 * Функция для перенаправления запроса в первый микросервис (точку входа)
 * в соответствии с конфигурацией маршрута.
 */
async function forwardRequestToEntryService(routeConfig, req, res) {
  // Выбираем первый middleware как entry-point
  const entry = routeConfig.middlewares[0];
  const { service, namespace, attr, params } = entry;
  // Получаем cote Requester (лениво инициализированный)
  const requester = getRequester({ service, namespace, attr });
  // Подготавливаем payload – передаём всю информацию из req[params] (например, body или cookies)
  const payload = { type: entry.action, params: { [params]: req[params] } };
  
  // Здесь можно обернуть вызов в circuit breaker для более быстрой обработки ошибок
  return new Promise((resolve) => { requester.send(payload, (result) => { resolve(result) }) });
}

const fastify = Fastify();

fastify.addHook('onRequest', headersConfig).register(cors, corsConfig).register(cookie, { secret: "8jsn;Z,dkEU3HBSk-ksdklSMKa", hook: 'onRequest' })
.route({ method: ['GET', 'POST'], url: '/*', handler: async (req, res) => {
  try {
    // if (await redis.get('Dora:State') !== 'AFU') return res.status(503).send({ code: 503, data: 'System in Lockdown' });
    const routeKey = req.raw.url;
    let routeConfig = routeCache[routeKey] || JSON.parse(await redis.hget('route_registry', routeKey));
    if (!routeConfig) return res.status(404).send({ code: 404, data: `Route ${routeKey} is incorrect or unsupported` });
    routeCache[routeKey] = routeConfig;
    if (!routeConfig.method || !routeConfig.middlewares?.length) return res.status(506).send({ code: 506, data: `No logic defined for ${routeKey}` });
    // Перенаправляем запрос в entry‑микросервис
    const serviceResponse = await forwardRequestToEntryService(routeConfig, req, res);
    return res.send(serviceResponse);
} catch (e) { return res.status(502).send({ code: 502, data: 'Bad Backend' }) } } }).listen({ port: 5000, host: '127.0.0.10' }, (err, address) => { if (err) throw err });