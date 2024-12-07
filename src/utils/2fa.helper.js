const speakeasy = require('speakeasy');
const { TWO_FA_ISSUER } = require('../../config/env');

class TwoFactorAuthHelper {
  generateSecret(email) {
    const secret = speakeasy.generateSecret({
      label: `${TWO_FA_ISSUER}:${email}`,
      issuer: TWO_FA_ISSUER,
      length: 20,
    });
    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `${TWO_FA_ISSUER}:${email}`,
      encoding: 'base32',
      issuer: TWO_FA_ISSUER,
    });

    return {
      otpauthUrl: url,
      base32: secret.base32,
    };
  }

  verifyTwoFactorAuthCode(authToken, secret) {
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: authToken,
    });
    return verified;
  }
}

module.exports = TwoFactorAuthHelper;
