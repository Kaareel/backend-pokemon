const mockPokemon = {
  name: 'Pikachu',
  thumbnailUrl: 'https://example.com/pikachu-thumb.jpg',
  largeImageUrl: 'https://example.com/pikachu-large.jpg',
  types: ['electric'],
  abilities: ['static'],
  stats: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 50,
    speed: 90,
  },
};

const createMockPokemon = (overrides = {}) => ({
  ...mockPokemon,
  ...overrides,
});

const mockPokemonList = [
  mockPokemon,
  createMockPokemon({
    name: 'Charmander',
    types: ['fire'],
    abilities: ['blaze'],
  }),
  createMockPokemon({
    name: 'Mew',
    types: ['psychic'],
    abilities: ['synchronize'],
  }),
];

module.exports = {
  mockPokemon,
  createMockPokemon,
  mockPokemonList,
};
