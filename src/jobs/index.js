const Queue = require('bull');
const { REDIS_HOST, REDIS_PORT } = require('../../config/env');

const redisConfig = {
  redis: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
};
const EmailOtpQueue = new Queue('EmailOtpQueue', redisConfig);

module.exports = {
  EmailOtpQueue,
};
