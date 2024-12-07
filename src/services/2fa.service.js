const TwoFactorAuthHelper = require('../utils/2fa.helper');
const User = require('../models/user.model');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const { encrypt, decrypt } = require('../utils/encrypt.decrypt');
const logger = require('log4js').getLogger('2fa_service');

const tfaHelper = new TwoFactorAuthHelper();

class TwoFactorAuthService {
  async setup2fa(user) {
    if (user.totpFlag) {
      throw new HttpException(
        errorType.CONFLICT.status,
        `TOTP is already bound for this user`
      );
    }
    const secretCode = tfaHelper.generateSecret(user.email);
    return secretCode;
  }

  async verify2fa(verifyDetails, user) {
    if (user.totpFlag) {
      throw new HttpException(
        errorType.CONFLICT.status,
        `TOTP is already bound for this user`
      );
    }
    const { otp, secretKey } = verifyDetails;
    const isVerified = tfaHelper.verifyTwoFactorAuthCode(otp, secretKey);
    if (!isVerified) {
      throw new HttpException(errorType.UNAUTHORIZED.status, 'Invalid Token');
    }

    const encryptedSecretKey = await encrypt(secretKey);

    await User.updateOne(
      { email: user.email },
      { totpFlag: true, secretKey2fa: encryptedSecretKey }
    );
  }

  async validate2fa(validateDetails) {
    const { email, otp } = validateDetails;
    const admin = await User.findOne({ email });
    const decryptedSecretKey = await decrypt(admin.secretKey2fa);
    const isVerified = tfaHelper.verifyTwoFactorAuthCode(
      otp,
      decryptedSecretKey
    );

    if (!isVerified) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        'Invalid 2FA Token'
      );
    }
    const token = await admin.generateAuthToken();
    return { admin: { token, admin }, message: 'Login successfull' };
  }

  async disable2fa(disableDetails, user) {
    const { otp } = disableDetails;
    const decryptedSecretKey = await decrypt(user.secretKey2fa);
    const isVerified = tfaHelper.verifyTwoFactorAuthCode(
      otp,
      decryptedSecretKey
    );

    if (!isVerified) {
      throw new HttpException(
        errorType.UNAUTHORIZED.status,
        'Invalid 2FA Token'
      );
    }

    await User.updateOne(
      { email: user.email },
      { totpFlag: false, secretKey2fa: null }
    );
  }
}

module.exports = TwoFactorAuthService;
