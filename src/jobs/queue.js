const { EmailOtpQueue } = require('./index');
const logger = require('log4js').getLogger('queue');

const addToEmailOtpQueue = async (data) => {
  await EmailOtpQueue.add({ data });
  logger.info(`Email job added to the queue for email-address: ${data.email}`);
};

module.exports = { addToEmailOtpQueue };