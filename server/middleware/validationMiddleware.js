// server/middleware/validationMiddleware.js
const { validationResult } = require('express-validator');
const { ApiError } = require('./errorMiddleware');

/**
 * Middleware to validate requests using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateRequest = (req, res, next) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      // Format validation errors for response
      const errorMessages = errors.array().map(error => ({
        param: error.param,
        message: error.msg
      }));
      
      console.log('Validation errors:', errorMessages);
      
      const errorMsg = `Validation failed: ${errorMessages.map(e => `${e.param} - ${e.message}`).join(', ')}`;
      throw new ApiError(400, errorMsg);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateRequest
};