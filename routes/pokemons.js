const express = require('express');
const router = express.Router();
const controllers = require('../controllers/pokemon');

const path = 'pokemon';

router.get(`/${path}`, controllers.getData);

router.get(`/${path}/:id`, controllers.getById);

router.post(`/${path}`, controllers.insertData);

router.put(`/${path}/:id`, controllers.updateData);

router.delete(`/${path}/:id`, controllers.deleteData);

module.exports = router;
