// Module =======================================================================================================================================================================================================================>
const authHeadersConfig = (req, res, next) => {
  res.header("X-Powered-By", "Dora Authorization Service"); 
  next();
};

const projectHeadersConfig = (req, res, next) => {
  res.header("X-Powered-By", "Dora Lite Service");
  next();
};

const testHeadersConfig = (req, res, next) => {
  res.header("X-Powered-By", "Dora Dev Service");
  next();
};

const secHeadersConfig = (req, res, next) => {
  res.header("X-Powered-By", "Dora Security Service");
  next();
};

export { authHeadersConfig, projectHeadersConfig, testHeadersConfig, secHeadersConfig };