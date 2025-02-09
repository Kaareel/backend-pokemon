const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const Pokemon = require("../../models/pokemon");
const { mockPokemon } = require("../config/setup");

describe("GET /pokemon/:id", () => {
  describe("when pokemon exists", () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    it("should return complete pokemon details", async () => {
      const response = await request(app).get(
        `/pokemon/${existingPokemon._id}`
      );
      expect(response.body.data).toMatchObject({
        ...mockPokemon,
      });
      expect(response.status).toBe(200);
      expect(response.body.data._id).toEqual(existingPokemon._id.toString());
      expect(response.body.data).toMatchObject({
        name: mockPokemon.name,
        thumbnailUrl: mockPokemon.thumbnailUrl,
        largeImageUrl: mockPokemon.largeImageUrl,
        types: mockPokemon.types,
        abilities: mockPokemon.abilities,
        stats: mockPokemon.stats,
      });
    });
  });

  describe("error handling", () => {
    it("should return 404 for non-existent pokemon", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app).get(`/pokemon/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBeTruthy();
    });

    it("should return 400 for invalid id format", async () => {
      const response = await request(app).get("/pokemon/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
      expect(response.body.error).toMatch(/invalid.*id/i);
    });
  });
});
