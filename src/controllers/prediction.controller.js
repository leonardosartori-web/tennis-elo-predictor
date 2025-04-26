const EloService = require('../services/elo.service');
const { logger } = require('../utils/logger');

const eloService = new EloService();

async function predictMatch(req, res) {
    try {
        const { player1, player2, surface = 'hard' } = req.query;

        if (!player1 || !player2) {
            return res.status(400).json({
                error: 'Please provide both player1 and player2 parameters'
            });
        }

        const prediction = await eloService.predictMatch(player1, player2, surface);
        res.json(prediction);

    } catch (error) {
        logger.error('Prediction error:', error);
        res.status(500).json({
            error: error.message || 'Failed to generate prediction'
        });
    }
}

module.exports = { predictMatch };
