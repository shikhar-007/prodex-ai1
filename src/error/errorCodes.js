const errorCodes = {
  BAD_REQUEST: {
    status: 400,
  },
  UNAUTHORIZED: {
    status: 401,
  },
  INSUFFICIENT_BALANCE: {
    status: 402,
  },
  FORBIDDEN: {
    status: 403,
  },
  NOT_FOUND: {
    status: 404,
  },
  CONFLICT: {
    status: 409,
  },
  GONE: {
    status: 410,
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
  },
};

module.exports = errorCodes;
