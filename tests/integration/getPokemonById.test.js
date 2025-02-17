const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Pokemon = require('../../src/models/pokemon.model');
const { mockPokemon } = require('../fixtures/pokemon.fixtures');

describe('GET /pokemon/:id', () => {
  describe('when pokemon exists', () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    it('should return complete pokemon details', async () => {
      const response = await request(app).get(
        `/api/v1/pokemon/${existingPokemon._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        ...mockPokemon,
        types: mockPokemon.types.map(t => t.toLowerCase()),
        abilities: mockPokemon.abilities.map(a => a.toLowerCase()),
        _id: existingPokemon._id.toString(),

        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('error handling', () => {
    it('should return 404 for non-existent pokemon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/api/v1/pokemon/${fakeId}`);

      expect(response.status).toBe(422);
      expect(response.body.error).toMatch(/not found/i);
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app).get('/api/v1/pokemon/invalid-id');

      expect(response.status).toBe(422);
      expect(response.body.error).toBe('Invalid ID format');
    });
  });
});
