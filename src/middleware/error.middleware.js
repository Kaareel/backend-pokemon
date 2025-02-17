const { CustomError } = require('../utils/error.utils');

const errorHandler = (err, req, res, next) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(422).json({
      error: messages.length > 0 ? messages.join(', ') : 'Validation failed',
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'A record with this name already exists',
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(422).json({
      error: 'Invalid ID format',
    });
  }

  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
  });
};

module.exports = errorHandler;
