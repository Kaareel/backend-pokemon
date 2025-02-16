const yup = require('yup');

const VALID_POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 
  'steel', 'fairy'
];

const statsSchema = yup.object({
  hp: yup.number().integer().min(1).required('HP is required'),
  attack: yup.number().integer().min(1).required('Attack is required'),
  defense: yup.number().integer().min(1).required('Defense is required'),
  specialAttack: yup.number().integer().min(1).required('Special Attack is required'),
  specialDefense: yup.number().integer().min(1).required('Special Defense is required'),
  speed: yup.number().integer().min(1).required('Speed is required'),
});

const createPokemonSchema = yup.object({
  name: yup.string()
    .required('Name is required')
    .transform(value => value?.trim()),
  thumbnailUrl: yup.string()
    .required('Thumbnail URL is required')
    .url('Must be a valid URL'),
  largeImageUrl: yup.string()
    .required('Large image URL is required')
    .url('Must be a valid URL'),
  types: yup.array()
    .of(
      yup.string()
        .lowercase()
        .oneOf(VALID_POKEMON_TYPES, 'Invalid Pokemon type')
    )
    .min(1, 'At least one type is required')
    .required('Types are required'),
  abilities: yup.array()
    .of(
      yup.string()
        .transform(value => value?.trim().toLowerCase())
    )
    .min(1, 'At least one ability is required')
    .required('Abilities are required'),
  stats: statsSchema.required('Stats are required'),
});

const updatePokemonSchema = yup.object({
  name: yup.string()
    .transform(value => value?.trim()),
  thumbnailUrl: yup.string()
    .url('Must be a valid URL'),
  largeImageUrl: yup.string()
    .url('Must be a valid URL'),
  types: yup.array()
    .of(
      yup.string()
        .lowercase()
        .oneOf(VALID_POKEMON_TYPES, 'Invalid Pokemon type')
    )
    .min(1, 'At least one type is required'),
  abilities: yup.array()
    .of(
      yup.string()
        .transform(value => value?.trim().toLowerCase())
    )
    .min(1, 'At least one ability is required'),
  stats: statsSchema,
});

const querySchema = yup.object({
  types: yup.string(),
  abilities: yup.string(),
  page: yup.number().integer().min(1, 'Page must be greater than 0'),
  limit: yup.number().integer().min(1, 'Limit must be greater than 0').max(100, 'Limit must be less than or equal to 100'),
});

module.exports = {
  createPokemonSchema,
  updatePokemonSchema,
  querySchema,
  VALID_POKEMON_TYPES,
};
