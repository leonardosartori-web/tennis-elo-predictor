const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');

router.get('/predict', predictionController.predictMatch);

router.get('/players', predictionController.getPlayers);

module.exports = router;
