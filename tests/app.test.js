const request = require('supertest');
const mongoose = require('mongoose');
const { connect, disconnect, clearDatabase } = require('./helpers/db');
const app = require('../app');
const Pokemon = require('../models/pokemon');

// Set test environment
process.env.NODE_ENV = 'test';

describe('Pokemon API', () => {
  beforeAll(async () => {
    await connect();
  }, 10000);

  afterAll(async () => {
    await disconnect();
  }, 10000);

  beforeEach(async () => {
    await clearDatabase();
  });

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

  describe('GET /pokemon', () => {
    it('should return empty array when no pokemon exist', async () => {
      const response = await request(app).get('/pokemon');
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      // Verify only essential fields are returned
      expect(response.body.data).toEqual(
        expect.arrayContaining([])
      );
    });

    it('should return all pokemon with essential fields', async () => {
      const pokemon = await Pokemon.create(mockPokemon);
      const response = await request(app).get('/pokemon');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          name: mockPokemon.name,
          thumbnailUrl: mockPokemon.thumbnailUrl
        })
      );
    });

    it('should handle database errors', async () => {
      // Simulate database error by closing connection
      await mongoose.connection.close();
      
      const response = await request(app).get('/pokemon');
      expect(response.status).toBe(500);
      expect(response.body.error).toBeTruthy();

      // Reconnect for other tests
      await connect();
    });

    describe('Filtering and Pagination', () => {
      beforeEach(async () => {
        // Create multiple pokemon for testing filters
        await Pokemon.create([
          mockPokemon,
          {
            ...mockPokemon,
            name: 'Charmander',
            types: ['Fire'],
            abilities: ['Blaze']
          },
          {
            ...mockPokemon,
            name: 'Squirtle',
            types: ['Water'],
            abilities: ['Torrent']
          }
        ]);
      });

      it('should filter pokemon by type', async () => {
        const response = await request(app)
          .get('/pokemon')
          .query({ type: 'Electric' });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].types).toContain('Electric');
      });

      it('should filter pokemon by ability', async () => {
        const response = await request(app)
          .get('/pokemon')
          .query({ ability: 'Static' });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(1);
        expect(response.body.data[0].abilities).toContain('Static');
      });

      it('should paginate results', async () => {
        const response = await request(app)
          .get('/pokemon')
          .query({ limit: 2, offset: 1 });

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.metadata).toBeDefined();
        expect(response.body.metadata).toEqual(
          expect.objectContaining({
            total: 3,
            limit: 2,
            offset: 1
          })
        );
      });

      it('should return 400 for invalid pagination parameters', async () => {
        const response = await request(app)
          .get('/pokemon')
          .query({ limit: 'invalid', offset: -1 });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeTruthy();
      });
    });
  });

  describe('GET /pokemon/:id', () => {
    it('should return complete pokemon details by id', async () => {
      const pokemon = await Pokemon.create(mockPokemon);
      const response = await request(app).get(`/pokemon/${pokemon._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.objectContaining({
          _id: pokemon._id.toString(),
          name: mockPokemon.name,
          thumbnailUrl: mockPokemon.thumbnailUrl,
          largeImageUrl: mockPokemon.largeImageUrl,
          types: mockPokemon.types,
          abilities: mockPokemon.abilities,
          stats: mockPokemon.stats
        })
      );
    });

    it('should return 404 for non-existent pokemon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/pokemon/${fakeId}`);
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBeTruthy();
    });

    it('should return 500 for invalid id format', async () => {
      const response = await request(app).get('/pokemon/invalid-id');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBeTruthy();
    });
  });

  describe('POST /pokemon', () => {
    it('should create a new pokemon with all fields', async () => {
      const response = await request(app)
        .post('/pokemon')
        .send(mockPokemon);
      
      expect(response.status).toBe(201); // Should be 201 for creation
      expect(response.body.data).toEqual(
        expect.objectContaining({
          _id: expect.any(String),
          ...mockPokemon
        })
      );
      
      const savedPokemon = await Pokemon.findById(response.body.data._id);
      expect(savedPokemon).toBeTruthy();
      expect(savedPokemon.toObject()).toMatchObject(mockPokemon);
    });

    it('should validate required fields', async () => {
      const invalidPokemon = {
        name: 'Pikachu'
        // Missing required fields
      };

      const response = await request(app)
        .post('/pokemon')
        .send(invalidPokemon);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should validate stats values', async () => {
      const invalidPokemon = {
        ...mockPokemon,
        stats: {
          ...mockPokemon.stats,
          hp: -1 // Invalid negative value
        }
      };

      const response = await request(app)
        .post('/pokemon')
        .send(invalidPokemon);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('stats');
    });
  });

  describe('PUT /pokemon/:id', () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    it('should update an existing pokemon', async () => {
      const updateData = {
        name: 'Raichu',
        stats: { ...mockPokemon.stats, attack: 90 }
      };

      const response = await request(app)
        .put(`/pokemon/${existingPokemon._id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      
      const updatedPokemon = await Pokemon.findById(existingPokemon._id);
      expect(updatedPokemon.name).toBe(updateData.name);
      expect(updatedPokemon.stats.attack).toBe(updateData.stats.attack);
      // Verify other fields remain unchanged
      expect(updatedPokemon.types).toEqual(mockPokemon.types);
    });

    it('should return 404 for non-existent pokemon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/pokemon/${fakeId}`)
        .send({ name: 'Raichu' });

      expect(response.status).toBe(404);
    });

    it('should validate update data', async () => {
      const response = await request(app)
        .put(`/pokemon/${existingPokemon._id}`)
        .send({
          stats: { hp: -1 } // Invalid negative value
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /pokemon/:id', () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    it('should delete an existing pokemon', async () => {
      const response = await request(app)
        .delete(`/pokemon/${existingPokemon._id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('deleted');

      const deletedPokemon = await Pokemon.findById(existingPokemon._id);
      expect(deletedPokemon).toBeNull();
    });

    it('should return 404 for non-existent pokemon', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/pokemon/${fakeId}`);

      expect(response.status).toBe(404);
    });

    it('should return 500 for invalid id format', async () => {
      const response = await request(app)
        .delete('/pokemon/invalid-id');

      expect(response.status).toBe(500);
    });
  });

  describe('Database Initialization', () => {
    it('should populate database from PokeAPI when empty', async () => {
      // This test should verify that the initialization process works
      // You'll need to mock the PokeAPI calls
      const initResponse = await request(app)
        .post('/initialize-db')
        .send();

      expect(initResponse.status).toBe(200);
      
      const pokemon = await Pokemon.find();
      expect(pokemon.length).toBeGreaterThan(0);
    });

    it('should not populate if database already has data', async () => {
      // First create a pokemon
      await Pokemon.create(mockPokemon);

      const initResponse = await request(app)
        .post('/initialize-db')
        .send();

      expect(initResponse.status).toBe(200);
      expect(initResponse.body.message).toContain('already populated');

      const pokemon = await Pokemon.find();
      expect(pokemon.length).toBe(1); // Should still only have our original pokemon
    });

    it('should handle PokeAPI errors gracefully', async () => {
      // You'll need to mock a failed PokeAPI call
      // Implementation depends on how you're handling the PokeAPI integration
      const initResponse = await request(app)
        .post('/initialize-db')
        .send();

      expect(initResponse.status).toBe(500);
      expect(initResponse.body.error).toBeTruthy();
    });
  });
});

