const AuthService = require('../services/auth.service');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const {
  validateSignup,
  validateLogin,
  commonAuthValidator,
} = require('../validators/auth.validator');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async signUp(req, res) {
    const { error } = validateSignup(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.authService.signUp(req.body);
    res.status(200).json({
      success: true,
      data: data,
      message: 'Signup successful',
    });
  }

  async login(req, res) {
    const { error } = validateLogin(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.authService.login(req.body);

    res
      .status(200)
      .json({ success: true, data: data.data, message: data.message });
  }

  async verifyUser(req, res) {
    const { error } = commonAuthValidator(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.authService.verifyUser(req.body);
    res.status(200).json({
      success: true,
      data: data,
      message: 'Otp sent on email',
    });
  }

  async forgotPassword(req, res, next) {
    const { error } = commonAuthValidator(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.authService.forgotPassword(req.body);
    res.status(200).json({
      success: true,
      data: data,
      message: 'Otp sent successfully',
    });
  }
}

module.exports = AuthController;
