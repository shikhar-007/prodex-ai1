const { EmailOtpQueue } = require('./index');
const { sendEmailOtp } = require('../utils/nodemailer');
const logger = require('log4js').getLogger('worker');

EmailOtpQueue.process(async (job) => {
  const { email, otp, purpose } = job.data.data;
  logger.info(
    `email queue running for purpose ${purpose}: ${JSON.stringify(email)}`
  );

  const result = await sendEmailOtp({ email, otp, purpose });
  if (result) {
    logger.info('Email sent successfully');
  } else {
    logger.info('Error sending email');
  }
});
