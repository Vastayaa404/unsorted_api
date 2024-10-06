// Import all dependencies ======================================================================================================================================================================================================>
import redis from '../../db_redis/models/index.mjs'; // импорт конфигурации Redis

// Module =======================================================================================================================================================================================================================>
// Начальная конфигурация маршрутов
const initialRoutes = {
  "/auth/signin": {
    method: "POST",
    middlewares: [],
    coteName: "signin-service",
    coteNamespace: "signin",
    coteAttr: "si",
    paramsKey: "signIn",
    params: "body",
  },
  "/auth/signup": {
    method: "POST",
    middlewares: ["check-data-is-valid", "send-activate-link"],
    coteName: "signup-service",
    coteNamespace: "signup",
    coteAttr: "su",
    paramsKey: "signUp",
    params: "body",
  },
  "/auth/refresh": {
    method: "GET",
    middlewares: ["verify-refresh-token"],
    coteName: "refresh-tokens-service",
    coteNamespace: "refresh-tokens",
    coteAttr: "rt",
    paramsKey: "refreshTokens",
    params: "cookies",
  },
  "/dynamic/weather": {
    method: "POST",
    middlewares: [],
    coteName: "weather-service",
    coteNamespace: "weather",
    coteAttr: "ws",
    paramsKey: "getWeather",
    params: "body",
  },
  "/security/csp": {
    method: "POST",
    middlewares: [],
    coteName: "log-csp-violation-service",
    coteNamespace: "log-csp-violation",
    coteAttr: "lcv",
    paramsKey: "logCSPViolation",
    params: "body",
  },
};

// Начальные конфигурации middleware
const initialMiddlewares = {
  "verify-refresh-token": {
    coteName: "verify-refresh-token-service",
    coteNamespace: "verify-refresh-token",
    coteAttr: "vrt",
  },
  "check-data-is-valid": {
    coteName: "check-data-is-valid-service",
    coteNamespace: "check-data-is-valid",
    coteAttr: "cdv",
  },
  "send-activate-link": {
    coteName: "send-activate-link-service",
    coteNamespace: "send-activate-link",
    coteAttr: "sal",
  },
};

// Функция для загрузки маршрутов и миддлвэров в Redis
export async function loadInitialData() {
  try {
    // Загружаем маршруты
    for (const [route, config] of Object.entries(initialRoutes)) {
      await redis.hset('routes', route, JSON.stringify(config));
      // console.log(`Route ${route} loaded with config: ${JSON.stringify(config)}`);
    }

    // Загружаем middleware-функции
    for (const [middleware, config] of Object.entries(initialMiddlewares)) {
      await redis.hset('middlewares', middleware, JSON.stringify(config));
      // console.log(`Middleware ${middleware} loaded with service: ${service}`);
    }
  } catch (err) {
    console.error("Error loading initial data into Redis:", err);
  } finally {
    // redis.quit(); // Закрытие соединения после загрузки данных
    console.log('Redis routes added')
  }
}