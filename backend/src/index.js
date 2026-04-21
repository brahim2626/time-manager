// ==================================================
// INDEX.JS — Point d'entrée (version finale étape 5-6)
// ==================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middlewares globaux ────────────────────────────
app.use(cors());
app.use(express.json());

// Logger de requêtes
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} — ${new Date().toLocaleTimeString()}`);
  next();
});

// ── Import des routes ──────────────────────────────
const authRoutes  = require('./routes/auth.routes');
const userRoutes  = require('./routes/user.routes');
const teamRoutes  = require('./routes/team.routes');
const clockRoutes = require('./routes/clock.routes');

// ── Branchement des routes ─────────────────────────
app.use('/api/v1/auth',  authRoutes);   // 🔓 Publique + protégée
app.use('/api/v1/users', userRoutes);   // 🔒 Protégée
app.use('/api/v1/teams', teamRoutes);   // 🔒 Protégée
app.use('/api/v1/clocks', clockRoutes); // 🔒 Protégée

// Route pour les clocks d'un utilisateur
const { protect } = require('./middleware/auth.middleware');
const { getUserClocks } = require('./controllers/clock.controller');
app.get('/api/v1/users/:id/clocks', protect, getUserClocks);

// ── Routes de base ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '✅ API Time Manager v2.0 — Authentification activée !',
    endpoints: {
      auth:    { login: 'POST /api/v1/auth/login', register: 'POST /api/v1/auth/register' },
      users:   '/api/v1/users',
      teams:   '/api/v1/teams',
      clocks:  '/api/v1/clocks',
      reports: '/api/v1/clocks/reports'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', auth: 'JWT', timestamp: new Date().toISOString() });
});

// ── Route 404 ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} introuvable`
  });
});

// ── Démarrage ──────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🔐 Authentification JWT activée`);
  console.log(`📡 Environnement : ${process.env.NODE_ENV}`);
});