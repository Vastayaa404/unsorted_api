// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import jwt from 'jsonwebtoken';
import ApiError from './api.error.mjs';
import { handleError } from './api.deborah.mjs';
process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'create-token-service'));
process.on('uncaughtException', (err) => handleError('Error Exception', err, 'create-token-service'));

// Module =======================================================================================================================================================================================================================>
const ct = new cote.Responder({ name: 'create-token-service', namespace: 'create-token' });
ct.on('createToken', async (req, cb) => {
  try {
    const { id, username } = req.params.user;
    if (!id || !username || typeof id !== 'number' || typeof username !== 'string') throw new ApiError(422, "CT invalid user data");
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
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});