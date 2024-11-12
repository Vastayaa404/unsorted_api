// Import all dependencies ======================================================================================================================================================================================================>
import { v4 as uuidv4 } from 'uuid';

// Module =======================================================================================================================================================================================================================>
const corsConfig = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://weather-now.ru', 'https://www.weather-now.ru', '127.0.0.1', '127.0.0.100:4000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

const headersConfig = (req, res, next) => {
  // req.headers['X-Dora-Request-Id'] = uuidv4();
  req.headers['x-forwarded-for'] = req.headers['x-forwarded-for'];
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  // res.header['content-type'] = 'application/json';
  next();
};

export { corsConfig, headersConfig };