// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import ApiError from './api.error.mjs';
import { handleError } from './api.deborah.mjs';
process.on('unhandledRejection', (reason, promise) => handleError('Error Rejection', reason, 'log-csp-violation-service'));
process.on('uncaughtException', (err) => handleError('Error Exception', err, 'log-csp-violation-service'));

// Module =======================================================================================================================================================================================================================>
const lcv = new cote.Responder({ name: 'log-csp-violation-service', namespace: 'log-csp-violation' });
lcv.on('logCSPViolation', async (req, cb) => {
  try {
    if (!req.params || !req.params.body) throw new ApiError(422, "No report data");

    const violationReport = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, userAgent, ipAddress, ...violationReport };

    fs.appendFile('/var/www/csp-violations.log', JSON.stringify(logEntry) + '\n', (e) => { if (e) throw new ApiError(599, e.message) });

    cb({ code: 201, data: "Violation report collected" });
  } catch (e) { cb({ code: e?.status || 503, data: e.message }) };
});