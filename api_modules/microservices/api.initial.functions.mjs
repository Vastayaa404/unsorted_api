// Import all dependencies ======================================================================================================================================================================================================>
import axios from "axios"
import 'dotenv/config';
import redis from "../databases/index.redis.mjs";
import { loadInitialData } from "../gateway/conf.gateway.mjs"
import { handleStartMessage, handleError } from "./api.deborah.mjs"

// Module =======================================================================================================================================================================================================================>
export const initial = async () => {
  try {
    try {
      redis.set('Dora:State', 'BFU');
      const resp = await axios.post('http://127.0.0.100:4000', { clientType: "backend", prjName: "Dora", preValidation: "API_KEY_FOR_BACK" });
      const { sessionID, backendIP } = resp?.data;
      console.log(sessionID, backendIP)
      await redis.set('Dora:State', 'AFU');
    } catch (e) { console.log(`Axios First Initial Error, ${e}`) }

    await loadInitialData();

    const status = await redis.get('Dora:State')
    const buildVersion = '0D19M11Y24B'; // Version/day/month/year/stable
    const startLoadTimestamp = new Date();
    const version = '0.0.1';

    await handleStartMessage('Initialized', status, buildVersion, startLoadTimestamp, version);
  } catch (e) { handleError('Error', e, 'initial-functions' ) }
};