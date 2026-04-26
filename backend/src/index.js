// ================================================
// INDEX.JS — Démarrage du serveur
// ================================================
const app  = require('./app');

require('dotenv').config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`🔐 Authentification JWT activée`);
  console.log(`📡 Environnement : ${process.env.NODE_ENV}`);
});