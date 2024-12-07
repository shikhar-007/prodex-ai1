const TwoFactorAuthService = require('../services/2fa.service');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const {
  validateVerify2fa,
  validateValidate2fa,
  validateDisable2fa,
} = require('../validators/2fa.validator');

class TwoFactorAuthController {
  constructor() {
    this.tfaService = new TwoFactorAuthService();
  }

  async setup2fa(req, res) {
    const secretCode = await this.tfaService.setup2fa(req.user);
    res.status(200).json({
      success: true,
      data: {
        secret: secretCode.otpauthUrl,
        secretKey: secretCode.base32,
      },
    });
  }

  async verify2fa(req, res) {
    const { error } = validateVerify2fa(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    await this.tfaService.verify2fa(req.body, req.user);

    res.status(200).json({
      success: true,
      message: 'User is successfully verified',
    });
  }

  async validate2fa(req, res) {
    const { error } = validateValidate2fa(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    const data = await this.tfaService.validate2fa(req.body);
    res.status(200).json({
      success: true,
      data: data.admin,
      message: data.message,
    });
  }

  async disable2fa(req, res) {
    const { error } = validateDisable2fa(req.body);
    if (error) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        error.details[0].message
      );
    }
    await this.tfaService.disable2fa(req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'User Disabled Successfully',
    });
  }
}

module.exports = TwoFactorAuthController;
