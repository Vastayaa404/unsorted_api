// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import bcrypt from 'bcryptjs';
import db from '../../db_auth/models/index.mjs';
const Token = db.token;
const User = db.user;

// Module =======================================================================================================================================================================================================================>
const si = new cote.Responder({ name: 'signin-service', namespace: 'signin' });
const ct = new cote.Requester({ name: 'create-token-service', namespace: 'create-token', timeout: 10000 }); // ct.service

si.on('signIn', async (req, cb) => {
  try {
    if (!req.params.body) throw new Error("No Data Detected. Aborting")
    const { username, password } = req.params.body;
    if (!username || !password) throw new Error("DTO not found");

    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) { throw new Error("Invalid Username or Password") };
    if (user.isBanned === "true") throw new Error("Your account has been deactivated.");

    const r = await new Promise(resolve => ct.send({ type: 'createToken', params: { user } }, resolve)); if (r.error) throw new Error(r.error);
    const { accessToken, refreshToken } = r;
    await Token.destroy({ where: { username } });
    await Token.create({ userId: user.id, username, token: refreshToken });

    cb({ username, accessToken, refreshToken });
  } catch (e) { cb({ error: e.message }) };
});