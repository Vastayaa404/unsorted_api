const headersConfig = (req, res, next) => {
  if (req.headers['x-dora-request-id']) { res.header("X-Dora-Request-Id", req.headers['x-dora-request-id']) }
  next();
};

export { headersConfig };