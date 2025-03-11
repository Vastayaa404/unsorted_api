// Import all dependencies ======================================================================================================================================================================================================>
// import nodemailer from 'nodemailer';
// import ApiError from './api.error.mjs';
// import { handleError } from './api.deborah.mjs';
// process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'send-activate-link-service'));
// process.on('uncaughtException', (err) => handleError('Error Exception', err, 'send-activate-link-service'));



import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import nodemailer from 'nodemailer';

const PROTO_PATH = '../gateway/pipeline.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const pipelineProto = grpc.loadPackageDefinition(packageDefinition).pipeline;
const suClient = new pipelineProto.PipelineService('localhost:50053', grpc.credentials.createInsecure()); // next service

async function processData(call, callback) {
  try {
    const reqData = call.request;
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD, MAIL_DOMAIN } = process.env;
    // if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASSWORD || !MAIL_DOMAIN) return callback(null, { code: 501, data: 'Mail service error' });

    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: false,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD
      },
    });

    // await transporter.sendMail({
    //   from: MAIL_DOMAIN,
    //   to: body.email,
    //   subject: "Verify Email",
    //   text: `Click on the link below to verify your account: 'this is link :3'/${body.email}`,
    // });

    const response = await new Promise((resolve, reject) => {
      suClient.Process(reqData, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    return callback(null, response);
  } catch (err) { return callback(err) }
}

const server = new grpc.Server();
server.addService(pipelineProto.PipelineService.service, { Process: processData });
server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('SAL service failed to bind:', err);
    process.exit(1);
  }
  console.log(`SAL service running on port ${port}`);
});
















// Module =======================================================================================================================================================================================================================>
// const sal = new cote.Responder({ name: 'send-activate-link-service', namespace: 'send-activate-link' });
// const cmt = new cote.Requester({ name: 'create-mail-token-service', namespace: 'create-mail-token', timeout: 10000 }); // cmt.service
// sal.on('sendActivateLink', async (req, cb) => {
//   try {
//     const date = new Date();
//     const user = { username: req.params.body.username, created: date.toString() };
//     const r = await new Promise(resolve => cmt.send({ type: 'createMailToken', params: { user } }, resolve)); if (r.code > 399) throw new ApiError(r.code, r.data);
//     if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD || !process.env.MAIL_DOMAIN) throw new ApiError(501, "SAL an error occurred while receiving the secret keys");

//     const transporter = nodemailer.createTransport({
//       host: process.env.MAIL_HOST,
//       port: process.env.MAIL_PORT,
//       secure: false,
//       auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASSWORD
//       },
//     });

//     // await transporter.sendMail({
//     //   from: process.env.MAIL_DOMAIN,
//     //   to: req.body.email,
//     //   subject: "Verify Email",
//     //   text: `Click on the link below to veriy your account: https://activate.vs.ru/${mailToken}`,
//     // });

//     cb('next');
//   } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
// });