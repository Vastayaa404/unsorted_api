// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cote from 'cote';
import { headersConfig } from './conf.gateway.mjs';

// Module =======================================================================================================================================================================================================================>
const cdv = new cote.Requester({ name: 'check-data-is-valid-service', namespace: 'check-data-is-valid', timeout: 10000 }); // cdv.service
const rt = new cote.Requester({ name: 'refresh-tokens-service', namespace: 'refresh-tokens', timeout: 10000 }); // rt.service
const sal = new cote.Requester({ name: 'send-activate-link-service', namespace: 'send-activate-link', timeout: 10000 }); // sal.service (sendactivatelink)
const si = new cote.Requester({ name: 'signin-service', namespace: 'signin', timeout: 10000 }); // si.service (signin)
const su = new cote.Requester({ name: 'signup-service', namespace: 'signup', timeout: 10000 }); // su.service (signup)
const vrt = new cote.Requester({ name: 'verify-refresh-token-service', namespace: 'verify-refresh-token', timeout: 10000 }); // vrt.service
const dynamicHook = (rq, type, prm) => async (req, res) => { const r = await new Promise(resolve => rq.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.code > 399) return res.code(200).send(r); r.data?.refreshToken && (res.cookie("rt", r.data.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }), delete r.data.refreshToken); return r };


const fastify = Fastify();
fastify.addHook('onRequest', headersConfig)
.register(cookie, { secret: "my-secret", hook: 'onRequest', parseOptions: {} })
.register((instance, opts, next) => { instance.post('/signin', dynamicHook(si, 'signIn', 'body')); next() }) // rq - cote requester, type - cote service name, prm - cote content
.register((instance, opts, next) => { instance.addHook('preHandler', dynamicHook(cdv, 'checkDataIsValid', 'body')); instance.addHook('preHandler', dynamicHook(sal, 'sendActivateLink', 'body')); instance.post('/signup', dynamicHook(su, 'signUp', 'body')); next() })
.register((instance, opts, next) => { instance.addHook('preHandler', dynamicHook(vrt, 'verifyRefreshToken', 'cookies')); instance.get('/refresh', dynamicHook(rt, 'refreshTokens', 'cookies')); next() })
.listen({ port: 5020 }, (err, address) => { if (err) throw err; console.log('Auth Gateway Started') });