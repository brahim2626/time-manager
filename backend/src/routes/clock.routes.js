// ==================================================
// CLOCK ROUTES — Adresses pour les pointages
// ==================================================
const express = require('express');
const router = express.Router();

const {
  recordClock,
  getUserClocks,
  getReports
} = require('../controllers/clock.controller');

router.post('/', recordClock);                     // POST /clocks
router.get('/reports', getReports);                // GET  /clocks/reports

module.exports = router;