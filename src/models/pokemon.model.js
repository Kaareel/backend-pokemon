const mongoose = require('mongoose');
const { VALID_POKEMON_TYPES } = require('../validators/pokemon.validator');

const statsSchema = new mongoose.Schema({
  hp: { type: Number, min: 1, required: true },
  attack: { type: Number, min: 1, required: true },
  defense: { type: Number, min: 1, required: true },
  specialAttack: { type: Number, min: 1, required: true },
  specialDefense: { type: Number, min: 1, required: true },
  speed: { type: Number, min: 1, required: true },
}, { _id: false });

const PokemonSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'], 
      unique: true,
      trim: true,
    },
    thumbnailUrl: { 
      type: String, 
      required: [true, 'Thumbnail URL is required'],
      validate: {
        validator: (v) => /^https?:\/\/.+/.test(v),
        message: 'Invalid thumbnail URL format',
      },
    },
    largeImageUrl: { 
      type: String, 
      required: [true, 'Large image URL is required'],
      validate: {
        validator: (v) => /^https?:\/\/.+/.test(v),
        message: 'Invalid large image URL format',
      },
    },
    types: { 
      type: [{
        type: String,
        lowercase: true,
        enum: {
          values: VALID_POKEMON_TYPES,
          message: '{VALUE} is not a valid Pokemon type',
        },
      }],
      required: [true, 'At least one type is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one type is required',
      },
    },
    abilities: { 
      type: [{
        type: String,
        lowercase: true,
        trim: true,
      }],
      required: [true, 'At least one ability is required'],
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'At least one ability is required',
      },
    },
    stats: {
      type: statsSchema,
      required: [true, 'Stats are required'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes
PokemonSchema.index({ name: 1 }, { unique: true });
PokemonSchema.index({ types: 1 });
PokemonSchema.index({ abilities: 1 });

// Static methods
PokemonSchema.statics.findByType = function(type) {
  return this.find({ types: type.toLowerCase() });
};

PokemonSchema.statics.findByAbility = function(ability) {
  return this.find({ abilities: ability.toLowerCase() });
};

// Middleware pre-save
PokemonSchema.pre('save', function(next) {
  // Convert types and abilities to lowercase
  if (this.isModified('types')) {
    this.types = this.types.map(type => type.toLowerCase());
  }
  if (this.isModified('abilities')) {
    this.abilities = this.abilities.map(ability => ability.toLowerCase());
  }
  next();
});

module.exports = mongoose.model('Pokemon', PokemonSchema);
