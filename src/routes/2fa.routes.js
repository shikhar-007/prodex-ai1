const { Router } = require('express');
const TwoFactorAuthController = require('../controllers/2fa.controller');
const { authToken } = require('../middlewares/auth.middleware');

class TwoFARoute {
  constructor() {
    this.path = '/api/2fa/';
    this.router = Router();
    this.tfaController = new TwoFactorAuthController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      `${this.path}setup2fa`,
      authToken,
      this.tfaController.setup2fa.bind(this.tfaController)
    );

    this.router.put(
      `${this.path}verify2fa`,
      authToken,
      this.tfaController.verify2fa.bind(this.tfaController)
    );

    this.router.post(
      `${this.path}validate2fa`,
      this.tfaController.validate2fa.bind(this.tfaController)
    );

    this.router.post(
      `${this.path}disable2fa`,
      authToken,
      this.tfaController.disable2fa.bind(this.tfaController)
    );
  }
}

module.exports = TwoFARoute;
