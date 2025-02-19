const request = require("supertest");
const app = require("../../app");
const Pokemon = require("../../models/pokemon");
const { mockPokemon } = require("../config/setup");

describe("GET /pokemon", () => {
  const testPokemon = [
    mockPokemon,
    {
      ...mockPokemon,
      name: "Charmander",
      types: ["fire"],
      abilities: ["blaze"],
    },
    {
      ...mockPokemon,
      name: "Mew",
      types: ["psychic"],
      abilities: ["synchronize"],
    },
  ];

  beforeEach(async () => {
    await Pokemon.deleteMany({});
  });

  describe("when collection is empty", () => {
    it("should return empty array", async () => {
      const response = await request(app).get("/pokemon");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("when pokemon exist", () => {
    beforeEach(async () => {
      await Pokemon.create(testPokemon);
    });

      it("should return all pokemon with essential fields", async () => {
        const response = await request(app).get("/pokemon");

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(testPokemon.length);
        
        for (const pokemon of response.body.data) {
          expect(pokemon).toEqual(
            expect.objectContaining({
              _id: expect.any(String),
              name: expect.any(String),
              thumbnailUrl: expect.any(String),
              types: expect.any(Array)
            })
          );
        }

        const names = response.body.data.map(p => p.name).sort();
        const expectedNames = testPokemon.map(p => p.name).sort();
        expect(names).toEqual(expectedNames);
    });

    describe("filtering", () => {
      const testFilters = [
        { param: "types", value: "Fire", expectedName: "Charmander" },
        { param: "types", value: "Electric", expectedName: "Pikachu" },
        { param: "types", value: "Psychic", expectedName: "Mew" },
        { param: "abilities", value: "Static", expectedName: "Pikachu" },
        { param: "abilities", value: "Blaze", expectedName: "Charmander" },
        { param: "abilities", value: "Synchronize", expectedName: "Mew" },
      ];

      for (const { param, value, expectedName } of testFilters) {
        it(`should filter pokemon by ${param}: ${value}`, async () => {
          const response = await request(app).get(`/pokemon?${param}=${value}`);
          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(1);
          expect(response.body.data[0].name).toBe(expectedName);
        });
      }

      it("should return empty array when no matches", async () => {
        const response = await request(app).get("/pokemon?types=Rock");

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual([]);
      });
    });

    describe("pagination", () => {
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

      for (const { params, expectedLength, expectedPagination } of testPaginationCases) {
        it(`should paginate correctly with limit ${params.limit} and page ${params.page}`, async () => {
          const response = await request(app).get(
            `/pokemon?limit=${params.limit}&page=${params.page}`
          );

          expect(response.status).toBe(200);
          expect(response.body.data).toHaveLength(expectedLength);
          expect(response.body.pagination).toEqual(
            expect.objectContaining(expectedPagination)
          );
        });
      }
    });
  });

  describe("error handling", () => {
    const errorCases = [
      {
        description: "invalid query parameters",
        query: "invalid=true",
        expectedError: /invalid.*parameter/i,
      },
      {
        description: "invalid pagination values",
        query: "page=invalid",
        expectedError: /invalid.*pagination/i,
      },
      {
        description: "negative pagination values",
        query: "limit=-1&page=0",
        expectedError: /invalid.*pagination/i,
      },
    ];

    for (const { description, query, expectedError } of errorCases) {
      it(`should handle ${description}`, async () => {
        const response = await request(app).get(`/pokemon?${query}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toMatch(expectedError);
      });
    }
  });
});

