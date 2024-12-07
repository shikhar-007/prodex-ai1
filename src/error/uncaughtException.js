const logger = require('log4js').getLogger('uncaughtException');

const catchUnhandledError = () => {
  process.on('uncaughtException', (exception) => {
    console.log('we got an Uncaughted Exception');
    logger.error(exception);
  });

  process.on('unhandledRejection', (rejection) => {
    console.log('we got an Unhandled Rejection');
    logger.error(rejection);
  });

  process.on('warning', (warning) => {
    console.log(warning.stack);
  });
};

module.exports = { catchUnhandledError };
