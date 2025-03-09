// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import db from '../gateway/conf.postgres.mjs';
const User = db.user;
import ApiError from './api.error.mjs';
import { handleError } from './api.deborah.mjs';
// process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'check-data-is-valid-service'));
// process.on('uncaughtException', (err) => handleError('Error Exception', err, 'check-data-is-valid-service'));

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = '../gateway/pipeline.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const pipelineProto = grpc.loadPackageDefinition(packageDefinition).pipeline;

// Клиент для следующего микросервиса (SAL)
const salClient = new pipelineProto.PipelineService('localhost:50052', grpc.credentials.createInsecure());

function processData(call, callback) {
  console.log('Попадание в cdv')
  
  const reqData = call.request;
  let body;
  try {
    body = JSON.parse(reqData.body);
  } catch (e) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      details: 'Invalid JSON body'
    });
  }

  // Валидация данных
  const { username, email, password } = body;
  if (!username || !email || !password) {
    console.log('ok?')
    return callback(null, {
      code: 422,
      message: 'Invalid data: username, email, and password are required',
      context: {},
      continuePipeline: false
    });
    console.log('ok!')
  }
  console.log('Конец cdv')
  if (username.length < 3 || email.length < 6 || password.length < 8) {
    return callback(null, {
      code: 400,
      message: 'Invalid data: fields are too short',
      context: {},
      continuePipeline: false
    });
  }
  console.log('Конец cdv')
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password)) {
    return callback(null, {
      code: 400,
      message: 'Invalid data: password does not meet complexity requirements',
      context: {},
      continuePipeline: false
    });
  }
  console.log('Конец cdv')

  // Здесь можно добавить асинхронные проверки (например, поиск пользователя в базе)
  reqData.context.validation = 'passed';

  // Передаем обработку следующему сервису (SAL)
  salClient.Process(reqData, (err, res) => {
    if (err) return callback(err);
    callback(null, res);
  });
}

const server = new grpc.Server();
server.addService(pipelineProto.PipelineService.service, { Process: processData });
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('CDV service failed to bind:', err);
    process.exit(1);
  }
  console.log(`CDV service running on port ${port}`);
});








// Module =======================================================================================================================================================================================================================>
// const cdv = new cote.Responder({ name: 'check-data-is-valid-service', namespace: 'check-data-is-valid' });
// cdv.on('checkDataIsValid', async (req, cb) => {
//   try {
//     if (!req.params || !req.params.body) throw new ApiError(400, "No Data Detected. Aborting");
//     const { username, email, password } = req.params.body;
//     if (!username || !email || !password) throw new ApiError(422, "Invalid data on CDV. Aborting");
//     if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') throw new ApiError(400, "Invalid req fields detected. Aborting");
//     if (username.length < 3 || email.length < 6 || password.length < 8) throw new ApiError(400, "Invalid req fields detected (low length). Aborting");
//     if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]|[_]).{8,}$/.test(password)) throw new ApiError(400, "Invalid fields detected (invalid passwd structure). Aborting");

//     const [user, mail] = await Promise.all([User.findOne({ where: { username } }), User.findOne({ where: { email } }) ]);
//     if (user || mail) throw new ApiError(403, user ? "Failed! Username is already in use!" : "Failed! Email is already in use!"); 

//     cb('next');
//   } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
// });