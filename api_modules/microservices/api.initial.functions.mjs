// Import all dependencies ======================================================================================================================================================================================================>
import axios from "axios"
import 'dotenv/config';
import redis from "../gateway/conf.redis.mjs";
import { loadInitialData } from "../gateway/conf.gateway.mjs"
import { handleStartMessage, handleError } from "./api.deborah.mjs"

// Module =======================================================================================================================================================================================================================>
export const initialSystem = async () => {
  try {
    try {
      redis.set('Dora:State', 'BFU');
      const resp = await axios.post('http://127.0.0.100:4430', { clientType: "backend", prjName: "Dora", preValidation: "API_KEY_FOR_BACK" });
      console.log(resp?.data);
      await redis.set('Dora:State', 'AFU');
    } catch (e) { console.log(`Cocoa First Initial Error, ${e}`) }

    await loadInitialData();

    const status = await redis.get('Dora:State')
    const buildVersion = '0D19M11Y24B'; // Version/day/month/year/stable
    const startLoadTimestamp = new Date();
    const version = '0.0.1';

    await handleStartMessage('Initialized', status, buildVersion, startLoadTimestamp, version);
  } catch (e) { handleError('Error', e, 'initial-functions' ) }
};
