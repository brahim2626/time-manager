-- ==================================================
-- INIT.SQL — Version corrigée
-- ==================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Table : users ───────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    phone       VARCHAR(20),
    role        VARCHAR(20) NOT NULL
                DEFAULT 'employee'
                CHECK (role IN ('employee', 'manager', 'admin')),

    -- 🔴 CORRECTION ICI
    password_hash    VARCHAR(255) NOT NULL,

    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
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
    team_id     INT REFERENCES teams(id) ON DELETE CASCADE,
    user_id     INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (team_id, user_id)
);

-- ── Table : clocks ──────────────────────────────
CREATE TABLE IF NOT EXISTS clocks (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(10) NOT NULL
                CHECK (type IN ('clock_in', 'clock_out')),
    clocked_at  TIMESTAMP DEFAULT NOW()
);

-- ── Index ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clocks_user_id ON clocks(user_id);
CREATE INDEX IF NOT EXISTS idx_clocks_clocked_at ON clocks(clocked_at);

-- ── Données de test AVEC mot de passe ───────────
-- password = password123
-- hash bcrypt valide

INSERT INTO users (first_name, last_name, email, role, password_hash)
VALUES
    ('Alice', 'Dupont', 'alice@primebank.fr', 'manager', '$2b$10$.sT9PDgcZXLr1rJoTLpzCufhUTg5GyHcpRVTwEeT/eJ1WXupSI7xG'),
    ('Bob', 'Martin', 'bob@primebank.fr', 'employee', '$2b$10$.sT9PDgcZXLr1rJoTLpzCufhUTg5GyHcpRVTwEeT/eJ1WXupSI7xG'),
    ('Charlie', 'Durand', 'charlie@primebank.fr', 'employee', '$2b$10$.sT9PDgcZXLr1rJoTLpzCufhUTg5GyHcpRVTwEeT/eJ1WXupSI7xG')
ON CONFLICT (email) DO NOTHING;

-- ── Teams ──────────────────────────────────────
INSERT INTO teams (name, description, manager_id)
VALUES ('Équipe Finance', 'Département finance de PrimeBank', 1)
ON CONFLICT DO NOTHING;

-- ── Members ────────────────────────────────────
INSERT INTO team_members (team_id, user_id)
VALUES (1, 1), (1, 2), (1, 3)
ON CONFLICT DO NOTHING;

-- ── Clocks ─────────────────────────────────────
INSERT INTO clocks (user_id, type, clocked_at)
VALUES
    (2, 'clock_in',  '2024-03-01 09:05:00'),
    (2, 'clock_out', '2024-03-01 17:30:00'),
    (3, 'clock_in',  '2024-03-01 09:15:00'),
    (3, 'clock_out', '2024-03-01 18:00:00');

-- ── Message ─────────────────────────────────────
DO $$ BEGIN
    RAISE NOTICE '✅ DB initialisée avec utilisateurs + mots de passe !';
END $$;