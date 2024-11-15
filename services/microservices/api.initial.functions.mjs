// Import all dependencies ======================================================================================================================================================================================================>
import { loadInitialData } from "../../gateway/modules/conf.gateway.mjs"
import { handleStartMessage, handleError } from "./api.deborah.mjs"

// Module =======================================================================================================================================================================================================================>
export const initial = async () => {
  try {
    const status = 'BFU' // Before First Unlock / After First Unlock
    const buildVersion = '0D11M13Y24B' // Version/day/month/year/stable
    const startLoadTimestamp = new Date();
    const version = '0.0.1'
  
    // await loadInitialData();
    async function loadInitialData() {
      throw new Error('Failed to load initial data'); // Искусственная ошибка
    }
    
    // Немедленный вызов асинхронной функции на верхнем уровне, но без обработки
    (async () => {
      await loadInitialData();
    })();

    await handleStartMessage('Initialized', status, buildVersion, startLoadTimestamp, version)
  } catch (e) { handleError('Error', e, 'initial-functions' ) }
}