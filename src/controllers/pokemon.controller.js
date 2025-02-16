const PokemonService = require('../services/pokemon.service');
const { querySchema } = require('../validators/pokemon.validator');
const { validateSchema } = require('../utils/validation.utils');

/**
 * Get a list of Pokemon with optional filtering and pagination
 */
exports.getData = async (req, res, next) => {
  try {
    const validatedQuery = await validateSchema(req.query, querySchema);
    const result = await PokemonService.findAll(validatedQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a Pokemon by its ID
 */
exports.getById = async (req, res, next) => {
  try {
    const data = await PokemonService.findById(req.params.id);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new Pokemon
 */
exports.insertData = async (req, res, next) => {
  try {
    const data = await PokemonService.create(req.body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing Pokemon
 */
exports.updateData = async (req, res, next) => {
  try {
    const data = await PokemonService.update(req.params.id, req.body);
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Pokemon
 */
exports.deleteData = async (req, res, next) => {
  try {
    const result = await PokemonService.remove(req.params.id);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};
