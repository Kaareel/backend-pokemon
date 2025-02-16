const express = require('express');
const router = express.Router();
const controllers = require('../controllers/pokemon.controller');
const validate = require('../middleware/validate.middleware');
const { createPokemonSchema, updatePokemonSchema } = require('../validators/pokemon.validator');

const ROUTE_PREFIX = 'pokemon';

// Rutas GET
router.get(
  `/${ROUTE_PREFIX}`,
  controllers.getData
);

router.get(
  `/${ROUTE_PREFIX}/:id`,
  controllers.getById
);

// Rutas POST
router.post(
  `/${ROUTE_PREFIX}`,
  validate(createPokemonSchema),
  controllers.insertData
);

// Rutas PUT
router.put(
  `/${ROUTE_PREFIX}/:id`,
  validate(updatePokemonSchema),
  controllers.updateData
);

// Rutas DELETE
router.delete(
  `/${ROUTE_PREFIX}/:id`,
  controllers.deleteData
);

module.exports = router;
