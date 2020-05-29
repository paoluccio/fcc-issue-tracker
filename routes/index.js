const express = require('express');
const path = require('path');
const api = require('./api/routes/index');

const router = express.Router();

// API routes
router.use('/api', api);

// Index page (List of projects)
router.get('/', (req, res, next) => res.sendFile(path.resolve('views/index.html')));

// Issues page (List of issues)
router.get('/:project', (req, res, next) => res.sendFile(path.resolve('views/issues.html')));

// Error handler
router.use((err, req, res, next) => {
  if (err) res.status(err.status || 500).json({ error: err.message || 'SERVER ERROR' });
});

// Handle non existing routes
router.use((req, res) => res.redirect('/'));

module.exports = router;