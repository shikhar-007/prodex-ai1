const crypto = require('crypto');

const {
  ENCRYPTION_ALGORITHM,
  ENCRYPTION_PASSWORD,
  ENCRYPTION_SALT,
  ENCRYPTION_IV_LENGTH,
} = require('../../config/env');

const encrypt = async (message) => {
  const key = crypto.scryptSync(ENCRYPTION_PASSWORD, ENCRYPTION_SALT, 32);
  const iv = crypto.randomBytes(Number(ENCRYPTION_IV_LENGTH));
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = async (encryptedData) => {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_PASSWORD, ENCRYPTION_SALT, 32);

  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { encrypt, decrypt };
