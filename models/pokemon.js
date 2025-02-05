const mongoose = require('mongoose');

const PokemonSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        thumbnailUrl: { type: String, required: true },
        largeImageUrl: { type: String, required: true },
        types: { type: [String], required: true }, // Array de cadenas
        abilities: { type: [String], required: true }, // Array de cadenas
        stats: {
            hp: { type: Number, required: true },
            attack: { type: Number, required: true },
            defense: { type: Number, required: true },
            specialAttack: { type: Number, required: true },
            specialDefense: { type: Number, required: true },
            speed: { type: Number, required: true },
        },
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.model("Pokemon", PokemonSchema);