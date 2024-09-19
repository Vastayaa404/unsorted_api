// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import ApiError from './api.error.mjs';

// Module =======================================================================================================================================================================================================================>
const ct = new cote.Responder({ name: 'create-token-service', namespace: 'create-token' });

ct.on('createToken', async (req, cb) => {
  try {
    const { id, username } = req.params.user;
    if (!id || !username || typeof id !== 'number' || typeof username !== 'string') throw new ApiError(400, "CT invalid user data");
    if (!process.env.JWT_ACCESS_KEY || !process.env.JWT_REFRESH_KEY) throw new ApiError(501, "CT an error occurred while receiving the secret keys");

    const accessToken = jwt.sign({ id, username }, process.env.JWT_ACCESS_KEY, {
      algorithm: 'HS256',
      expiresIn: 3600,
      issuer: 'Dora authorization service'
    });

    const refreshToken = jwt.sign({ id, username }, process.env.JWT_REFRESH_KEY, {
      algorithm: 'HS256',
      expiresIn: 86400,
      issuer: 'Dora authorization service'
    });

    cb({ code: 201, data: { accessToken, refreshToken } });
  } catch (e) { cb({ code: e.status, data: e.message }) };
});