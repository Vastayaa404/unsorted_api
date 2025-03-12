import axios from 'axios';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import redis from '../gateway/conf.redis.mjs';
import { handleError } from './api.deborah.mjs';
process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'weather-service'));
process.on('uncaughtException', (err) => handleError('Error Exception', err, 'weather-service'));

const PROTO_PATH = '../gateway/pipeline.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const pipelineProto = grpc.loadPackageDefinition(packageDefinition).pipeline;

async function processData(call, callback) {
  try {
    const reqData = call.request;
    const body = JSON.parse(reqData.body);
    if (!body || !body.city) return callback(null, { code: 422, data: 'Invalid data' });

    const cacheKey = `weather:${body.city}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return callback(null, { code: 304, data: cachedData });

    const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${body.city}&appid=${process.env.WEA_API_KEY}`, { timeout: 5000 });
    const filteredData = {
      city: body.city.charAt(0).toUpperCase() + body.city.slice(1).toLowerCase(),
      country: data.sys.country,
      temp: Math.round(data.main.temp - 273.15),
      weather: data.weather[0].main,
    };
    console.log(filteredData)
    await redis.set(cacheKey, JSON.stringify(filteredData), 'EX', 1800);

    return callback(null, { code: 200, data: JSON.stringify(filteredData) });
  } catch (err) { return callback(err) }
}

const server = new grpc.Server();
server.addService(pipelineProto.PipelineService.service, { Process: processData });
server.bindAsync('0.0.0.0:50054', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('WEATHER service failed to bind:', err);
    process.exit(1);
  }
  console.log(`WEATHER service running on port ${port}`);
});