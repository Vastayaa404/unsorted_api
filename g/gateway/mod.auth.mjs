// Import all dependencies ======================================================================================================================================================================================================>
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cote from 'cote';
import { authHeadersConfig } from './conf.gateway.mjs';

// Module =======================================================================================================================================================================================================================>
const cdv = new cote.Requester({ name: 'check-data-is-valid-service', namespace: 'check-data-is-valid', timeout: 10000 }); // cdv.service
const rt = new cote.Requester({ name: 'refresh-tokens-service', namespace: 'refresh-tokens', timeout: 10000 }); // rt.service
const sal = new cote.Requester({ name: 'send-activate-link-service', namespace: 'send-activate-link', timeout: 10000 }); // sal.service (sendactivatelink)
const si = new cote.Requester({ name: 'signin-service', namespace: 'signin', timeout: 10000 }); // si.service (signin)
const su = new cote.Requester({ name: 'signup-service', namespace: 'signup', timeout: 10000 }); // su.service (signup)
const vrt = new cote.Requester({ name: 'verify-refresh-token-service', namespace: 'verify-refresh-token', timeout: 10000 }); // vrt.service
const dynamicHook = (requester, type, prm) => async (req, res) => { const r = await new Promise(resolve => requester.send({ type, params: { [prm]: req[prm] } }, resolve)); if (r.code > 399) { throw r }; return r };

const fastify = Fastify();
fastify.addHook('onRequest', authHeadersConfig)
.register(cookie, { secret: "my-secret", hook: 'onRequest', parseOptions: {} })
// .register((instance, opts, next) => {
//   instance.post('/signin', async (req, res) => { const r = await new Promise(resolve => si.send({ type: 'signIn', params: { body: req.body } }, resolve)); if (r.error) throw r; res.cookie("rt", r.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }); res.send({ user: r.username, accessToken: r.accessToken }) });
//   next();
// })
// .register((instance, opts, next) => {
//   instance.addHook('preHandler', async (req, res) => { const r = await new Promise(resolve => vrt.send({ type: 'verifyRefreshToken', params: { cookies: req.cookies } }, resolve)); if (r.error) throw r }); // middleware below request
//   instance.get('/refresh', async (req, res) => { const r = await new Promise(resolve => rt.send({ type: 'refreshTokens', params: { cookies: req.cookies } }, resolve)); if (r.error) throw r; res.cookie("rt", r.refreshToken, { maxAge: 86400000, httpOnly: true, secure: true }); res.send({ accessToken: r.accessToken }) });
//   next();
// })
// .register((instance, opts, next) => {
//   instance.addHook('preHandler', async (req, res) => { const r = await new Promise(resolve => cdv.send({ type: 'checkDataIsValid', params: { body: req.body } }, resolve)); if (r.error) throw r });
//   instance.addHook('preHandler', async (req, res) => { const r = await new Promise(resolve => sal.send({ type: 'sendActivateLink', params: { body: req.body } }, resolve)); if (r.error) throw r });
//   instance.post('/signup', async (req, res) => { const r = await new Promise(resolve => su.send({ type: 'signUp', params: { body: req.body } }, resolve)); if (r.error) throw r; res.send({ message: r.message }) });
//   next();
// })
.register((instance, opts, next) => { instance.post('/signin', dynamicHook(si, 'signIn', 'body')); next() })
.register((instance, opts, next) => { 
  instance.addHook('preHandler', dynamicHook(cdv, 'checkDataIsValid', 'body'));
  instance.addHook('preHandler', dynamicHook(sal, 'sendActivateLink', 'body'));
  instance.post('/signup', dynamicHook(su, 'signUp', 'body'));
  next();
})
.register((instance, opts, next) => { 
  instance.addHook('preHandler', dynamicHook(vrt, 'verifyRefreshToken', 'cookies')); // middleware before request
  instance.get('/refresh', dynamicHook(rt, 'refreshTokens', 'cookies'));
  next();
})
.listen({ port: 5020 }, (err, address) => { if (err) throw err; console.log('Auth Gateway Started') });


// user controller routes
// fastify.get('/upload/image', [authJwt.verifyAccessToken, authJwt.isAdmin], auth_controller.upload);
// fastify.get('/activate/:id', [authJwt.verifyMailToken, verifySignUp.isActivated]);
// fastify.get('/control/users', [authJwt.verifyAccessToken, authJwt.isAdmin, authJwt.collectAllUsers]); // Endpoint for CMS
// fastify.get('/control/tokens', [authJwt.verifyAccessToken, authJwt.isAdmin, authJwt.collectAllTokens]); // Endpoint for CMS

// fastify.post('/signup', [verifySignUp.checkDataIsValid, verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.sendActivateLink], auth_controller.signup);

