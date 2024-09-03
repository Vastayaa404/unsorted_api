// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import nodemailer from 'nodemailer';

// Module =======================================================================================================================================================================================================================>
const sal = new cote.Responder({ name: 'send-activate-link-service', namespace: 'send-activate-link' });
const cmt = new cote.Requester({ name: 'create-mail-token-service', namespace: 'create-mail-token', timeout: 10000 }); // cmt.service

sal.on('sendActivateLink', async (req, cb) => {
  try {
    const date = new Date();
    const user = { "username": req.params.body.username, "created": date.toString() };
    console.log(`user: ${JSON.stringify(user)}`)
    const r = await new Promise(resolve => cmt.send({ type: 'createMailToken', params: { user } }, resolve)); if (r.error) throw new Error(r.error);
    //const mailToken = authJwt.createMailToken(data);
    console.log(`r: ${JSON.stringify(r)}`)

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
    //   text: `Click on the link below to veriy your account: http://localhost:5000/api/auth/activate/${mailToken}`,
    // });

    console.log("email sent successfully");
    
    //throw new Error('Controlled error');
    cb('next');
  } catch (e) { cb({ error: e.message }) };
});