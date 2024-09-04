// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import bcrypt from 'bcryptjs';
import db from '../../db_auth/models/index.mjs';
const Token = db.token;
const User = db.user;
import ApiError from './middleware.errors.mjs';

// Module =======================================================================================================================================================================================================================>
const si = new cote.Responder({ name: 'signin-service', namespace: 'signin' });
const ct = new cote.Requester({ name: 'create-token-service', namespace: 'create-token', timeout: 10000 }); // ct.service

si.on('signIn', async (req, cb) => {
  try {
    if (!req.params.body) throw new ApiError(400, "No Data Detected. Aborting")
    const { username, password } = req.params.body;
    if (!username || !password) throw new ApiError(400, "DTO not found");

    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) { throw new ApiError(400, "Invalid Username or Password") };
    if (user.isBanned === "true") throw new ApiError(403, "Your account has been deactivated.");

    const r = await new Promise(resolve => ct.send({ type: 'createToken', params: { user } }, resolve)); if (r.code > 399) throw new ApiError(r.code, r.data);
    const { accessToken, refreshToken } = r.data;
    await Token.destroy({ where: { username } });
    await Token.create({ userId: user.id, username, token: refreshToken });

    cb({ code: 200, data: { username, accessToken, refreshToken } });
  } catch (e) { cb({ code: e.status, data: e.message }) };
});