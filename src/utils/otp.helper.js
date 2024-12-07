const crypto = require('crypto');

const generateOtp = async () => {
  let otp = '';

  for (let i = 0; i < 6; i++) {
    const digit = Math.floor(Math.random() * 10);
    otp += digit.toString();
  }
  return otp;
};

const generateAlphaNumericOtp = async () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let otp = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    otp += chars[randomIndex];
  }
  return otp;
};

module.exports = { generateOtp, generateAlphaNumericOtp };