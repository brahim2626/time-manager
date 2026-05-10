// ================================================
// TESTHELPERS.JS — Utilitaires partagés entre tests
// ================================================
require('dotenv').config({ path: '.env.test' });

const { pool } = require('../src/config/database');

// ── Nettoyage complet de la DB entre chaque test ─
const cleanDatabase = async () => {
  await pool.query('DELETE FROM clocks');
  await pool.query('DELETE FROM team_members');
  await pool.query('DELETE FROM teams');
  await pool.query('DELETE FROM users');
  await pool.query('ALTER SEQUENCE users_id_seq  RESTART WITH 1');
  await pool.query('ALTER SEQUENCE teams_id_seq  RESTART WITH 1');
  await pool.query('ALTER SEQUENCE clocks_id_seq RESTART WITH 1');
};

// ── Fermer la connexion après le fichier de test ─
const closeDatabase = async () => {
  await pool.end();
};

module.exports = { cleanDatabase, closeDatabase, pool };