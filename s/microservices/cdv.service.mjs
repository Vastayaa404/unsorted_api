// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import db from '../../db_auth/models/index.mjs';
const User = db.user;

// Module =======================================================================================================================================================================================================================>
const cdv = new cote.Responder({ name: 'check-data-is-valid-service', namespace: 'check-data-is-valid' });

cdv.on('checkDataIsValid', async (req, cb) => {
  try {
    if (!req.params || !req.params.body) throw new Error("No Data Detected. Aborting");
    const { username, email, password } = req.params.body;
    if (!username || !email || !password) throw new Error("Invalid data on CDV. Aborting");

    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') { throw new Error("Invalid req fields detected. Aborting") };

    if (username.length < 3 || email.length < 6 || password.length < 8) { throw new Error("Invalid req fields detected (low length). Aborting") };

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]|[_]).{8,}$/.test(password)) { throw new Error("Invalid req fields detected (invalid structure). Aborting") };

    const [user, mail] = await Promise.all([User.findOne({ where: { username } }), User.findOne({ where: { email } }) ]);
    if (user || mail) { throw new Error(user ? "Failed! Username is already in use!" : "Failed! Email is already in use!") };

    cb('next');
  } catch (e) { cb({ error: e.message }) };
});