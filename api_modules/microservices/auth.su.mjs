// import { handleError } from './api.deborah.mjs';
// process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'signup-service'));
// process.on('uncaughtException', (err) => handleError('Error Exception', err, 'signup-service'));

import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../gateway/conf.postgres.mjs';
const User = db.user;

const PROTO_PATH = '../gateway/pipeline.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true });
const pipelineProto = grpc.loadPackageDefinition(packageDefinition).pipeline;

async function processData(call, callback) {
  try {
    const reqData = call.request;
    const body = JSON.parse(reqData.body);
    
    await User.create({ userId: uuidv4(), username: body.username, email: body.email, password: bcrypt.hashSync(body.password, 8) }).then(u => u.setRoles([1]));

    return callback(null, { code: 201, data: 'An Email sent to your account please verify' });
  } catch (err) { return callback(err) }
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