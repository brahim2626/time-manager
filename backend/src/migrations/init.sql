-- ==================================================
-- INIT.SQL — Création des tables Time Manager
-- Ce fichier est exécuté automatiquement au
-- premier démarrage de PostgreSQL
-- ==================================================

-- ── Extension pour les UUID ─────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table : users ───────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(20),
    role          VARCHAR(20) NOT NULL DEFAULT 'employee'
                  CHECK (role IN ('employee', 'manager', 'admin')),
    password_hash VARCHAR(255),
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- ── Table : teams ───────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id  INT REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ── Table : team_members ────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
    team_id   INT REFERENCES teams(id) ON DELETE CASCADE,
    user_id   INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- ── Table : clocks ──────────────────────────────
CREATE TABLE IF NOT EXISTS clocks (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(10) NOT NULL
               CHECK (type IN ('clock_in', 'clock_out')),
    clocked_at TIMESTAMP DEFAULT NOW()
);

-- ── Index pour les performances ─────────────────
CREATE INDEX IF NOT EXISTS idx_clocks_user_id
    ON clocks(user_id);

CREATE INDEX IF NOT EXISTS idx_clocks_clocked_at
    ON clocks(clocked_at);

-- ── Données de test ─────────────────────────────
-- Le hash correspond au mot de passe : password123
INSERT INTO users (first_name, last_name, email, role, password_hash, is_active)
VALUES
  (
    'Alice', 'Dupont', 'alice@primebank.fr', 'manager',
    '$2a$04$akwbLp6Qh5YSuDcj4Ou8mOla8gxXuEgA4IAS.IgWVDR1zZd3HrCKa',
    true
  ),
  (
    'Bob', 'Martin', 'bob@primebank.fr', 'employee',
    '$2a$04$akwbLp6Qh5YSuDcj4Ou8mOla8gxXuEgA4IAS.IgWVDR1zZd3HrCKa',
    true
  ),
  (
    'Charlie', 'Durand', 'charlie@primebank.fr', 'employee',
    '$2a$04$akwbLp6Qh5YSuDcj4Ou8mOla8gxXuEgA4IAS.IgWVDR1zZd3HrCKa',
    true
  ),
  (
    'Admin', 'PrimeBank', 'admin@primebank.fr', 'admin',
    '$2a$04$akwbLp6Qh5YSuDcj4Ou8mOla8gxXuEgA4IAS.IgWVDR1zZd3HrCKa',
    true
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO teams (name, description, manager_id)
VALUES
  ('Équipe Finance',    'Département finance de PrimeBank',    1),
  ('Équipe IT',         'Département informatique',            1),
  ('Service Client',    'Département service client',          1)
ON CONFLICT DO NOTHING;

INSERT INTO team_members (team_id, user_id)
VALUES
  (1, 1), (1, 2), (1, 3)
ON CONFLICT DO NOTHING;

INSERT INTO clocks (user_id, type, clocked_at)
VALUES
  (2, 'clock_in',  NOW() - INTERVAL '8 hours'),
  (2, 'clock_out', NOW() - INTERVAL '1 hour'),
  (3, 'clock_in',  NOW() - INTERVAL '7 hours'),
  (3, 'clock_out', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Message de confirmation
DO $$ BEGIN
    RAISE NOTICE '✅ Base de données Time Manager initialisée !';
END $$;