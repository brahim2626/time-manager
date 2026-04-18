// ==================================================
// INDEX.JS — Point d'entrée du serveur
// ==================================================
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ── Middlewares ────────────────────────────────────
app.use(cors());
app.use(express.json());

// Middleware de logging : affiche chaque requête reçue
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} — ${new Date().toLocaleTimeString()}`);
  next(); // Passe à la suite
});

// ── Import des routes ──────────────────────────────
const userRoutes = require('./routes/user.routes');
const teamRoutes = require('./routes/team.routes');
const clockRoutes = require('./routes/clock.routes');

// ── Branchement des routes ─────────────────────────
// Toutes les routes "users" commencent par /api/v1/users
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/clocks', clockRoutes);

// Route spéciale pour les clocks d'un utilisateur
// (GET /api/v1/users/:id/clocks)
const { getUserClocks } = require('./controllers/clock.controller');
app.get('/api/v1/users/:id/clocks', getUserClocks);

// ── Routes de base ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '✅ API Time Manager opérationnelle !',
    version: '1.0.0',
    endpoints: {
      users:   '/api/v1/users',
      teams:   '/api/v1/teams',
      clocks:  '/api/v1/clocks',
      reports: '/api/v1/clocks/reports'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Gestion des routes inexistantes ───────────────
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
  console.log(`📡 Environnement : ${process.env.NODE_ENV}`);
  console.log('─────────────────────────────────────');
  console.log('📋 Routes disponibles :');
  console.log(`   GET    http://localhost:${PORT}/api/v1/users`);
  console.log(`   POST   http://localhost:${PORT}/api/v1/users`);
  console.log(`   GET    http://localhost:${PORT}/api/v1/teams`);
  console.log(`   POST   http://localhost:${PORT}/api/v1/clocks`);
  console.log(`   GET    http://localhost:${PORT}/api/v1/clocks/reports`);
});