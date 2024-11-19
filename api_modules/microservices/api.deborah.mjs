// Import all dependencies ======================================================================================================================================================================================================>
import 'dotenv/config';
import axios from 'axios';

// Module =======================================================================================================================================================================================================================>
const sendTelegramMessage = async (text) => {
  try {
    const token = process.env.TG_API_BOT_KEY;
    const chatId = process.env.TG_API_CHAT_KEY;
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
    await axios.post(url);
  } catch (e) { console.error('Error sending message to Telegram:', e.message) };
};

export const handleError = async (event, error, service) => {
  const now = Date.now(); const text = `Panicfull-${now}:\n\n${event} occurred: ${error.message}.\n\nTarget: Dora\nMicroservice: ${service}\n\n---------- TRACEBACK ----------\n${error.stack}\n---------- END  STACK ----------`;
  try { await sendTelegramMessage(text) } catch (e) { console.log(`Deborah Critical Error, ${e.message}`) };
};

export const handleStartMessage = async (msg, status, buildVersion, startLoadTimestamp, version) => {
  const text = `System Started ( DORA ${version} ) Message:\n\nBackend System Status: ${status}.\nSystem build: ${buildVersion}\nItem Version: ${version}\n\nStarted at: ${startLoadTimestamp}\n---------- END  STACK ----------`;
  try { await sendTelegramMessage(text) } catch (e) { console.log(`Deborah Critical Error, ${e.message}`) };
};