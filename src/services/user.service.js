const User = require('../models/user.model');
const ChatSetting = require('../models/chat.setting.model');
const bcrypt = require('bcrypt');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const { SALT } = require('../../config/env');
const { generateOtp } = require('../utils/otp.helper');
const redisClient = require('../utils/redis.client').getClient();
const { addToEmailOtpQueue } = require('../jobs/queue');
const { encrypt } = require('../utils/encrypt.decrypt');
const logger = require('log4js').getLogger('auth_service');

class UserService {
  async changePassword(passwordDetails, user) {
    const password = await bcrypt.compare(
      passwordDetails.oldPassword,
      user.password
    );

    if (!password) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        'Old password does not match'
      );
    }

    if (passwordDetails.newPassword == passwordDetails.oldPassword) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        'New password cannot be same as old password'
      );
    }
    const hashedPassword = await bcrypt.hash(
      passwordDetails.newPassword,
      Number(SALT)
    );
    user.password = hashedPassword;
    await user.save();
    logger.info(`Password reset for ${user.email}`);
    return true;
  }

  async editProfileEmail(profileDetails, user) {
    if (profileDetails.email == user.email) {
      throw new HttpException(
        errorType.CONFLICT.status,
        'You are already using this email, please use a different email to update.'
      );
    }

    const isExistingEmail = await User.findOne({
      email: profileDetails.email,
    });

    if (isExistingEmail) {
      throw new HttpException(
        errorType.CONFLICT.status,
        'Email already exists, please use a different email to update.'
      );
    }

    const password = await bcrypt.compare(
      profileDetails.password,
      user.password
    );

    if (!password) {
      throw new HttpException(errorType.BAD_REQUEST.status, 'Wrong Password');
    }

    const otp = await generateOtp();
    const encryptedOtp = await encrypt(otp);
    const key = `email-change/${profileDetails.email}`;
    await redisClient.set(key, encryptedOtp, 'EX', 300);

    await addToEmailOtpQueue({
      email: profileDetails.email,
      otp,
      purpose: 'changeEmail',
    });

    return { message: 'Please verify the new email' };
  }

  async editProfileName(profileDetails, user) {
    user.name = profileDetails.name;
    await user.save();
    return { user, message: 'Name updated successfully' };
  }

  async deleteProfile(user) {
    if (!user) {
      throw new HttpException(errorType.NOT_FOUND.status, 'User not found');
    }
    await ChatSetting.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    return { message: 'User account deleted successfully' };
  }

  async getChatSetting(user) {
    const data = await ChatSetting.findOne({ userId: user._id });
    return {
      data,
      message: 'Chat setting retrieved',
    };
  }

  async updateChatSetting(chatDetails, user) {
    if (!user) {
      throw new HttpException(errorType.NOT_FOUND.status, 'User not found');
    }

    const setting = await ChatSetting.findOneAndUpdate(
      { userId: user._id },
      { $set: { ...chatDetails } },
      { new: true }
    );

    if (!setting) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'Chat settings not found'
      );
    }

    return {
      setting,
      message: 'Chat setting updated successfully',
    };
  }
}
module.exports = UserService;
