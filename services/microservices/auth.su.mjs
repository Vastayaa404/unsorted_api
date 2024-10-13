// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import bcrypt from 'bcryptjs';
import db from '../../db_auth/models/index.mjs';
const User = db.user;
import { v4 as uuidv4 } from 'uuid';
import { handleError } from '../../deborah/panic.functions.mjs';

// Module =======================================================================================================================================================================================================================>
const su = new cote.Responder({ name: 'signup-service', namespace: 'signup' });

process.on('unhandledRejection', (reason, promise) => handleError('Unhandled Rejection', reason));
process.on('uncaughtException', (err) => handleError('Uncaught Exception', err));
su.on('signUp', async (req, cb) => {
  try {
    await User.create({ userId: uuidv4(), username: req.params.body.username, email: req.params.body.email, password: bcrypt.hashSync(req.params.body.password, 8) }).then(u => u.setRoles([1]));
    
    cb({ code: 201, data: "An Email sent to your account please verify" });
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});