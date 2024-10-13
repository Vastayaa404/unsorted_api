// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import db from '../../db_auth/models/index.mjs';
const Token = db.token;
import ApiError from './api.error.mjs';
import { handleError } from '../../deborah/panic.functions.mjs';

// Module ============================================================ ===========================================================================================================================================================>
const rt = new cote.Responder({ name: 'refresh-tokens-service', namespace: 'refresh-tokens' });
const ct = new cote.Requester({ name: 'create-token-service', namespace: 'create-token', timeout: 10000 }); // ct.service

process.on('unhandledRejection', (reason, promise) => handleError('Unhandled Rejection', reason));
process.on('uncaughtException', (err) => handleError('Uncaught Exception', err));
rt.on('refreshTokens', async (req, cb) => {
  try {
    const token = await Token.findOne({ where: { token: req.params.cookies.rt } });
    const { userId, username } = token;

    const r = await new Promise(resolve => ct.send({ type: 'createToken', params: { user: { id: userId, username } } }, resolve)); if (r.code > 399) throw new ApiError(r.code, r.data);
    const { accessToken, refreshToken } = r.data;

    await Token.destroy({ where: { token: req.params.cookies.rt } });
    await Token.create({ userId, username, token: refreshToken });

    cb({ code: 200, data: { accessToken, refreshToken } });
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});