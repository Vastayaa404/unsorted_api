// Import all dependencies ======================================================================================================================================================================================================>
import axios from 'axios';
import cote from 'cote';
import 'dotenv/config';
import redis from '../../db_redis/models/index.mjs';

// Module =======================================================================================================================================================================================================================>
const ws = new cote.Responder({ name: 'weather-service', namespace: 'weather' });

ws.on('getWeather', async (req, cb) => {
  try {
    if (!req.params.body || !req.params.body.city) return cb({ code: 400, data: 'Invalid JSON data' })//throw new Error('Invalid JSON data');
    const cacheKey = `weather:${req.params.body.city}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return cb({ state: 304, data: JSON.parse(cachedData) });

    const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${req.params.body.city}&appid=${process.env.WEA_API_KEY}`);
    const filteredData = {
      city: req.params.body.city.charAt(0).toUpperCase() + req.params.body.city.slice(1).toLowerCase(),
      country: data.sys.country,
      temp: Math.round(data.main.temp - 273.15),
      weather: data.weather[0].main,
    };

    await redis.set(cacheKey, JSON.stringify(filteredData), 'EX', 1800);
    cb({ state: 200, data: filteredData });
  } catch (e) { cb({ code: e.status, data: e.message }) };//catch (e) { cb({ error: { code: e.response?.status || 504, data: e.message/*"Service Unavailable"*/ } }) };
});