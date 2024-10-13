// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import { handleError } from '../../deborah/panic.functions.mjs';

// Module =======================================================================================================================================================================================================================>
const ss = new cote.Responder({ name: 'status-service', namespace: 'status' });

process.on('unhandledRejection', (reason, promise) => handleError('Unhandled Rejection', reason));
process.on('uncaughtException', (err) => handleError('Uncaught Exception', err));
ss.on('getStatus', async (body, cb) => {
  console.log('Получил запрос на получение status');
  const result = await new Promise((resolve, reject) => {
    setTimeout(() => {
      const a = { status: 'ok' };
      console.log(`Выполнил таймер, ${JSON.stringify(a)}`);
      resolve(a);
    }, 1000);
  });
  cb(result);
});