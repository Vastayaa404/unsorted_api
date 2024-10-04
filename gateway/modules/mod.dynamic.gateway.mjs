// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cote from 'cote';
import { headersConfig } from './conf.gateway.mjs';
import { loadInitialData } from './conf.test.gateway.registry.mjs';

import redis from '../../db_redis/models/index.mjs'; // Не факт, что будут подгружаться так, но хрен с ним

// Module =======================================================================================================================================================================================================================>
// const cdv = new cote.Requester({ name: 'check-data-is-valid-service', namespace: 'check-data-is-valid', timeout: 10000 }); // cdv.service
// const rt = new cote.Requester({ name: 'refresh-tokens-service', namespace: 'refresh-tokens', timeout: 10000 }); // rt.service
// const sal = new cote.Requester({ name: 'send-activate-link-service', namespace: 'send-activate-link', timeout: 10000 }); // sal.service (sendactivatelink)
// const si = new cote.Requester({ name: 'signin-service', namespace: 'signin', timeout: 10000 }); // si.service (signin)
// const su = new cote.Requester({ name: 'signup-service', namespace: 'signup', timeout: 10000 }); // su.service (signup)
// const vrt = new cote.Requester({ name: 'verify-refresh-token-service', namespace: 'verify-refresh-token', timeout: 10000 }); // vrt.service

// Словарь для хранения сервисов cote
const services = {};

// Функция для создания и регистрации cote.Requester'ов динамически
const createCoteRequester = (name, namespace) => {
  if (!services[namespace]) {
    services[namespace] = new cote.Requester({ name, namespace, timeout: 10000 });
  }
  return services[namespace];
};


const dynamicHook = (rq, type, prm) => async (req, res) => { const r = await new Promise(resolve => rq.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.code > 399) return res.code(200).send(r); r.data?.refreshToken && (res.cookie("rt", r.data.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }), delete r.data.refreshToken); return r };
const testHook = () => async (req, res) => { res.send('hi from dyn') };

const requesters = {}; // Хранилище всех Cote-сервисов
const routeRegistry = {}; // Локальное хранилище зарегистрированных маршрутов

const fastify = Fastify();

loadInitialData(); // load route registry in redis

const loadRoutes = async () => {
  const routes = await redis.hgetall('routes');
  const loadedRoutes = [];

  for (const [route, configStr] of Object.entries(routes)) {
    const config = JSON.parse(configStr);
    const { method, middlewares, service, serviceMethod, params } = config;

    console.log(`Loading route: ${method.toUpperCase()} ${route}`);

    // Создаем Cote Requester для текущего сервиса, если его еще нет
    createCoteRequester(service, service);

    // Асинхронно загружаем все миддлвэры и создаем цепочку preHandler'ов
    const hooks = await Promise.all(
      (middlewares || []).map(async (middleware) => {
        // Получаем имя сервиса для каждого миддлвэра
        const serviceName = await redis.hget('middlewares', middleware);
        createCoteRequester(serviceName, serviceName); // Создаем Cote Requester для middleware
        return dynamicHook(services[serviceName], middleware, params);
      })
    );

    // Динамически регистрируем маршрут в Fastify
    fastify.register((instance, opts, next) => {
      // Если есть миддлвэры, добавляем их перед обработчиком
      hooks.forEach((hook) => instance.addHook('preHandler', hook));
      // Регистрируем конечный обработчик
      instance[method.toLowerCase()](route, dynamicHook(services[service], serviceMethod, params));
      next();
    });

    // Добавляем информацию о загруженном маршруте для логов
    loadedRoutes.push({ route, method, service, serviceMethod, middlewares });
  }

  console.log(`Total routes loaded: ${loadedRoutes.length}`);
  // console.log(loadedRoutes);
  return loadedRoutes;
};

// const loadRoutes = async () => {
//   const routes = await redis.hgetall('routes');
//   const loadedRoutes = [];

//   for (const [route, configStr] of Object.entries(routes)) {
//     const config = JSON.parse(configStr);
//     const { method, middlewares, service, serviceMethod, params } = config;

//     console.log(`Loading route: ${method.toUpperCase()} ${route}`);

//     // Асинхронно загружаем все миддлвэры
//     const hooks = await Promise.all((middlewares || []).map(async (middleware) => {
//       // Получаем имя сервиса для каждого миддлвэра
//       const serviceName = await redis.hget('middlewares', middleware);
//       return dynamicHook(service[serviceName], middleware, params);
//     }));

//     // Динамически регистрируем маршрут в Fastify
//     fastify.register((instance, opts, next) => {
//       // Если есть миддлвэры, добавляем их перед обработчиком
//       hooks.forEach((hook) => instance.addHook('preHandler', hook));
//       // Регистрируем конечный обработчик
//       instance[method.toLowerCase()](route, dynamicHook(service[service], serviceMethod, params));
//       next();
//     });

//     // Добавляем информацию о загруженном маршруте для логов
//     loadedRoutes.push({ route, method, service, serviceMethod, middlewares });
//   }

//   console.log(`Total routes loaded: ${loadedRoutes.length}`);
//   console.log(loadedRoutes);
//   return loadedRoutes;
// };

(async () => {
  try {
    const routes = await loadRoutes();
    console.log(`Routes successfully loaded: `, routes);
  } catch (error) {
    console.error(`Failed to load routes: ${error.message}`);
  }
})();

fastify.ready(() => console.log(fastify.printRoutes()));
fastify.listen({ port: 5080 }, (err, address) => { if (err) throw err; console.log('Dynamic Gateway Started') });












// fastify.addHook('onRequest', headersConfig)
// .register(cookie, { secret: "my-secret", hook: 'onRequest', parseOptions: {} })
// .register((instance, opts, next) => { instance.get('/hello', testHook()); next() }) // rq - cote requester, type - cote service name, prm - cote content
// .register((instance, opts, next) => { instance.post('/signin', dynamicHook(si, 'signIn', 'body')); next() }) // rq - cote requester, type - cote service name, prm - cote content
// .register((instance, opts, next) => { instance.addHook('preHandler', dynamicHook(cdv, 'checkDataIsValid', 'body')); instance.addHook('preHandler', dynamicHook(sal, 'sendActivateLink', 'body')); instance.post('/signup', dynamicHook(su, 'signUp', 'body')); next() })
// .register((instance, opts, next) => { instance.addHook('preHandler', dynamicHook(vrt, 'verifyRefreshToken', 'cookies')); instance.get('/refresh', dynamicHook(rt, 'refreshTokens', 'cookies')); next() })
// .listen({ port: 5080 }, (err, address) => { if (err) throw err; console.log('Dynamic Gateway Started') });