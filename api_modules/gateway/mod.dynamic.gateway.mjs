import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import redis from './conf.redis.mjs';
import { corsConfig, headersConfig } from './conf.gateway.mjs';
import { initialSystem } from '../microservices/api.initial.functions.mjs';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = './pipeline.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const pipelineProto = grpc.loadPackageDefinition(packageDefinition).pipeline;
const [grpcClients, routeCache] = [{}, {}];

initialSystem()

function getGrpcClient(serviceConfig) {
  const key = `${serviceConfig.host}:${serviceConfig.port}`;
  if (!grpcClients[key] && serviceConfig.host && serviceConfig.port) grpcClients[key] = new pipelineProto.PipelineService(`${serviceConfig.host}:${serviceConfig.port}`, grpc.credentials.createInsecure());
  return grpcClients[key];
}
function processRequest(client, requestData) { return new Promise((resolve, reject) => { client.Process(requestData, (err, response) => { if (err) return reject(err); resolve(response) }) }) };

Fastify().addHook('onRequest', headersConfig).register(cors, corsConfig).register(cookie, { secret: "8jsn;Z,dkEU3HBSk-ksdklSMKa", hook: 'onRequest' }).setErrorHandler((err, req, res) => { res.status(err.statusCode ?? 500).send({ code: err.statusCode ?? 500, data: err.message }) })
.route({ method: ['POST', 'GET'], url: '/*', handler: async (req, res) => {
  const routeConfig = routeCache[req.raw.url] ?? JSON.parse(await redis.hget('route_registry', req.raw.url)); // TODO: упростить конфиг
  console.log('route key: ', JSON.parse(await redis.hget('route_registry', req.raw.url)))
  if (!routeConfig) return res.status(404).send({ code: 404, data: `Route ${req.raw.url} is not supported` });
  routeCache[req.raw.url] = routeConfig;
  console.log('Попадание в маршрут')

  const requestData = { body: JSON.stringify(req.body || {}), cookies: req.cookies || {} };
  const firstServiceConfig = routeConfig.middlewares[0];
  const client = getGrpcClient(firstServiceConfig);
  console.log('Обрабатываем')
    
  try {
    const response = await processRequest(client, requestData);
    console.log('Отвечаем: ', response)
    res.send({ code: response.code, data: response.data });
  } catch (err) {
    res.status(502).send({ code: 502, message: err.details ?? 'Request cannot be processed' });
  }
} }).listen({ port: 5000, host: '127.0.0.10' }, (err, address) => { if (err) { console.error('Error starting gateway:', err); process.exit(1) } console.log(`Gateway listening at ${address}`) });