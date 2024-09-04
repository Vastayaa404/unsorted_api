// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';

// Module =======================================================================================================================================================================================================================>
const ss = new cote.Responder({ name: 'status-service', namespace: 'status' });

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