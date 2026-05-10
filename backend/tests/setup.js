// ================================================
// SETUP.JS — Configuration globale des tests
// ================================================
console.log('🔥 setup.js chargé par Jest');
// Charger les variables d'environnement de TEST
require('dotenv').config({ path: '.env.test' });

const { pool } = require('../src/config/database');

// ── Avant TOUS les tests ─────────────────────────
// Créer les tables dans la base de test
beforeAll(async () => {
  await pool.query(`

    CREATE TABLE IF NOT EXISTS users (
      id            SERIAL PRIMARY KEY,
      first_name    VARCHAR(100) NOT NULL,
      last_name     VARCHAR(100) NOT NULL,
      email         VARCHAR(255) UNIQUE NOT NULL,
      phone         VARCHAR(20),
      role          VARCHAR(20) NOT NULL DEFAULT 'employee'
                    CHECK (role IN ('employee','manager','admin')),
      password_hash VARCHAR(255),
      is_active     BOOLEAN DEFAULT true,
      created_at    TIMESTAMP DEFAULT NOW(),
      updated_at    TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS teams (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      description TEXT,
      manager_id  INT REFERENCES users(id) ON DELETE SET NULL,
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id   INT REFERENCES teams(id) ON DELETE CASCADE,
      user_id   INT REFERENCES users(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (team_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS clocks (
      id         SERIAL PRIMARY KEY,
      user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       VARCHAR(10) NOT NULL CHECK (type IN ('clock_in','clock_out')),
      clocked_at TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log('✅ Tables de test créées');
});

// ── Avant CHAQUE test ────────────────────────────
// Vider les tables pour repartir d'un état propre
beforeEach(async () => {
  // ORDER important : supprimer dans l'ordre des dépendances
  await pool.query('DELETE FROM clocks');
  await pool.query('DELETE FROM team_members');
  await pool.query('DELETE FROM teams');
  await pool.query('DELETE FROM users');
  // Réinitialiser les séquences d'ID
  await pool.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE teams_id_seq RESTART WITH 1');
  await pool.query('ALTER SEQUENCE clocks_id_seq RESTART WITH 1');
});

// ── Après TOUS les tests ─────────────────────────
// Fermer la connexion à la DB proprement
afterAll(async () => {
  await pool.end();
  console.log('🔌 Connexion DB fermée');
});