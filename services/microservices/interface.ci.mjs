// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import { handleError } from './api.deborah.mjs';

// Module =======================================================================================================================================================================================================================>
const ci = new cote.Responder({ name: 'collect-info-service', namespace: 'collect-info' });

process.on('unhandledRejection', (reason, promise) => handleError('Unhandled Rejection', reason, 'collect-info-service'));
process.on('uncaughtException', (err) => handleError('Uncaught Exception', err, 'collect-info-service'));
ci.on('collectInfo', async (req, cb) => {
  try {
    cb({ code: 200, data: "Hello" });
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});