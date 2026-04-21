-- ==================================================
-- MIGRATION 002 — Mise à jour pour l'authentification
-- ==================================================

-- Mettre à jour les utilisateurs de test avec des mots de passe
-- Le mot de passe est "password123" hashé avec bcrypt
UPDATE users
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE password_hash IS NULL;

-- Note: En vrai, les mots de passe sont hashés par l'application
-- Ce hash correspond à "password123" (pour les tests uniquement !)