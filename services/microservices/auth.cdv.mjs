// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import db from '../../db_auth/models/index.mjs';
const User = db.user;
import ApiError from './api.error.mjs';
import { handleError } from '../../deborah/panic.functions.mjs';

// Module =======================================================================================================================================================================================================================>
const cdv = new cote.Responder({ name: 'check-data-is-valid-service', namespace: 'check-data-is-valid' });

process.on('unhandledRejection', (reason, promise) => handleError('Unhandled Rejection', reason));
process.on('uncaughtException', (err) => handleError('Uncaught Exception', err));
cdv.on('checkDataIsValid', async (req, cb) => {
  try {
    if (!req.params || !req.params.body) throw new ApiError(400, "No Data Detected. Aborting");
    const { username, email, password } = req.params.body;
    if (!username || !email || !password) throw new ApiError(422, "Invalid data on CDV. Aborting");
    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') throw new ApiError(400, "Invalid req fields detected. Aborting");
    if (username.length < 3 || email.length < 6 || password.length < 8) throw new ApiError(400, "Invalid req fields detected (low length). Aborting");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]|[_]).{8,}$/.test(password)) throw new ApiError(400, "Invalid fields detected (invalid passwd structure). Aborting");

    const [user, mail] = await Promise.all([User.findOne({ where: { username } }), User.findOne({ where: { email } }) ]);
    if (user || mail) throw new ApiError(403, user ? "Failed! Username is already in use!" : "Failed! Email is already in use!"); 

    cb('next');
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});