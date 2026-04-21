const express = require('express');
const router = express.Router();
const { recordClock, getUserClocks, getReports } = require('../controllers/clock.controller');
const { protect } = require('../middleware/auth.middleware');
const { isManager } = require('../middleware/role.middleware');

router.post('/',          protect,           recordClock);  // Tout le monde peut pointer
router.get('/reports',    protect, isManager, getReports);  // Managers seulement

module.exports = router;