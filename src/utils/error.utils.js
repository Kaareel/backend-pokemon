class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends CustomError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends CustomError {
  constructor(message) {
    super(message, 422);
  }
}

class BadRequestError extends CustomError {
  constructor(message) {
    super(message, 400);
  }
}

module.exports = {
  CustomError,
  NotFoundError,
  ValidationError,
  BadRequestError,
};
