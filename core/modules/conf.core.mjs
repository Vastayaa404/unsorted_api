// Import all dependencies ======================================================================================================================================================================================================>
import { v4 as uuidv4 } from 'uuid';

// Module =======================================================================================================================================================================================================================>
const corsConfig = {
  origin: ['http://localhost:9000', 'https://weather-now.ru', 'https://www.weather-now.ru'],
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

const headersConfig = (req, res, next) => {
  req.headers['X-Dora-Request-Id'] = uuidv4();
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("X-Powered-By", "Dora");
  next();
};

export { corsConfig, headersConfig };