// Import all dependencies ======================================================================================================================================================================================================>
import { v4 as uuidv4 } from 'uuid';
import cote from 'cote';
import bcrypt from 'bcryptjs';
import db from '../gateway/conf.postgres.mjs';
const User = db.user;
import { handleError } from './api.deborah.mjs';
process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'signup-service'));
process.on('uncaughtException', (err) => handleError('Error Exception', err, 'signup-service'));

// Module =======================================================================================================================================================================================================================>
const su = new cote.Responder({ name: 'signup-service', namespace: 'signup' });
su.on('signUp', async (req, cb) => {
  try {
    await User.create({ userId: uuidv4(), username: req.params.body.username, email: req.params.body.email, password: bcrypt.hashSync(req.params.body.password, 8) }).then(u => u.setRoles([1]));
    
    cb({ code: 201, data: "An Email sent to your account please verify" });
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});