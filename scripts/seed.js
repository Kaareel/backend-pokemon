const axios = require('axios');
const Pokemon = require('../models/pokemon');


const fetchPokemonDetails = async () => {
    try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=150');
        const pokemonList = response.data.results;

        const detailedPokemon = await Promise.all(
            pokemonList.map(async (pokemon) => {
                const detailsResponse = await axios.get(pokemon.url);
                const details = detailsResponse.data;

                return {
                    name: details.name,
                    thumbnailUrl: details.sprites.front_default,
                    largeImageUrl: details.sprites.other['official-artwork'].front_default,
                    types: details.types.map(t => t.type.name),
                    abilities: details.abilities.map(a => a.ability.name),
                    stats: {
                        hp: details.stats.find(s => s.stat.name === "hp").base_stat,
                        attack: details.stats.find(s => s.stat.name === "attack").base_stat,
                        defense: details.stats.find(s => s.stat.name === "defense").base_stat,
                        specialAttack: details.stats.find(s => s.stat.name === "special-attack").base_stat,
                        specialDefense: details.stats.find(s => s.stat.name === "special-defense").base_stat,
                        speed: details.stats.find(s => s.stat.name === "speed").base_stat
                    }
                };
            })
        );
        return detailedPokemon;

    } catch (error) {
        console.error('❌ Error poblando la base de datos:', error);
        process.exit(1);
    }
};

const seedDatabase = async () => {
    try {
        
        const detailedPokemon = await fetchPokemonDetails();
        await Pokemon.insertMany(detailedPokemon);
        console.log('✅ Base de datos poblada exitosamente');
        process.exit();
    } catch (error) {
        console.error('❌ Error poblando la base de datos:', error);
        process.exit(1);
    }
};
 module.exports = {seedDatabase}
