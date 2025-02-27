import cote from 'cote';
// import CircuitBreaker from 'opossum';
import { items } from './conf.gateway.mjs'; // импорт конфигурации маршрутов

const coteRequesters = {};

/**
 * Оборачивает функцию отправки запроса в circuit breaker.
 * При возникновении ошибок breaker быстро "открывается".
 */
// function wrapWithCircuitBreaker(requester, attr, options = {}) {
//   // Значения по умолчанию для circuit breaker
//   const defaultOptions = {
//     timeout: 5000,
//     errorThresholdPercentage: 50,
//     resetTimeout: 10000, // через 10 сек breaker попытается закрыться
//   };
//   const opts = { ...defaultOptions, ...options };
//   const sendFunc = (payload) =>
//     new Promise((resolve, reject) => {
//       requester.send(payload, (result) => {
//         if (result && result.code && result.code >= 400) {
//           return reject(result);
//         }
//         resolve(result);
//       });
//     });
//   const breaker = new CircuitBreaker(sendFunc, opts);
//   breaker.on('open', () => console.warn(`Circuit breaker for ${attr} opened`));
//   breaker.on('close', () => console.info(`Circuit breaker for ${attr} closed`));
//   return breaker;
// }

/**
 * Функция возвращает (и, при необходимости, создаёт) cote requester,
 * обёрнутый в circuit breaker.
 */
// export function getRequester({ service, namespace, attr, timeout = 10000, breakerOptions = {} }) {
//   if (!coteRequesters[attr]) {
//     const requester = new cote.Requester({ name: service, namespace, timeout });
//     const breaker = wrapWithCircuitBreaker(requester, attr, breakerOptions);
//     coteRequesters[attr] = {
//       requester,
//       breaker,
//       send: (payload) => breaker.fire(payload),
//     };
//   }
//   return coteRequesters[attr];
// }
export function getRequester({ service, namespace, attr, timeout = 10000 }) {
  if (!coteRequesters[attr]) {
    coteRequesters[attr] = new cote.Requester({ name: service, namespace, timeout });
  }
  return coteRequesters[attr];
}

/**
 * Функция для ленивого прогрева всех requester-ов, определённых в конфигурации.
 * Вызывается один раз при старте гейтвея.
 */
export async function warmupRequesters() {
  for (const routeConfig of Object.values(items)) {
    for (const middleware of routeConfig.middlewares) {
      getRequester({
        service: middleware.service,
        namespace: middleware.namespace,
        attr: middleware.attr,
      });
    }
  }
  console.log('Cote requesters warmed up');
}