const request = require("supertest");
const app = require("../../app");
const Pokemon = require("../../models/pokemon");
const { mockPokemon } = require("../config/setup");

describe("POST /pokemon", () => {
  describe("successful creation", () => {
    it("should create a new pokemon with all fields", async () => {
      const response = await request(app).post("/pokemon").send(mockPokemon);

      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        ...mockPokemon,
      });
      expect(response.body.data._id).toEqual(expect.any(String));

      const savedPokemon = await Pokemon.findById(response.body.data._id);
      expect(savedPokemon).toBeTruthy();
      expect(savedPokemon.toObject()).toMatchObject(mockPokemon);
    });
  });

  describe("validation", () => {
    it("should validate required fields", async () => {
      const invalidPokemon = {
        name: "Pikachu",
        // Missing required fields
      };

      const response = await request(app).post("/pokemon").send(invalidPokemon);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it("should validate field types", async () => {
      const invalidPokemon = {
        ...mockPokemon,
        stats: {
          ...mockPokemon.stats,
          hp: "invalid", // Should be a number
        },
      };

      const response = await request(app).post("/pokemon").send(invalidPokemon);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });

    it("should handle duplicate pokemon names", async () => {
      await Pokemon.create(mockPokemon);

      const response = await request(app).post("/pokemon").send(mockPokemon);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeTruthy();
    });
  });
});
