const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const {
  USER,
  ADMIN,
  API_MANAGER,
  CONTENT_MANAGER,
} = require('../constants/roles.constant');

const isAdmin = async (req, res, next) => {
  if (req.user && req.user.userType.includes(ADMIN)) {
    return next();
  }
  throw new HttpException(
    errorType.FORBIDDEN.status,
    `You are not authorized, need ${ADMIN} role to access it`
  );
};

const isApiManager = async (req, res, next) => {
  if (
    req.user &&
    (req.user.userType.includes(ADMIN) ||
      req.user.userType.includes(API_MANAGER))
  ) {
    return next();
  }
  throw new HttpException(
    errorType.FORBIDDEN.status,
    `You are not authorized, need ${API_MANAGER} or ${ADMIN} role to access it`
  );
};

const isContentManager = async (req, res, next) => {
  if (
    req.user &&
    (req.user.userType.includes(ADMIN) ||
      req.user.userType.includes(CONTENT_MANAGER))
  ) {
    return next();
  }
  throw new HttpException(
    errorType.FORBIDDEN.status,
    `You are not authorized, need ${CONTENT_MANAGER} or ${ADMIN} role to access it`
  );
};

module.exports = { isAdmin, isContentManager, isApiManager };
