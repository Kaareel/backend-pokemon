
process.env.NODE_ENV = 'test';

const mockPokemon = {
  name: "Pikachu",
  thumbnailUrl: "http://example.com/pikachu-thumb.jpg",
  largeImageUrl: "http://example.com/pikachu-large.jpg",
  types: ["Electric"],
  abilities: ["Static", "Lightning Rod"],
  stats: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 50,
    speed: 90
  }
};

module.exports = {
  mockPokemon
};
