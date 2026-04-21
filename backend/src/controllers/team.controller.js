// ==================================================
// TEAM CONTROLLER — Version PostgreSQL complète
// ==================================================
const db = require('../config/database');

// ─────────────────────────────────────────────────
// GET /teams → Toutes les équipes avec leurs membres
// ─────────────────────────────────────────────────
const getAllTeams = async (req, res) => {
  try {
    // On récupère les équipes avec le nom du manager
    const teamsResult = await db.query(`
      SELECT
        t.id,
        t.name,
        t.description,
        t.manager_id,
        t.created_at,
        u.first_name || ' ' || u.last_name AS manager_name,
        COUNT(tm.user_id) AS member_count
      FROM teams t
      LEFT JOIN users u ON t.manager_id = u.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY t.id, u.first_name, u.last_name
      ORDER BY t.created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: teamsResult.rows.length,
      data: teamsResult.rows
    });
  } catch (error) {
    console.error('Erreur getAllTeams:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// GET /teams/:id → Une équipe avec tous ses membres
// ─────────────────────────────────────────────────
const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer l'équipe
    const teamResult = await db.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name AS manager_name
       FROM teams t
       LEFT JOIN users u ON t.manager_id = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (teamResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Équipe ${id} introuvable`
      });
    }

    // Récupérer les membres de l'équipe
    const membersResult = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role,
              tm.joined_at
       FROM users u
       JOIN team_members tm ON u.id = tm.user_id
       WHERE tm.team_id = $1 AND u.is_active = true
       ORDER BY tm.joined_at`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...teamResult.rows[0],
        members: membersResult.rows
      }
    });
  } catch (error) {
    console.error('Erreur getTeamById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// POST /teams → Créer une équipe
// ─────────────────────────────────────────────────
const createTeam = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le champ name est obligatoire'
      });
    }

    // Vérifier que le manager existe si fourni
    if (managerId) {
      const managerCheck = await db.query(
        `SELECT id FROM users
         WHERE id = $1 AND role IN ('manager', 'admin') AND is_active = true`,
        [managerId]
      );
      if (managerCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Utilisateur ${managerId} introuvable ou n'est pas manager`
        });
      }
    }

    // Créer l'équipe dans une transaction
    // (transaction = plusieurs opérations qui réussissent ou échouent ensemble)
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN'); // Début de la transaction

      const teamResult = await client.query(
        `INSERT INTO teams (name, description, manager_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, description || null, managerId || null]
      );

      const team = teamResult.rows[0];

      // Ajouter automatiquement le manager comme membre
      if (managerId) {
        await client.query(
          `INSERT INTO team_members (team_id, user_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [team.id, managerId]
        );
      }

      await client.query('COMMIT'); // Valider la transaction

      res.status(201).json({
        success: true,
        message: 'Équipe créée avec succès',
        data: team
      });
    } catch (err) {
      await client.query('ROLLBACK'); // Annuler si erreur
      throw err;
    } finally {
      client.release(); // Toujours libérer la connexion
    }
  } catch (error) {
    console.error('Erreur createTeam:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// PUT /teams/:id → Modifier une équipe
// ─────────────────────────────────────────────────
const updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;

    const result = await db.query(
      `UPDATE teams
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           manager_id  = COALESCE($3, manager_id),
           updated_at  = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, managerId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Équipe ${id} introuvable`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Équipe mise à jour',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur updateTeam:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// DELETE /teams/:id → Supprimer une équipe
// ─────────────────────────────────────────────────
const deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM teams WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Équipe ${id} introuvable`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Équipe supprimée',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur deleteTeam:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// POST /teams/:id/members → Ajouter un membre
// ─────────────────────────────────────────────────
const addMember = async (req, res) => {
  try {
    const { id } = req.params;       // ID de l'équipe
    const { userId } = req.body;     // ID de l'utilisateur à ajouter

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId est obligatoire'
      });
    }

    await db.query(
      `INSERT INTO team_members (team_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [id, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Membre ajouté à l\'équipe'
    });
  } catch (error) {
    console.error('Erreur addMember:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ─────────────────────────────────────────────────
// DELETE /teams/:id/members/:userId → Retirer un membre
// ─────────────────────────────────────────────────
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    await db.query(
      'DELETE FROM team_members WHERE team_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Membre retiré de l\'équipe'
    });
  } catch (error) {
    console.error('Erreur removeMember:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllTeams, getTeamById, createTeam,
  updateTeam, deleteTeam, addMember, removeMember
};