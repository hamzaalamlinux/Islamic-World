const httpStatusCodes = require('./httpStatusCodes');

const successResponse = (res, message, data = [], status = httpStatusCodes.OK) => {
  return res.status(status).json({
    status: 'success',
    message,
    data
  });
};

const errorResponse = (res, message, errors = [], status = httpStatusCodes.INTERNAL_SERVER_ERROR) => {
    return res.status(status).json({
      status: 'error',
      message,
      errors
    });
  };
  

module.exports = {
  successResponse,
  errorResponse
};