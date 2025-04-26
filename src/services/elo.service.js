const { fetchEloData } = require('./scraper.service');
const { logger } = require('../utils/logger');

class EloService {
    constructor(surfaceWeight = 0.5) {
        this.surfaceWeight = surfaceWeight;
        this.playersData = null;
        this.lastFetchTime = null;
    }

    async init() {
        await this.refreshData();
    }

    async refreshData() {
        try {
            this.playersData = await fetchEloData();
            this.lastFetchTime = new Date();
            logger.info('ELO data refreshed successfully');
        } catch (error) {
            logger.error('Failed to refresh ELO data:', error);
            throw error;
        }
    }

    async predictMatch(playerA, playerB, surface = 'hard') {
        try {
            if (!this.playersData) {
                await this.refreshData();
            }

            const findPlayer = (name) => {
                const player = this.playersData.find(p =>
                    p.name.toLowerCase().includes(name.toLowerCase())
                );
                if (!player) throw new Error(`Player not found: ${name}`);
                return player;
            };

            const pA = findPlayer(playerA);
            const pB = findPlayer(playerB);

            const adjustedElo = (player) => {
                const baseElo = player.elo * (1 - this.surfaceWeight);
                let surfaceElo = 0;

                switch (surface.toLowerCase()) {
                    case 'hard': surfaceElo = player.hElo * this.surfaceWeight; break;
                    case 'clay': surfaceElo = player.cElo * this.surfaceWeight; break;
                    case 'grass': surfaceElo = player.gElo * this.surfaceWeight; break;
                    default: throw new Error('Invalid surface');
                }

                return baseElo + surfaceElo;
            };

            const eloA = adjustedElo(pA);
            const eloB = adjustedElo(pB);
            const probA = 1 / (1 + Math.pow(10, (eloB - eloA) / 400));

            return {
                players: {
                    [playerA]: { ...pA, adjustedElo: eloA },
                    [playerB]: { ...pB, adjustedElo: eloB }
                },
                surface,
                probabilities: {
                    [playerA]: probA,
                    [playerB]: 1 - probA
                },
                eloDifference: Math.abs(eloA - eloB),
                details: `Prediction based on ${surface} surface ELO ratings`
            };
        } catch (error) {
            logger.error(`Prediction failed for ${playerA} vs ${playerB}:`, error);
            throw error;
        }
    }
}

module.exports = EloService;
