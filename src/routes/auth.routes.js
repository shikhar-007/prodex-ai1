const { Router } = require('express');
const AuthController = require('../controllers/auth.controller');
const { authToken } = require('../middlewares/auth.middleware');

class AuthRoute {
  constructor() {
    this.path = '/api/auth/';
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      `${this.path}signup`,
      this.authController.signUp.bind(this.authController)
    );

    this.router.post(
      `${this.path}login`,
      this.authController.login.bind(this.authController)
    );

    this.router.post(
      `${this.path}verify-user`,
      this.authController.verifyUser.bind(this.authController)
    );

    this.router.post(
      `${this.path}forgot-password`,
      this.authController.forgotPassword.bind(this.authController)
    );
  }
}

module.exports = AuthRoute;
