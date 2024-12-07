const User = require('../models/user.model');
const LoginHistory = require('../models/login.history.model');
const ChatSetting = require('../models/chat.setting.model');
const bcrypt = require('bcrypt');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const logger = require('log4js').getLogger('auth_service');
const { generateOtp } = require('../utils/otp.helper');
const redisClient = require('../utils/redis.client').getClient();
const { SALT } = require('../../config/env');
const { addToEmailOtpQueue } = require('../jobs/queue');
const { encrypt } = require('../utils/encrypt.decrypt');

class AuthService {
  async signUp(signupDetails) {
    let user = await User.findOne({ email: signupDetails.email });

    if (user) {
      throw new HttpException(
        errorType.CONFLICT.status,
        'Email already exists , Please use different email'
      );
    }

    const hashedPassword = await bcrypt.hash(
      signupDetails.password,
      Number(SALT)
    );

    user = await User.create({
      name: signupDetails.name,
      email: signupDetails.email,
      password: hashedPassword,
    });

    await ChatSetting.create({
      userId: user._id,
    });
    const otp = await generateOtp();
    const encryptedOtp = await encrypt(otp);
    const key = `email/${signupDetails.email}`;
    await redisClient.set(key, encryptedOtp, 'EX', 300);
    await addToEmailOtpQueue({
      email: signupDetails.email,
      otp,
      purpose: 'signup',
    });
    logger.info(`User registered with ${user.email}`);
    return user;
  }

  async login(loginDetails) {
    const user = await User.findOne({ email: loginDetails.email });
    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'User Does not exist.'
      );
    }

    const password = await bcrypt.compare(loginDetails.password, user.password);
    if (!password) {
      throw new HttpException(
        errorType.UNAUTHORIZED.status,
        'Invalid Password'
      );
    }

    if (!user.emailVerified) {
      return {
        data: { emailVerified: false },
        message: `Please verify your email first`,
      };
    }

    const location = `${loginDetails.city}, ${loginDetails.regionName}, ${loginDetails.country}`;
    const device = `${loginDetails.device} / ${loginDetails.os} / ${loginDetails.browser}`;
    await LoginHistory.create({
      device: device,
      ip: loginDetails.ip,
      location: location,
      userId: user._id,
    });
    const token = await user.generateAuthToken();
    logger.info(
      `User logged in successfully with email ${loginDetails.email}, location ${location}, ip ${loginDetails.ip}, device ${device}`
    );
    return { data: { token, user }, message: 'Login Successfull' };
  }

  async verifyUser({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'User Does not exist.'
      );
    }
    if (user.emailVerified) {
      throw new HttpException(
        errorType.CONFLICT.status,
        'Email already verified'
      );
    }
    const otp = await generateOtp();
    const encryptedOtp = await encrypt(otp);
    const key = `email/${email}`;
    await redisClient.set(key, encryptedOtp, 'EX', 300);
    await addToEmailOtpQueue({ email, otp, purpose: 'signup' });
    return true;
  }

  async forgotPassword({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'User Does not exist.'
      );
    }

    if (!user.emailVerified) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        'You cannot reset password untill your email is verified'
      );
    }
    const otp = await generateOtp();
    const encryptedOtp = await encrypt(otp);
    const key = `forgotpass/${email}`;
    await redisClient.set(key, encryptedOtp, 'EX', 300);
    await addToEmailOtpQueue({ email, otp, purpose: 'forgotpass' });
    return true;
  }
}

module.exports = AuthService;
