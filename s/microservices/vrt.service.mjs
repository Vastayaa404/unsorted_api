// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import jwt from 'jsonwebtoken';
import db from '../../db_auth/models/index.mjs';
const Token = db.token;
const User = db.user;

// Module =======================================================================================================================================================================================================================>
const vrt = new cote.Responder({ name: 'verify-refresh-token-service', namespace: 'verify-refresh-token' });

vrt.on('verifyRefreshToken', async (req, cb) => {
  try {
    const token = req.params.cookies?.rt;
    if (!token) throw new Error('Token not found');

    jwt.verify(token, process.env.JWT_REFRESH_KEY, { issuer: 'Dora authorization service' }, async (err)=> { if (err) throw new Error(err) });

    if (!await Token.findOne({ where: { token } })) { throw new Error('Token invalid or issued by an unauthorized issuer') };

    cb('next');
  } catch (e) { cb({ error: e.message }) };
});