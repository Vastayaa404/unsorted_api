import db from '../gateway/conf.postgres.mjs';
const User = db.user;
// import { handleError } from './api.deborah.mjs';
// process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'check-data-is-valid-service'));
// process.on('uncaughtException', (err) => handleError('Error Exception', err, 'check-data-is-valid-service'));

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_PATH = '../gateway/pipeline.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const pipelineProto = grpc.loadPackageDefinition(packageDefinition).pipeline;
const salClient = new pipelineProto.PipelineService('localhost:50052', grpc.credentials.createInsecure());

async function processData(call, callback) {
  try {
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
    if (!username || !email || !password) return callback(null, { code: 422, data: 'Invalid data: username, email, and password are required' });
    if (username.length < 3 || email.length < 6 || password.length < 8) return callback(null, { code: 400, data: 'Invalid data: fields are too short' });
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(password)) return callback(null, { code: 400, data: 'Invalid data: password does not meet complexity requirements' });

    const [user, mail] = await Promise.all([User.findOne({ where: { username } }), User.findOne({ where: { email } })]);
    if (user || mail) return callback(null, { code: 403, data: 'Username or email is already in use' });

    const response = await new Promise((resolve, reject) => {
      salClient.Process(reqData, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });

    return callback(null, response);
  } catch (err) { return callback(err) }
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