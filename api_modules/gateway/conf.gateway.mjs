// Import all dependencies ======================================================================================================================================================================================================>
import redis from './conf.redis.mjs'; // импорт конфигурации Redis
import { v4 as uuidv4 } from 'uuid';

// Module =======================================================================================================================================================================================================================>
const items = {
  "/auth/signin": {
    method: "POST",
    middlewares: [
      { service: "signin-service", "namespace": "signin", "action": "signIn", "attr": "si", "params": "body" }
    ]
  },
  "/auth/signup": {
    method: "POST",
    middlewares: [
      { service: "check-data-is-valid-service", host: "localhost", port: 50051 },
    ]
  },
  "/auth/refresh": {
    "method": "GET",
    "middlewares": [
      { "service": "verify-refresh-token-service", "namespace": "verify-refresh-token", "action": "verifyRefreshToken", "attr": "vrt", "params": "cookies" },
      { "service": "refresh-tokens-service", "namespace": "refresh-tokens", "action": "refreshTokens", "attr": "rt", "params": "cookies" }
    ]
  },
  "/services/weather": {
    method: "POST",
    middlewares: [
      { service: "weather-service", host: "localhost", port: 50054 }
    ]
  },
  "/services/info": {
    "method": "POST",
    "middlewares": [
      { "service": "collect-info-service", "namespace": "collect-info", "action": "collectInfo", "attr": "ci", "params": "body" }
    ]
  },
  "/security/csp": {
    "method": "POST",
    "middlewares": [
      { "service": "log-csp-violation-service", "namespace": "log-csp-violation", "action": "logCSPViolation", "attr": "lcv", "params": "body" }
    ]
  },
};

export async function loadInitialData() { try { for (const [route, config] of Object.entries(items)) { await redis.hset('route_registry', route, JSON.stringify(config)) } } catch (err) { console.error("Error loading initial data into Redis:", err) } finally { console.log('Redis routes configured') } };

const corsConfig = {
  origin: ['https://weather-now.ru', 'https://www.weather-now.ru', '127.0.0.1', '127.0.0.100:4000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

const headersConfig = (req, res, next) => {
  req.headers['x-forwarded-for'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  req.headers['x-dora-request-id'] = uuidv4();
  res.header('x-dora-request-id', req.headers['x-dora-request-id'])
  next();
};

export { corsConfig, headersConfig, items };