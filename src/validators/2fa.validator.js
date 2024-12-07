const Joi = require('joi');

function validateVerify2fa(object) {
  return Joi.object({
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.base': 'OTP must be a string.',
        'string.length': 'OTP must be exactly 6 digits.',
        'string.pattern.base': 'OTP must only contain numbers.',
        'any.required': 'OTP is required.',
      }),
    secretKey: Joi.string().required().messages({
      'string.base': 'Secret Key must be a string.',
      'any.required': 'Secret Key is required.',
    }),
  }).validate(object);
}

function validateValidate2fa(object) {
  return Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address.',
      'any.required': 'Email is required.',
    }),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.base': 'OTP must be a string.',
        'string.length': 'OTP must be exactly 6 digits.',
        'string.pattern.base': 'OTP must only contain numbers.',
        'any.required': 'OTP is required.',
      }),
  }).validate(object);
}

function validateDisable2fa(object) {
  return Joi.object({
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.base': 'OTP must be a string.',
        'string.length': 'OTP must be exactly 6 digits.',
        'string.pattern.base': 'OTP must only contain numbers.',
        'any.required': 'OTP is required.',
      }),
  }).validate(object);
}

module.exports = { validateVerify2fa, validateValidate2fa, validateDisable2fa };
