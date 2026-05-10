// ================================================
// GLOBALSETUP.JS — Exécuté UNE SEULE FOIS
// avant tous les fichiers de test
// ================================================

require('dotenv').config({ path: '.env.test' });

const { Pool } = require('pg');

module.exports = async () => {
  const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 5432,
    database: process.env.DB_NAME     || 'time_manager_test',
    user:     process.env.DB_USER     || 'tm_user',
    password: process.env.DB_PASSWORD || 'tm_password',
  });

  try {
    console.log('🚀 GlobalSetup : création des tables de test...');

    // On supprime et recrée proprement
    // pour éviter tout conflit entre les runs
    await pool.query(`
      DROP TABLE IF EXISTS clocks       CASCADE;
      DROP TABLE IF EXISTS team_members CASCADE;
      DROP TABLE IF EXISTS teams        CASCADE;
      DROP TABLE IF EXISTS users        CASCADE;
    `);

    // Créer l'extension UNE SEULE FOIS ici
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Créer les tables
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

    console.log('✅ GlobalSetup : tables créées avec succès !');
  } catch (err) {
    console.error('❌ GlobalSetup erreur :', err.message);
    throw err;
  } finally {
    await pool.end();
  }
};