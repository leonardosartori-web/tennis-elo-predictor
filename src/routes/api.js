const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/prediction.controller');

router.get('/predict', predictionController.predictMatch);

module.exports = router;
