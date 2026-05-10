// ==================================================
// AUTH CONTROLLER — Login, Register, Profil
// ==================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// ─────────────────────────────────────────────────
// Fonction utilitaire : créer un JWT token
// ─────────────────────────────────────────────────
const createToken = (user) => {
  console.log('JWT_SECRET =', process.env.JWT_SECRET);
  
  return token = jwt.sign(
  {
    id: user.id,
    role: user.role,
    email: user.email
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
};

// ─────────────────────────────────────────────────
// POST /auth/register → Créer un compte
// ─────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // ── Validation ──────────────────────────────
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit faire au moins 6 caractères'
      });
    }

    // ── Vérifier que l'email n'existe pas ───────
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // ── Hasher le mot de passe ───────────────────
    // bcrypt.hash("password123", 10) → "$2a$10$..."
    // Le "10" = nombre de tours de hashage (plus c'est élevé, plus c'est sécurisé)
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, rounds);

    // ── Créer l'utilisateur ──────────────────────
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, 'employee')
       RETURNING id, first_name, last_name, email, role, created_at`,
      [firstName, lastName, email, phone || null, passwordHash]
    );

    const newUser = result.rows[0];

    // ── Créer le token JWT ───────────────────────
    const token = createToken(newUser);

    res.status(201).json({
      success: true,
      message: `Bienvenue ${firstName} ! Compte créé avec succès.`,
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// POST /auth/login → Se connecter
// ─────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ──────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe obligatoires'
      });
    }

    // ── Chercher l'utilisateur ───────────────────
    const result = await db.query(
      `SELECT id, first_name, last_name, email, role, password_hash, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    // Message générique pour ne pas révéler si l'email existe
    const invalidCredentials = {
      success: false,
      message: 'Email ou mot de passe incorrect'
    };

    if (!user) {
      return res.status(401).json(invalidCredentials);
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé, contactez votre administrateur'
      });
    }

    // ── Vérifier le mot de passe ─────────────────
    // bcrypt.compare("password123", "$2a$10$...") → true ou false
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json(invalidCredentials);
    }

    // ── Créer le token JWT ───────────────────────
    const token = createToken(user);

    // On ne renvoie PAS le hash du mot de passe !
    const { password_hash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: `Connexion réussie ! Bonjour ${user.first_name} 👋`,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// GET /auth/me → Voir son propre profil
// (nécessite d'être connecté)
// ─────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user est ajouté par le middleware JWT (voir étape suivante)
    const result = await db.query(
      `SELECT id, first_name, last_name, email, phone, role, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getMe:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// PUT /auth/change-password → Changer son mot de passe
// ─────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Ancien et nouveau mot de passe obligatoires'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit faire au moins 6 caractères'
      });
    }

    // Récupérer le hash actuel
    const result = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    const isValid = await bcrypt.compare(
      currentPassword,
      result.rows[0].password_hash
    );

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher et sauvegarder le nouveau mot de passe
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const newHash = await bcrypt.hash(newPassword, rounds);

    await db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newHash, req.user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { register, login, getMe, changePassword };