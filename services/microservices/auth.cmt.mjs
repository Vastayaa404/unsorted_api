// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import ApiError from './api.error.mjs';

// Module =======================================================================================================================================================================================================================>
const cmt = new cote.Responder({ name: 'create-mail-token-service', namespace: 'create-mail-token' });

cmt.on('createMailToken', async (req, cb) => {
  try {
    const { created, username } = req.params.user;
    if (!created || !username || typeof created !== 'string' || typeof username !== 'string') throw new ApiError(422, "CMT invalid user data");
    if (!process.env.JWT_MAIL_KEY) throw new ApiError(501, "CMT an error occurred while receiving the secret keys");

    const mailToken = jwt.sign({ created, username }, process.env.JWT_MAIL_KEY, {
      algorithm: 'HS256',
      expiresIn: 600, // 10m valid
      issuer: 'Dora email service'
    });

    cb({ code: 201, data: { mailToken } });
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});