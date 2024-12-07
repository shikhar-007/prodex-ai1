const logger = require('log4js').getLogger('middleware');

const errorMiddleware = (error, req, res, next) => {
  const status = error?.status || 500;
  const message = error?.message || 'Something went wrong';

  logger.error(
    `[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${message}`
  );

  return res.status(status).json({ message, data: error.data });
};

module.exports = { errorMiddleware };
