const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api');
const { logger } = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'This is an Tennis ELO API' });
})
app.use('/api', apiRouter);

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
