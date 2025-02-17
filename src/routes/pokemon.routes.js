const express = require('express');
const router = express.Router();
const controllers = require('../controllers/pokemon.controller');
const validate = require('../middleware/validate.middleware');
const { createPokemonSchema, updatePokemonSchema } = require('../validators/pokemon.validator');

// Rutas GET
router.get(
  '/',
  controllers.getData
);

router.get(
  '/:id',
  controllers.getById
);

// Rutas POST
router.post(
  '/',
  validate(createPokemonSchema),
  controllers.insertData
);

// Rutas PUT
router.put(
  '/:id',
  validate(updatePokemonSchema),
  controllers.updateData
);

// Rutas DELETE
router.delete(
  '/:id',
  controllers.deleteData
);

module.exports = router;
