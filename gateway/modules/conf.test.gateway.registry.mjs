// Import all dependencies ======================================================================================================================================================================================================>
import redis from '../../db_redis/models/index.mjs'; // импорт конфигурации Redis

// Module =======================================================================================================================================================================================================================>
// Начальная конфигурация маршрутов
const initialRoutes = {
  "/auth/signin": {
    method: "POST",
    middlewares: [], // Нет миддлвэров
    service: "signin-service",
    serviceMethod: "signIn",
    params: "body",
  },
  "/auth/signup": {
    method: "POST",
    middlewares: ["check-data-is-valid", "send-activate-link"],
    service: "signup-service",
    serviceMethod: "signUp",
    params: "body",
  },
  "/auth/refresh": {
    method: "GET",
    middlewares: ["verify-refresh-token"],
    service: "refresh-tokens-service",
    serviceMethod: "refreshTokens",
    params: "cookies",
  },
  "/dynamic/weather": {
    method: "POST",
    middlewares: [],
    service: "get-weather-service",
    serviceMethod: "getWeather",
    params: "body",
  },
};

// Начальные конфигурации middleware
const initialMiddlewares = {
  "check-data-is-valid": "cdv",
  "send-activate-link": "sal",
  "verify-refresh-token": "vrt",
};

// Функция для загрузки маршрутов и миддлвэров в Redis
// async function loadInitialData() {
//   try {
//     // Загружаем маршруты
//     for (const [route, config] of Object.entries(initialRoutes)) {
//       await redis.hset('routes', route, JSON.stringify(config));
//       console.log(`Route ${route} loaded with config: ${JSON.stringify(config)}`);
//     }

//     // Загружаем middleware-функции
//     for (const [middleware, service] of Object.entries(initialMiddlewares)) {
//       await redis.hset('middlewares', middleware, service);
//       console.log(`Middleware ${middleware} loaded with service: ${service}`);
//     }
//   } catch (err) {
//     console.error("Error loading initial data into Redis:", err);
//   } finally {
//     redis.quit(); // Закрытие соединения после загрузки данных
//   }
// }

export async function loadInitialData() {
  try {
    // Загружаем маршруты
    for (const [route, config] of Object.entries(initialRoutes)) {
      await redis.hset('routes', route, JSON.stringify(config));
      // console.log(`Route ${route} loaded with config: ${JSON.stringify(config)}`);
    }

    // Загружаем middleware-функции
    for (const [middleware, service] of Object.entries(initialMiddlewares)) {
      await redis.hset('middlewares', middleware, service);
      // console.log(`Middleware ${middleware} loaded with service: ${service}`);
    }
  } catch (err) {
    console.error("Error loading initial data into Redis:", err);
  } finally {
    redis.quit(); // Закрытие соединения после загрузки данных
  }
}

// Запуск скрипта загрузки данных
// loadInitialData();