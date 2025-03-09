// Import all dependencies ======================================================================================================================================================================================================>
// import { v4 as uuidv4 } from 'uuid';
// import cote from 'cote';
// import bcrypt from 'bcryptjs';
// import db from '../gateway/conf.postgres.mjs';
// const User = db.user;
// import { handleError } from './api.deborah.mjs';
// process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'signup-service'));
// process.on('uncaughtException', (err) => handleError('Error Exception', err, 'signup-service'));

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
// Здесь можно подключить конфигурацию базы данных, например:
// import db from './conf.postgres.mjs';

const PROTO_PATH = '../gateway/pipeline.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const pipelineProto = grpc.loadPackageDefinition(packageDefinition).pipeline;

function processData(call, callback) {
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

  // Выполнение логики регистрации пользователя.
  // Например, генерируем ID, хешируем пароль и сохраняем данные в БД.
  const userId = uuidv4();
  const hashedPassword = bcrypt.hashSync(body.password, 8);
  // Здесь должна быть логика сохранения пользователя в БД.
  // Для примера считаем, что пользователь успешно создан.
  reqData.context.signup = 'user created';

  // Возвращаем итоговый ответ
  callback(null, {
    code: 201,
    message: 'An Email sent to your account please verify',
    context: reqData.context,
    continuePipeline: false
  });
}

const server = new grpc.Server();
server.addService(pipelineProto.PipelineService.service, { Process: processData });
server.bindAsync('0.0.0.0:50053', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('SU service failed to bind:', err);
    process.exit(1);
  }
  console.log(`SU service running on port ${port}`);
});







// Module =======================================================================================================================================================================================================================>
// const su = new cote.Responder({ name: 'signup-service', namespace: 'signup' });
// su.on('signUp', async (req, cb) => {
//   try {
//     await User.create({ userId: uuidv4(), username: req.params.body.username, email: req.params.body.email, password: bcrypt.hashSync(req.params.body.password, 8) }).then(u => u.setRoles([1]));
    
//     cb({ code: 201, data: "An Email sent to your account please verify" });
//   } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
// });