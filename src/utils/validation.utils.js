const { BadRequestError } = require('./error.utils');

/**
 * Validates data against a schema and returns the validated value
 * @param {Object} data - The data to validate
 * @param {Object} schema - The Yup schema to validate against
 * @param {string} errorMessage - Optional custom error message
 * @returns {Object} The validated data
 * @throws {BadRequestError} If validation fails
 */
const validateSchema = async (data, schema, errorMessage = null) => {
  try {
    return await schema.validate(data, { abortEarly: false });
  } catch (error) {
    throw new BadRequestError(errorMessage || error.errors[0]);
  }
};

module.exports = {
  validateSchema,
};
