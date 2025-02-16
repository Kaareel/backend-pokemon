const request = require('supertest');
const app = require('../../src/app');
const Pokemon = require('../../src/models/pokemon.model');
const { mockPokemon, createMockPokemon } = require('../fixtures/pokemon.fixtures');

describe('POST /pokemon', () => {
  describe('successful creation', () => {
    it('should create a new pokemon with all fields', async () => {
      const response = await request(app).post('/pokemon').send(mockPokemon);

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual({
        ...mockPokemon,
        _id: expect.any(String),
        types: mockPokemon.types,
        abilities: mockPokemon.abilities,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      const savedPokemon = await Pokemon.findById(response.body.data._id).lean();
      expect(savedPokemon).toBeTruthy();
      expect(savedPokemon).toMatchObject({
        ...mockPokemon,
        types: mockPokemon.types.map(type => type.toLowerCase()),
        abilities: mockPokemon.abilities.map(ability => ability.toLowerCase()),
      });
    });
  });

  describe('validation', () => {
    const testCases = [
      {
        description: 'missing required fields',
        data: { name: 'Pikachu' },
        expectedError: /required/i,
      },
      {
        description: 'invalid stats type',
        data: createMockPokemon({ stats: { ...mockPokemon.stats, hp: 'invalid' } }),
        expectedError: /validation.*failed/i,
      },
      {
        description: 'invalid URL format',
        data: createMockPokemon({ thumbnailUrl: 'invalid-url' }),
        expectedError: /invalid.*url.*format/i,
      },
      {
        description: 'invalid pokemon type',
        data: createMockPokemon({ types: ['invalid-type'] }),
        expectedError: /not.*valid.*pokemon.*type/i,
      },
    ];

    for (const { description, data, expectedError } of testCases) {
      it(`should validate ${description}`, async () => {
        const response = await request(app).post('/pokemon').send(data);

        expect(response.status).toBe(422);
        expect(response.body.error).toMatch(expectedError);
      });
    }

    it('should handle duplicate pokemon names', async () => {
      await Pokemon.create(mockPokemon);

      const response = await request(app).post('/pokemon').send(mockPokemon);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });
  });
});
