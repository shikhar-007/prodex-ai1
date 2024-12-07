const Joi = require('joi');

function validateSignup(object) {
  return Joi.object({
    name: Joi.string().min(2).required().messages({
      'string.empty': 'Name is required.',
      'string.min': 'Name must be at least 2 characters long.',
    }),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .min(8)
      .required()
      .messages({
        'string.pattern.base':
          'Password must contain at least one letter, one number, and one special character.',
        'string.min': 'Password must be at least 8 characters long.',
      }),
  }).validate(object);
}

function validateLogin(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    country: Joi.string().required(),
    regionName: Joi.string().required(),
    city: Joi.string().required(),
    device: Joi.string().required(),
    os: Joi.string().required(),
    ip: Joi.string().required(),
    browser: Joi.string().required(),
  }).validate(object);
}

function commonAuthValidator(object) {
  return Joi.object({
    email: Joi.string().email().required(),
  }).validate(object);
}

module.exports = {
  validateSignup,
  validateLogin,
  commonAuthValidator,
};
