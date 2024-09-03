// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

// Module =======================================================================================================================================================================================================================>
const cmt = new cote.Responder({ name: 'create-mail-token-service', namespace: 'create-mail-token' });

cmt.on('createMailToken', async (req, cb) => {
  try {
    const { created, username } = req.params.user;
    if (!created || !username || typeof created !== 'string' || typeof username !== 'string') { throw new Error('Invalid user data in CMT') /* return cb({ error: 'Invalid user data in CMT' }) */ };

    const mailToken = jwt.sign({ created, username }, process.env.JWT_MAIL_KEY, {
      algorithm: 'HS256',
      expiresIn: 600, // 10m valid
      issuer: 'Dora email service'
    });

    cb({ mailToken });
  } catch (e) { cb({ error: e.message }) };
});