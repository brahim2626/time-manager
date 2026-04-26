const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'time_manager_dev',
  user:     process.env.DB_USER     || 'tm_user',
  password: process.env.DB_PASSWORD || 'tm_password',

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const query = (text, params) => pool.query(text, params);

const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connecté à PostgreSQL avec succès !');
  } catch (err) {
    console.error('❌ Erreur de connexion à PostgreSQL :', err.message);
  }
};

module.exports = { query, pool, testConnection };