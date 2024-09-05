// Import all dependencies ======================================================================================================================================================================================================>
import cote from 'cote';
import ApiError from './api.error.mjs';

// Module =======================================================================================================================================================================================================================>
const lcv = new cote.Responder({ name: 'log-csp-violation-service', namespace: 'log-csp-violation' });

lcv.on('logCSPViolation', async (req, cb) => {
  try {
    if (!req.params || !req.params.body) throw new ApiError(400, "No report detected");
    
    const violationReport = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, userAgent, ipAddress, ...violationReport };

    fs.appendFile('/var/www/csp-violations.log', JSON.stringify(logEntry) + '\n', (e) => { if (e) throw new ApiError(599, e.message) });

    cb({ code: 201, data: "Violation report collected" });
  } catch (e) { cb({ code: e.status, data: e.message }) };
});