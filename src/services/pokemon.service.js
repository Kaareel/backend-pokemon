const Pokemon = require('../models/pokemon.model');
const { NotFoundError, BadRequestError } = require('../utils/error.utils');
const { buildFilter, buildPagination, normalizeStrings } = require('../utils/pokemon.utils');

/**
 * Check if a Pokemon with the given name already exists
 */
const checkDuplicateName = async (name, excludeId = null) => {
  const query = { name };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingPokemon = await Pokemon.findOne(query);
  if (existingPokemon) {
    throw new BadRequestError('A Pokémon with this name already exists');
  }
};

/**
 * Find all Pokemon that match the given filters
 */
const findAll = async ({ types, abilities, page = 1, limit = 10 }) => {
  const filter = buildFilter({ types, abilities });
  const skip = (page - 1) * limit;

  const [data, totalCount] = await Promise.all([
    Pokemon.find(filter)
      .select('_id name types thumbnailUrl')
      .skip(skip)
      .limit(limit)
      .lean(),
    Pokemon.countDocuments(filter),
  ]);

  return {
    data,
    pagination: buildPagination(totalCount, page, limit),
  };
};

/**
 * Find a Pokemon by its ID
 */
const findById = async (id) => {
  const pokemon = await Pokemon.findById(id).lean();
  if (!pokemon) {
    throw new NotFoundError('Pokemon');
  }
  return pokemon;
};

/**
 * Create a new Pokemon
 */
const create = async (pokemonData) => {
  await checkDuplicateName(pokemonData.name);
  const normalizedData = normalizeStrings(pokemonData);
  return Pokemon.create(normalizedData);
};

/**
 * Update an existing Pokemon
 */
const update = async (id, updateData) => {
  if (updateData.name) {
    await checkDuplicateName(updateData.name, id);
  }

  const normalizedData = normalizeStrings(updateData);
  const pokemon = await Pokemon.findByIdAndUpdate(
    id,
    normalizedData,
    { new: true, runValidators: true }
  );

  if (!pokemon) {
    throw new NotFoundError('Pokemon');
  }

  return pokemon;
};

/**
 * Delete a Pokemon
 */
const remove = async (id) => {
  const pokemon = await Pokemon.findByIdAndDelete(id);
  if (!pokemon) {
    throw new NotFoundError('Pokemon');
  }
  return { message: 'Pokemon deleted successfully' };
};

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
