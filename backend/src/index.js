// On importe les bibliothèques installées
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// On crée l'application Express
const app = express();

// --- MIDDLEWARES ---
// (Les middlewares sont des "filtres" que chaque requête traverse)

// Permet au frontend (React) de communiquer avec ce serveur
app.use(cors());

// Permet de lire le JSON envoyé dans les requêtes
app.use(express.json());

// --- ROUTES ---
// Une route = une adresse que l'API écoute

// Route de test : GET /
app.get('/', (req, res) => {
  res.json({
    message: '✅ Bienvenue sur l\'API Time Manager !',
    version: '1.0.0',
    status: 'running'
  });
});

// Route de santé : GET /health
// (Utile pour vérifier que le serveur est vivant)
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// --- DÉMARRAGE DU SERVEUR ---
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📡 Environnement : ${process.env.NODE_ENV}`);
});