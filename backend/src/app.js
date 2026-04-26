// ================================================
// APP.JS — Application Express (sans démarrage)
// Séparé de index.js pour pouvoir tester sans
// lancer un vrai serveur
// ================================================
const express = require('express');
const cors    = require('cors');
require('dotenv').config({
  // En test, charge .env.test ; sinon .env
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const app = express();

// ── Middlewares ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ─────────────────────────────────────
const authRoutes  = require('./routes/auth.routes');
const userRoutes  = require('./routes/user.routes');
const teamRoutes  = require('./routes/team.routes');
const clockRoutes = require('./routes/clock.routes');

app.use('/api/v1/auth',  authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/teams', teamRoutes);
app.use('/api/v1/clocks', clockRoutes);

const { protect }       = require('./middleware/auth.middleware');
const { getUserClocks } = require('./controllers/clock.controller');
app.get('/api/v1/users/:id/clocks', protect, getUserClocks);

app.get('/', (req, res) => {
  res.json({ message: '✅ API Time Manager', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route introuvable' });
});

// On EXPORTE l'app sans la démarrer
module.exports = app;