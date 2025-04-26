const express = require('express');
const cors = require('cors');
const apiRouter = require('./routes/api');
const path = require('path');
const { logger } = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

app.use(express.static('../public'));

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'This is an Tennis ELO API' });
})
app.use('/api', apiRouter);
app.get('/cli', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
