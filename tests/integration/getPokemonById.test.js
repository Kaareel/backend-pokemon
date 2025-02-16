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
        `/pokemon/${existingPokemon._id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        ...mockPokemon,
        _id: existingPokemon._id.toString(),
        types: mockPokemon.types,
        abilities: mockPokemon.abilities,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  describe('error handling', () => {
    it('should return 404 for non-existent pokemon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/pokemon/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Pokemon not found');
    });

    it('should return 400 for invalid id format', async () => {
      const response = await request(app).get('/pokemon/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid ID format');
    });
  });
});
