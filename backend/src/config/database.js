// ==================================================
// DATABASE.JS — Connexion à PostgreSQL
// ==================================================
const { Pool } = require('pg');

// Pool = groupe de connexions réutilisables
// (évite d'ouvrir/fermer une connexion à chaque requête)
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'time_manager_dev',
  user:     process.env.DB_USER     || 'tm_user',
  password: process.env.DB_PASSWORD || 'tm_password',

  // Options de performance
  max: 10,                    // Maximum 10 connexions simultanées
  idleTimeoutMillis: 30000,   // Ferme une connexion inactive après 30s
  connectionTimeoutMillis: 2000, // Timeout si connexion impossible
});

// Test de connexion au démarrage
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Erreur de connexion à PostgreSQL :', err.message);
  } else {
    console.log('✅ Connecté à PostgreSQL avec succès !');
    release(); // Libère la connexion de test
  }
});

// Fonction utilitaire pour faire des requêtes SQL
// Usage : const result = await query('SELECT * FROM users WHERE id = $1', [id])
const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };