// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import jwt from 'jsonwebtoken';
import db from '../gateway/conf.postgres.mjs';
const Token = db.token;
import ApiError from './api.error.mjs';
import { handleError } from './api.deborah.mjs';
process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'verify-refresh-token-service'));
process.on('uncaughtException', (err) => handleError('Error Exception', err, 'verify-refresh-token-service'));

// Module =======================================================================================================================================================================================================================>
const vrt = new cote.Responder({ name: 'verify-refresh-token-service', namespace: 'verify-refresh-token' });
vrt.on('verifyRefreshToken', async (req, cb) => {
  try {
    const token = req.params.cookies?.rt;
    if (!token) throw new ApiError(401, "Token not found");
    if (!process.env.JWT_REFRESH_KEY) throw new ApiError(501, "VRT an error occurred while receiving the secret keys");

    jwt.verify(token, process.env.JWT_REFRESH_KEY, { issuer: 'Dora authorization service' }, (e)=> { if (e) throw new ApiError(403, e.message) });
    if (!await Token.findOne({ where: { token } })) throw new ApiError(401, "Token invalid or issued by an unauthorized issuer");

    cb('next');
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});