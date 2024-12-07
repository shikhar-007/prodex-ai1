const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { JWT_SECRET_KEY } = require('../../config/env');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const logger = require('log4js').getLogger('auth.middleware.js');

const authToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  const decoded = jwt.verify(token, JWT_SECRET_KEY);
  const user = await User.findById(decoded._id);

  if (!user) {
    throw new HttpException(errorType.NOT_FOUND.status, 'User not found');
  }

  req.token = token;
  req.user = user;
  next();
};

const socketAuth = async (socket, next) => {
  try {
    const authHeader = socket.handshake.headers.authorization;
    if (!authHeader) {
      throw new HttpException(
        errorType.UNAUTHORIZED.status,
        'Authorization header missing'
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpException(
        errorType.UNAUTHORIZED.status,
        'Token missing from authorization header'
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    const user = await User.findById(decoded._id);
    if (!user) {
      throw new HttpException(errorType.NOT_FOUND.status, 'User not found');
    }

    socket.user = user;
    socket.decodedToken = decoded;
    next();
  } catch (error) {
    logger.error(error);
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return next(
        new HttpException(
          errorType.UNAUTHORIZED.status,
          'Invalid or expired token'
        )
      );
    }
    next(error);
  }
};

module.exports = { authToken, socketAuth };
