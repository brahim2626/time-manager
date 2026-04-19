// ==================================================
// USER CONTROLLER — Version PostgreSQL
// ==================================================
const db = require('../config/database');

// ─────────────────────────────────────────────────
// GET /users → Tous les utilisateurs
// ─────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    // $1, $2... = paramètres sécurisés (évite les injections SQL)
    const result = await db.query(
      `SELECT id, first_name, last_name, email, phone, role,
              is_active, created_at
       FROM users
       WHERE is_active = true
       ORDER BY created_at DESC`
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────────────
// GET /users/:id → Un utilisateur par ID
// ─────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, first_name, last_name, email, phone, role,
              is_active, created_at
       FROM users
       WHERE id = $1 AND is_active = true`,
      [id]  // $1 sera remplacé par la valeur de id
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur ${id} introuvable`
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur getUserById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// POST /users → Créer un utilisateur
// ─────────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role } = req.body;

    // Validation
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName et email sont obligatoires'
      });
    }

    // INSERT et RETURNING = retourne la ligne insérée
    const result = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, phone, role, created_at`,
      [firstName, lastName, email, phone || null, role || 'employee']
    );

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    // Code 23505 = violation de contrainte UNIQUE (email déjà pris)
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }
    console.error('Erreur createUser:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// PUT /users/:id → Modifier un utilisateur
// ─────────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, role } = req.body;

    const result = await db.query(
      `UPDATE users
       SET first_name  = COALESCE($1, first_name),
           last_name   = COALESCE($2, last_name),
           email       = COALESCE($3, email),
           phone       = COALESCE($4, phone),
           role        = COALESCE($5, role),
           updated_at  = NOW()
       WHERE id = $6 AND is_active = true
       RETURNING id, first_name, last_name, email, phone, role, updated_at`,
      [firstName, lastName, email, phone, role, id]
    );

    // COALESCE($1, first_name) = si $1 est null, garde l'ancienne valeur

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur ${id} introuvable`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// DELETE /users/:id → Supprimer (soft delete)
// ─────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete = on ne supprime pas vraiment,
    // on marque juste is_active = false
    // (conformité RGPD : on garde la trace)
    const result = await db.query(
      `UPDATE users
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND is_active = true
       RETURNING id, first_name, last_name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur ${id} introuvable`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};