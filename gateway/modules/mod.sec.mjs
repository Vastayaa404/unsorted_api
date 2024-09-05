// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cote from 'cote';
import { secHeadersConfig } from './conf.gateway.mjs';

// Module =======================================================================================================================================================================================================================>
const lcv = new cote.Requester({ name: 'log-csp-violation-service', namespace: 'log-csp-violation', timeout: 10000 }); // lcv.service
const dynamicHook = (rq, type, prm) => async (req, res) => { const r = await new Promise(resolve => rq.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.code > 399) return res.code(200).send(r); r.data?.refreshToken && (res.cookie("rt", r.data.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }), delete r.data.refreshToken); return r };


const fastify = Fastify();
fastify.addHook('onRequest', secHeadersConfig)
.register((instance, opts, next) => { instance.post('/csp-log', dynamicHook(lcv, 'logCSPViolation', 'body')); next() })
.listen({ port: 5070 }, (err, address) => { if (err) throw err; console.log('Security Gateway Started') });