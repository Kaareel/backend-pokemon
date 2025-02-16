const { ValidationError } = require('../utils/error.utils');

const validate = (schema) => async (req, res, next) => {
  try {
    const validData = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.body = validData; // Replace with validated and transformed data
    next();
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationError = new ValidationError(
        'Validation failed',
        error.errors
      );
      return next(validationError);
    }
    next(error);
  }
};

module.exports = validate;
