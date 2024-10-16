// Import all dependencies ======================================================================================================================================================================================================>
import axios from 'axios';
import 'dotenv/config'

// Module =======================================================================================================================================================================================================================>
export const handleError = async (event, error, service) => {
  const now = Date.now();
  const token = process.env.TG_API_BOT_KEY;
  const chatId = process.env.TG_API_CHAT_KEY;
  const text = encodeURIComponent(`Panicfull-${now}:\n\n${event} occurred: ${error.message}.\n\nMicroservice: ${service}\n\n---------- TRACEBACK ----------\n${error.stack}`);
  const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${text}`;

  try { await axios.post(url) } catch (e) { console.error('Error sending message to Telegram:', e.message) };
};