const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true},
        thumbnailUrl: { type: String, required: true },
        largeImageUrl: { type: String, required: true },
        types: { type: [String], required: true }, // Array de cadenas
        abilities: { type: [String], required: true }, // Array de cadenas
        stats: {
            hp: { type: Number, min: 1, required: true },
            attack: { type: Number, min: 1, required: true },
            defense: { type: Number, min: 1, required: true },
            specialAttack: { type: Number, min: 1, required: true },
            specialDefense: { type: Number, min: 1, required: true },
            speed: { type: Number, min: 1, required: true },
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("Pokemon", PokemonSchema);