const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

const CACHE_TTL = 6 * 24 * 60 * 60 * 1000; // 6 giorni in millisecondi

const CACHE_PATHS = {
    atp: '../../data/atp-cache.json',
    wta: '../../data/wta-cache.json',
}

function cleanText(text) {
    return text.trim()
        .replace(/\u00A0/g, ' ')      // \xa0 -> spazio
        .replace(/\s+/g, ' ');         // Multipli spazi -> singolo spazio
}

async function fetchEloData(cat) {
    try {
        const CACHE_PATH = path.join(__dirname, CACHE_PATHS[cat]);
        // Verifica se esiste una cache valida
        if (fs.existsSync(CACHE_PATH)) {
            const cachedData = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
            const now = new Date().getTime();

            if (now - cachedData.timestamp < CACHE_TTL) {
                logger.info('Using cached ELO data');
                return cachedData.data;
            }
        }

        logger.info('Fetching fresh ELO data from Tennis Abstract');
        const { data } = await axios.get(`https://tennisabstract.com/reports/${cat}_elo_ratings.html`, {
            headers: {
                'User-Agent': 'TennisEloPredictor/1.0 (+https://github.com/your-repo)'
            }
        });

        const $ = cheerio.load(data);
        const players = [];

        $('table#reportable tbody tr').each((i, row) => {
            const cols = $(row).find('td');
            const player = {
                name: cleanText($(cols[1]).text()),
                elo: parseFloat(cleanText($(cols[3]).text())) || 0,
                hElo: parseFloat(cleanText($(cols[6]).text())) || 0,
                cElo: parseFloat(cleanText($(cols[8]).text())) || 0,
                gElo: parseFloat(cleanText($(cols[10]).text())) || 0,
                atpRank: parseFloat(cleanText($(cols[15]).text())) || 0
            };
            players.push(player);
        });

        // Salva in cache
        const cacheData = {
            timestamp: new Date().getTime(),
            data: players
        };
        fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData, null, 2));

        return players;
    } catch (error) {
        logger.error('Scraping failed:', error);
        throw new Error('Failed to fetch ELO data');
    }
}

module.exports = { fetchEloData };
