const Joi = require('joi');
const {
  USER,
  ADMIN,
  API_MANAGER,
  CONTENT_MANAGER,
} = require('../constants/roles.constant');

const {
  ACTIVE,
  INACTIVE,
  BLOCK,
  SUSPEND,
} = require('../constants/status.constant');

function validateAdminLogin(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(object);
}

function validateGetAllUsers(object) {
  return Joi.object({
    status: Joi.string()
      .valid(ACTIVE, INACTIVE, BLOCK, SUSPEND, 'All')
      .required(),
    page: Joi.number().min(1).required(),
    limit: Joi.number().min(10).required(),
  }).validate(object);
}

function validatePaginationParams(object) {
  return Joi.object({
    page: Joi.number().min(1).required(),
    limit: Joi.number().min(10).required(),
  }).validate(object);
}

function validateAddRole(object) {
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
    role: Joi.string().valid(ADMIN, API_MANAGER, CONTENT_MANAGER).required(),
  }).validate(object);
}

function validateGrantRole(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid(ADMIN, API_MANAGER, CONTENT_MANAGER).required(),
  }).validate(object);
}

function validateRevokeRole(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string()
      .valid(ADMIN, API_MANAGER, CONTENT_MANAGER, 'All')
      .required(),
  }).validate(object);
}

function validateUpdateUserStatus(object) {
  return Joi.object({
    email: Joi.string().email().required(),
    status: Joi.string().valid(INACTIVE, BLOCK, SUSPEND).required(),
  }).validate(object);
}

module.exports = {
  validateAdminLogin,
  validateAddRole,
  validateGrantRole,
  validateRevokeRole,
  validatePaginationParams,
  validateUpdateUserStatus,
  validateGetAllUsers,
};
