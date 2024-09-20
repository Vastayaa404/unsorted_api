// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cote from 'cote';
import { headersConfig } from './conf.gateway.mjs';

// Module =======================================================================================================================================================================================================================>
const ws = new cote.Requester({ name: 'weather-service', namespace: 'weather', timeout: 10000 });
const dynamicHook = (rq, type, prm) => async (req, res) => { const r = await new Promise(resolve => rq.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.code > 399) return res.code(200).send(r); r.data?.refreshToken && (res.cookie("rt", r.data.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }), delete r.data.refreshToken); return r };

const fastify = Fastify();
fastify.addHook('onRequest', headersConfig)
.register((instance, opts, next) => { instance.post('/weather', dynamicHook(ws, 'getWeather', 'body')); next() })
.listen({ port: 5060 }, (err, address) => { if (err) throw err; console.log('Project Gateway Started') });