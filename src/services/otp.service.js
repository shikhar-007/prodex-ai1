const { decrypt } = require('../utils/encrypt.decrypt');
const bcrypt = require('bcrypt');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const redisClient = require('../utils/redis.client').getClient();
const User = require('../models/user.model');
const logger = require('log4js').getLogger('otp_service');

class OtpService {
  async verifyEmail({ otp, email }) {
    const user = await User.findOne({ email });

    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        ' User Does not exist.'
      );
    }

    const key = `email/${email}`;
    const storedOtp = await redisClient.get(key);

    if (!storedOtp) {
      throw new HttpException(
        errorType.GONE.status,
        "'Otp expired , Please resend again'"
      );
    }
    const decryptOtp = await decrypt(storedOtp);
    if (otp != decryptOtp) {
      throw new HttpException(errorType.UNAUTHORIZED.status, 'Invalid Otp');
    }

    user.emailVerified = true;
    await user.save();
    await redisClient.del(key);
    return true;
  }

  async verifyForgotPassword({ email, otp, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        ' User Does not exist.'
      );
    }

    const key = `forgotpass/${email}`;
    const storedOtp = await redisClient.get(key);

    if (!storedOtp) {
      throw new HttpException(
        errorType.GONE.status,
        "'Otp expired , Please resend again'"
      );
    }
    const decryptOtp = await decrypt(storedOtp);
    if (otp != decryptOtp) {
      throw new HttpException(errorType.UNAUTHORIZED.status, 'Invalid Otp');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();
    await redisClient.del(key);
    return true;
  }

  async verifyChangeEmail({ email, otp }, user) {
    const ifExistingEmail = await User.findOne({ email });

    if (ifExistingEmail) {
      throw new HttpException(
        errorType.CONFLICT.status,
        'Email already exists'
      );
    }
    const key = `email-change/${email}`;
    const storedOtp = await redisClient.get(key);

    if (!storedOtp) {
      throw new HttpException(
        errorType.GONE.status,
        "'Otp expired , Please resend again'"
      );
    }
    const decryptOtp = await decrypt(storedOtp);
    if (otp != decryptOtp) {
      throw new HttpException(errorType.UNAUTHORIZED.status, 'Invalid Otp');
    }

    user.email = email;
    user.emailVerified = true;
    await user.save();
    await redisClient.del(key);
    return true;
  }
}

module.exports = OtpService;
