const jwt = require('jsonwebtoken');
const httpStatusCodes = require('../utils/httpStatusCodes');
const { errorResponse } = require('../utils/responseHandler');

const auth = (req, res, next) =>{
    const token = req.header('x-auth-token');
    if (!token) {
      
      return errorResponse(res, 'User UnAuthorized', [], httpStatusCodes.UNAUTHORIZED);
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;
