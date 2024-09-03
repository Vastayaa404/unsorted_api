// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cote from 'cote';
import { testHeadersConfig } from './conf.gateway.mjs';

// Module =======================================================================================================================================================================================================================>
const ss = new cote.Requester({ name: 'status-service', namespace: 'status', timeout: 10000 })
const dynamicHook = (requester, type, prm) => async (req, res) => { const r = await new Promise(resolve => requester.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.code > 399) { throw r }; return r };

const fastify = Fastify();
fastify.addHook('onRequest', testHeadersConfig)
.register((instance, opts, next) => { instance.get('/status', dynamicHook(ss, 'getStatus', 'body')); next() })
.listen({ port: 5060 }, (err, address) => { if (err) throw err; console.log('Dev Gateway Started') });