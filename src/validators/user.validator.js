const Joi = require('joi');

function validateChangePassword(object) {
  return Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
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

function validateEditProfileEmail(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(object);
}

function validateEditProfileName(object) {
  return Joi.object({
    name: Joi.string().min(2).required().messages({
      'string.empty': 'Name is required.',
      'string.min': 'Name must be at least 2 characters long.',
    }),
  }).validate(object);
}

function validateUpdateChatSetting(object) {
  return Joi.object({
    conversationTags: Joi.boolean().required(),
    displayChatHistory: Joi.boolean().required(),
    clearChatHistory: Joi.boolean().required(),
  }).validate(object);
}

module.exports = {
  validateChangePassword,
  validateEditProfileEmail,
  validateUpdateChatSetting,
  validateEditProfileName,
};
