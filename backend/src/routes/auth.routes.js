// ==================================================
// AUTH ROUTES — Login, Register, Profil
// ==================================================
const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes publiques (pas besoin d'être connecté)
router.post('/register', register);
router.post('/login',    login);

// Routes protégées (token JWT obligatoire)
router.get('/me',              protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;