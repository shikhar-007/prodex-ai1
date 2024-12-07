const { SENDGRID_API_KEY, SENDGRID_EMAIL } = require('../../config/env');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const logger = require('log4js').getLogger('nodemailer');

const MAIL_SETTINGS = {
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: SENDGRID_API_KEY,
  },
};
const transporter = nodemailer.createTransport(MAIL_SETTINGS);

const sendEmailOtp = async ({ email, otp, purpose }) => {
  try {
    let htmlTemplate = '';
    let subject = '';
    switch (purpose) {
      case 'signup':
        const eoPath = path.join(__dirname, '../views/signUp.html');
        htmlTemplate = fs.readFileSync(eoPath, 'utf8');
        htmlTemplate = htmlTemplate.replace('{{email}}', email);
        htmlTemplate = htmlTemplate.replace('{{otp}}', otp);
        subject = 'Verify Your Email Adddress Otp';
        break;
      case 'forgotpass':
        const fpPath = path.join(__dirname, '../views/forgotPassword.html');
        htmlTemplate = fs.readFileSync(fpPath, 'utf8');
        htmlTemplate = htmlTemplate.replace('{{email}}', email);
        htmlTemplate = htmlTemplate.replace('{{otp}}', otp);
        subject = 'Reset Your Password Otp';
        break;
      case 'changeEmail':
        const ecPath = path.join(__dirname, '../views/changeEmail.html');
        htmlTemplate = fs.readFileSync(ecPath, 'utf8');
        htmlTemplate = htmlTemplate.replace('{{email}}', email);
        htmlTemplate = htmlTemplate.replace('{{otp}}', otp);
        subject = 'Verify Your Change Email Adddress Otp';
        break;
      default:
        logger.error('Invalid email purpose');
    }

    const mailOptions = {
      from: SENDGRID_EMAIL,
      to: email,
      subject: subject,
      html: htmlTemplate,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`✅  Mail sent`, email, info.messageId);
    return true;
  } catch (error) {
    logger.error(' ❌ Error in sending email >> %O', error);
    return false;
  }
};
module.exports = { sendEmailOtp };
