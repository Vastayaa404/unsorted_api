// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import jwt from 'jsonwebtoken';
import db from '../../db_auth/models/index.mjs';
const Token = db.token;
const User = db.user;
import ApiError from './middleware.errors.mjs';

// Module =======================================================================================================================================================================================================================>
const vrt = new cote.Responder({ name: 'verify-refresh-token-service', namespace: 'verify-refresh-token' });

vrt.on('verifyRefreshToken', async (req, cb) => {
  try {
    const token = req.params.cookies?.rt;
    if (!token) throw new ApiError(401, "Token not found");

    jwt.verify(token, process.env.JWT_REFRESH_KEY, { issuer: 'Dora authorization service' }, (e)=> { if (e) throw new ApiError(403, e.message) });
    if (!await Token.findOne({ where: { token } })) { throw new ApiError(401, "Token invalid or issued by an unauthorized issuer") };

    cb('next');
  } catch (e) { cb({ code: e.status, data: e.message }) };
});