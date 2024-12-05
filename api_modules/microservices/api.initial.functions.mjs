// Import all dependencies ======================================================================================================================================================================================================>
import axios from "axios"
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import redis from "../gateway/conf.redis.mjs";
import { loadInitialData } from "../gateway/conf.gateway.mjs"
import { handleStartMessage, handleError } from "./api.deborah.mjs"

// Module =======================================================================================================================================================================================================================>
export const initialSystem = async () => {
  try {
    const token = jwt.sign({ clientType: 'backend', prjName: 'Dora', destinationIp: '127.0.0.10', destinationPort: 5000 }, "1dmscnj823?/dsad_02sdawq-ds", { algorithm: 'HS512', expiresIn: '1m' });
    const status = await redis.get('Dora:State')
    const buildVersion = '0D19M11Y24B'; // Version/day/month/year/stable
    const startLoadTimestamp = new Date();
    const version = '0.0.1';

    try {
      redis.set('Dora:State', 'BFU');
      const resp = await axios.post('http://127.0.0.100:4430', { "request": "backend" }, { 'x-proxy-token': token });
      console.log(resp?.data);
      await redis.set('Dora:State', 'AFU');
    } catch (e) { console.log(`Cocoa First Initial Error, ${e}`) }

    await loadInitialData();
    await handleStartMessage('Initialized', status, buildVersion, startLoadTimestamp, version);

  } catch (e) { handleError('Error', e, 'initial-functions' ) }
};