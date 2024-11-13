// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import 'dotenv/config';
import nodemailer from 'nodemailer';
import ApiError from './api.error.mjs';
import { handleError } from './api.deborah.mjs';
process.on('unhandledRejection', (reason, promise) => handleError('Unhandled Rejection', reason, 'send-activate-link-service'));
process.on('uncaughtException', (err) => handleError('Uncaught Exception', err, 'send-activate-link-service'));

// Module =======================================================================================================================================================================================================================>
const sal = new cote.Responder({ name: 'send-activate-link-service', namespace: 'send-activate-link' });
const cmt = new cote.Requester({ name: 'create-mail-token-service', namespace: 'create-mail-token', timeout: 10000 }); // cmt.service
sal.on('sendActivateLink', async (req, cb) => {
  try {
    const date = new Date();
    const user = { username: req.params.body.username, created: date.toString() };
    const r = await new Promise(resolve => cmt.send({ type: 'createMailToken', params: { user } }, resolve)); if (r.code > 399) throw new ApiError(r.code, r.data);
    console.log(JSON.stringify(r))
    if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD || !process.env.MAIL_DOMAIN) throw new ApiError(501, "SAL an error occurred while receiving the secret keys");

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      },
    });

    // await transporter.sendMail({
    //   from: process.env.MAIL_DOMAIN,
    //   to: req.body.email,
    //   subject: "Verify Email",
    //   text: `Click on the link below to veriy your account: https://activate.vs.ru/${mailToken}`,
    // });

    cb('next');
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});