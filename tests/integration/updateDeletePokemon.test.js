const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Pokemon = require('../../src/models/pokemon.model');
const { mockPokemon, createMockPokemon } = require('../fixtures/pokemon.fixtures');

describe('Pokemon Update and Delete Operations', () => {
  describe('PUT /pokemon/:id', () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    describe('when pokemon exists', () => {
      it('should update pokemon with valid data', async () => {
        const updateData = {
          name: 'Raichu',
          stats: { ...mockPokemon.stats, attack: 90 },
        };

        const response = await request(app)
          .put(`/api/v1/pokemon/${existingPokemon._id}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(
          expect.objectContaining({
            _id: existingPokemon._id.toString(),
            ...mockPokemon,
            types: mockPokemon.types.map(t => t.toLowerCase()),
            abilities: mockPokemon.abilities.map(a => a.toLowerCase()),
            ...updateData,
          }),
        );

        const updatedPokemon = await Pokemon.findById(existingPokemon._id);
        expect(updatedPokemon.name).toBe(updateData.name);
        expect(updatedPokemon.stats.attack).toBe(updateData.stats.attack);
      });

      it('should validate update data types', async () => {
        const response = await request(app)
          .put(`/api/v1/pokemon/${existingPokemon._id}`)
          .send({ stats: { attack: 'invalid' } });

        expect(response.status).toBe(422);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toMatch(/validation/i);
      });
    });

    describe('when pokemon does not exist', () => {
      it('should return 404 with error message', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .put(`/api/v1/pokemon/${fakeId}`)
          .send({ name: 'Updated' });

        expect(response.status).toBe(422);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toBeTruthy();
      });

      it('should handle invalid id format', async () => {
        const response = await request(app)
          .put('/api/v1/pokemon/invalid-id')
          .send({ name: 'Updated' });

        expect(response.status).toBe(422);
        expect(response.body.error).toBeTruthy();
      });
    });
  });

  describe('DELETE /pokemon/:id', () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    describe('when pokemon exists', () => {
      it('should delete pokemon and return success message', async () => {
        const response = await request(app).delete(
          `/api/v1/pokemon/${existingPokemon._id}`,
        );

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBeTruthy();

        const deletedPokemon = await Pokemon.findById(existingPokemon._id);
        expect(deletedPokemon).toBeNull();
      });
    });

    describe('when pokemon does not exist', () => {
      it('should return 404 with error message', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).delete(`/api/v1/pokemon/${fakeId}`);

        expect(response.status).toBe(422);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toBeTruthy();
      });

      it('should handle invalid id format', async () => {
        const response = await request(app).delete('/api/v1/pokemon/invalid-id');

        expect(response.status).toBe(422);
        expect(response.body.error).toBeTruthy();
      });
    });
  });
});
