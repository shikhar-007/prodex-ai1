const OtpService = require('../services/otp.service');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const {
  validateVerifyEmail,
  validateForgotPassword,
} = require('../validators/otp.validator');
class OtpController {
  constructor() {
    this.otpService = new OtpService();
  }

  async verifyEmail(req, res) {
    const { error } = validateVerifyEmail(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    await this.otpService.verifyEmail(req.body);
    res.status(200).json({
      success: true,
      message: 'otp verified',
    });
  }

  async verifyForgotPassword(req, res) {
    const { error } = validateForgotPassword(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    await this.otpService.verifyForgotPassword(req.body);
    res.status(200).json({
      success: true,
      message: 'password updated ',
    });
  }

  async verifyChangeEmail(req, res) {
    const { error } = validateVerifyEmail(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    await this.otpService.verifyChangeEmail(req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Email changed , please login with new email',
    });
  }
}

module.exports = OtpController;
