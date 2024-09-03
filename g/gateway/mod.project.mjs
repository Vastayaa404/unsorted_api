// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cote from 'cote';
import { projectHeadersConfig } from './conf.gateway.mjs';

// Module =======================================================================================================================================================================================================================>
const ws = new cote.Requester({ name: 'weather-service', namespace: 'weather', timeout: 10000 });
const dynamicHook = (requester, type, prm) => async (req, res) => { const r = await new Promise(resolve => requester.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.code > 399) { throw r }; return r };

const fastify = Fastify();
fastify.addHook('onRequest', projectHeadersConfig)
.register((instance, opts, next) => { instance.post('/weather', dynamicHook(ws, 'getWeather', 'body')); next() })
.listen({ port: 5040 }, (err, address) => { if (err) throw err; console.log('Project Gateway Started') });