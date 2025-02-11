const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const Pokemon = require("../../models/pokemon");
const { mockPokemon } = require("../config/setup");

describe("Pokemon Update and Delete Operations", () => {
  describe("PUT /pokemon/:id", () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    describe("when pokemon exists", () => {
      it("should update pokemon with valid data", async () => {
        const updateData = {
          name: "Raichu",
          stats: { ...mockPokemon.stats, attack: 90 },
        };

        const response = await request(app)
          .put(`/pokemon/${existingPokemon._id}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.data).toEqual(
          expect.objectContaining({
            _id: existingPokemon._id.toString(),
            ...mockPokemon,
            ...updateData,
          })
        );

        const updatedPokemon = await Pokemon.findById(existingPokemon._id);
        expect(updatedPokemon.name).toBe(updateData.name);
        expect(updatedPokemon.stats.attack).toBe(updateData.stats.attack);
      });

      it("should validate update data types", async () => {
        const response = await request(app)
          .put(`/pokemon/${existingPokemon._id}`)
          .send({ stats: { attack: "invalid" } });

        expect(response.status).toBe(400);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toMatch(/validation/i);
      });
    });

    describe("when pokemon does not exist", () => {
      it("should return 404 with error message", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .put(`/pokemon/${fakeId}`)
          .send({ name: "Updated" });

        expect(response.status).toBe(404);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toMatch(/not found/i);
      });

      it("should handle invalid id format", async () => {
        const response = await request(app)
          .put("/pokemon/invalid-id")
          .send({ name: "Updated" });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/invalid.*id/i);
      });
    });
  });

  describe("DELETE /pokemon/:id", () => {
    let existingPokemon;

    beforeEach(async () => {
      existingPokemon = await Pokemon.create(mockPokemon);
    });

    describe("when pokemon exists", () => {
      it("should delete pokemon and return success message", async () => {
        const response = await request(app).delete(
          `/pokemon/${existingPokemon._id}`
        );

        expect(response.status).toBe(200);
        expect(response.body.data.message).toBeTruthy();

        const deletedPokemon = await Pokemon.findById(existingPokemon._id);
        expect(deletedPokemon).toBeNull();
      });
    });

    describe("when pokemon does not exist", () => {
      it("should return 404 with error message", async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const response = await request(app).delete(`/pokemon/${fakeId}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBeTruthy();
        expect(response.body.error).toMatch(/not found/i);
      });

      it("should handle invalid id format", async () => {
        const response = await request(app).delete("/pokemon/invalid-id");

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/invalid.*id/i);
      });
    });
  });
});
