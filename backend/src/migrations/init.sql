-- ==================================================
-- INIT.SQL — Création des tables Time Manager
-- Ce fichier est exécuté automatiquement au
-- premier démarrage de PostgreSQL
-- ==================================================

-- ── Extension pour les UUID ─────────────────────
-- (les UUID sont des IDs uniques comme "a1b2-c3d4-...")
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table : users ───────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,        -- ID auto-incrémenté
    first_name  VARCHAR(100) NOT NULL,     -- Prénom (obligatoire)
    last_name   VARCHAR(100) NOT NULL,     -- Nom (obligatoire)
    email       VARCHAR(255) UNIQUE NOT NULL, -- Email unique
    phone       VARCHAR(20),               -- Téléphone (optionnel)
    role        VARCHAR(20) NOT NULL       -- 'employee', 'manager', 'admin'
                DEFAULT 'employee'
                CHECK (role IN ('employee', 'manager', 'admin')),
    password_hash VARCHAR(255),            -- Mot de passe (étape 6)
    is_active   BOOLEAN DEFAULT true,      -- Compte actif ?
    created_at  TIMESTAMP DEFAULT NOW(),   -- Date de création
    updated_at  TIMESTAMP DEFAULT NOW()    -- Date de modification
);

-- ── Table : teams ───────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id  INT REFERENCES users(id)   -- Lien vers un utilisateur
                ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- ── Table : team_members (relation users ↔ teams) ─
-- Un utilisateur peut être dans plusieurs équipes
-- Une équipe peut avoir plusieurs utilisateurs
CREATE TABLE IF NOT EXISTS team_members (
    team_id     INT REFERENCES teams(id) ON DELETE CASCADE,
    user_id     INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)         -- Clé primaire combinée
);

-- ── Table : clocks ──────────────────────────────
CREATE TABLE IF NOT EXISTS clocks (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(10) NOT NULL
                CHECK (type IN ('clock_in', 'clock_out')),
    clocked_at  TIMESTAMP DEFAULT NOW()
);

-- ── Index pour les performances ─────────────────
-- (accélère les recherches par user_id)
CREATE INDEX IF NOT EXISTS idx_clocks_user_id
    ON clocks(user_id);

CREATE INDEX IF NOT EXISTS idx_clocks_clocked_at
    ON clocks(clocked_at);

-- ── Données de test ─────────────────────────────
-- (pour avoir quelque chose à voir dès le départ)
INSERT INTO users (first_name, last_name, email, role)
VALUES
    ('Alice', 'Dupont', 'alice@primebank.fr', 'manager'),
    ('Bob', 'Martin', 'bob@primebank.fr', 'employee'),
    ('Charlie', 'Durand', 'charlie@primebank.fr', 'employee')
ON CONFLICT (email) DO NOTHING;  -- Évite les doublons si relancé

INSERT INTO teams (name, description, manager_id)
VALUES ('Équipe Finance', 'Département finance de PrimeBank', 1)
ON CONFLICT DO NOTHING;

INSERT INTO team_members (team_id, user_id)
VALUES (1, 1), (1, 2), (1, 3)
ON CONFLICT DO NOTHING;

INSERT INTO clocks (user_id, type, clocked_at)
VALUES
    (2, 'clock_in',  '2024-03-01 09:05:00'),
    (2, 'clock_out', '2024-03-01 17:30:00'),
    (3, 'clock_in',  '2024-03-01 09:15:00'),
    (3, 'clock_out', '2024-03-01 18:00:00');

-- Message de confirmation
DO $$ BEGIN
    RAISE NOTICE '✅ Base de données Time Manager initialisée avec succès !';
END $$;