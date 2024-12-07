const { Router } = require('express');
const OtpController = require('../controllers/otp.controller');
const { authToken } = require('../middlewares/auth.middleware');

class OtpRoute {
  constructor() {
    this.path = '/api/otp/';
    this.router = Router();
    this.otpController = new OtpController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}verifyEmail`,
      this.otpController.verifyEmail.bind(this.otpController)
    );

    this.router.post(
      `${this.path}verifyForgotPassword`,
      this.otpController.verifyForgotPassword.bind(this.otpController)
    );

    this.router.post(
      `${this.path}verifyChangeEmail`,
      authToken,
      this.otpController.verifyChangeEmail.bind(this.otpController)
    );
  }
}
module.exports = OtpRoute;
