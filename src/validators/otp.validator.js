const Joi = require('joi');

function validateVerifyEmail(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }).validate(object);
}

function validateForgotPassword(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    otp: Joi.string().length(6).required(),
  }).validate(object);
}

module.exports = {
  validateVerifyEmail,
  validateForgotPassword,
};
