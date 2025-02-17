const request = require('supertest');
const app = require('../../src/app');
const Pokemon = require('../../src/models/pokemon.model');
const { mockPokemon, mockPokemonList } = require('../fixtures/pokemon.fixtures');

describe('GET /pokemon', () => {

  beforeEach(async () => {
    await Pokemon.deleteMany({});
  });

  describe('when collection is empty', () => {
    it('should return empty array', async () => {
      const response = await request(app).get('/api/v1/pokemon');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('when pokemon exist', () => {
    beforeEach(async () => {
      await Pokemon.create(mockPokemonList);
    });

    it('should return all pokemon with essential fields', async () => {
      const response = await request(app).get('/api/v1/pokemon');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(mockPokemonList.length);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            name: mockPokemon.name,
            thumbnailUrl: mockPokemon.thumbnailUrl,
            types: mockPokemon.types.map(t => t.toLowerCase()),
          })
        ])
      );
    });

    describe('filtering', () => {
      const testFilters = [
        { param: 'types', value: 'Fire', expectedName: 'Charmander' },
        { param: 'types', value: 'Electric', expectedName: 'Pikachu' },
        { param: 'types', value: 'Psychic', expectedName: 'Mew' },
        { param: 'abilities', value: 'Static', expectedName: 'Pikachu' },
        { param: 'abilities', value: 'Blaze', expectedName: 'Charmander' },
        { param: 'abilities', value: 'Synchronize', expectedName: 'Mew' },
      ];

      for (const { param, value, expectedName } of testFilters) {
        it(`should filter pokemon by ${param}: ${value}`, async () => {
          const response = await request(app).get(`/api/v1/pokemon?${param}=${value}`);
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(1);
          expect(response.body.data[0].name).toBe(expectedName);
        });
      }

      it('should return empty array when no matches', async () => {
        const response = await request(app).get('/api/v1/pokemon?types=Rock');

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
      });
    });

    describe('pagination', () => {
      const testPaginationCases = [
        {
          params: { limit: 1, page: 1 },
          expectedLength: 1,
          expectedPagination: {
            currentPage: 1,
            totalPages: 3,
            totalItems: 3,
            limit: 1,
          },
        },
        {
          params: { limit: 2, page: 1 },
          expectedLength: 2,
          expectedPagination: {
            currentPage: 1,
            totalPages: 2,
            totalItems: 3,
            limit: 2,
          },
        },
      ];

      for (const {
        params,
        expectedLength,
        expectedPagination,
      } of testPaginationCases) {
        it(`should paginate correctly with limit ${params.limit} and page ${params.page}`, async () => {
          const response = await request(app).get(
            `/api/v1/pokemon?limit=${params.limit}&page=${params.page}`,
          );

          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(expectedLength);
          expect(response.body.pagination).toEqual(
            expect.objectContaining(expectedPagination),
          );
        });
      }
    });
  });

  describe('error handling', () => {
    it('should handle invalid pagination values', async () => {
      const response = await request(app).get('/api/v1/pokemon?page=invalid');
      expect(response.status).toBe(422);
      expect(response.body.error).toBeTruthy();
    });

    it('should handle negative pagination values', async () => {
      const response = await request(app).get('/api/v1/pokemon?limit=-1&page=0');
      expect(response.status).toBe(422);
      expect(response.body.error).toBeTruthy();
    });
  });
});
