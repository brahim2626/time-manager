// ==================================================
// CLOCK CONTROLLER — Version PostgreSQL
// ==================================================
const db = require('../config/database');

// POST /clocks → Enregistrer arrivée ou départ
const recordClock = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId est obligatoire'
      });
    }

    // Vérifier que l'utilisateur existe
    const userResult = await db.query(
      'SELECT id, first_name FROM users WHERE id = $1 AND is_active = true',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur ${userId} introuvable`
      });
    }

    const user = userResult.rows[0];

    // Trouver le dernier pointage de cet utilisateur
    const lastClockResult = await db.query(
      `SELECT type FROM clocks
       WHERE user_id = $1
       ORDER BY clocked_at DESC
       LIMIT 1`,
      [userId]
    );

    const lastClock = lastClockResult.rows[0];

    // Logique toggle
    const clockType = (!lastClock || lastClock.type === 'clock_out')
      ? 'clock_in'
      : 'clock_out';

    // Insérer le nouveau pointage
    const result = await db.query(
      `INSERT INTO clocks (user_id, type)
       VALUES ($1, $2)
       RETURNING id, user_id, type, clocked_at`,
      [userId, clockType]
    );

    const message = clockType === 'clock_in'
      ? `✅ Arrivée enregistrée pour ${user.first_name}`
      : `👋 Départ enregistré pour ${user.first_name}`;

    res.status(201).json({
      success: true,
      message,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur recordClock:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /users/:id/clocks → Historique des pointages
const getUserClocks = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'utilisateur existe
    const userResult = await db.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur ${id} introuvable`
      });
    }

    const user = userResult.rows[0];

    // Récupérer tous ses pointages
    const clocksResult = await db.query(
      `SELECT id, type, clocked_at
       FROM clocks
       WHERE user_id = $1
       ORDER BY clocked_at DESC`,
      [id]
    );

    res.status(200).json({
      success: true,
      user: `${user.first_name} ${user.last_name}`,
      count: clocksResult.rows.length,
      data: clocksResult.rows
    });
  } catch (error) {
    console.error('Erreur getUserClocks:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /clocks/reports → Rapport global
const getReports = async (req, res) => {
  try {
    // Requête SQL qui calcule les heures travaillées
    // en associant les clock_in avec les clock_out
const result = await db.query(`
  WITH clock_pairs AS (
    SELECT
      c.user_id,
      c.clocked_at AS start_time,
      LEAD(c.clocked_at) OVER (
        PARTITION BY c.user_id
        ORDER BY c.clocked_at
      ) AS end_time,
      c.type
    FROM clocks c
  )
  SELECT
    u.id,
    u.first_name || ' ' || u.last_name AS nom,
    u.role,
    COUNT(c.id) AS total_pointages,
    COALESCE(SUM(
      CASE
        WHEN cp.type = 'clock_in' AND cp.end_time IS NOT NULL
        THEN EXTRACT(EPOCH FROM (cp.end_time - cp.start_time)) / 60
        ELSE 0
      END
    ), 0)::INT AS total_minutes
  FROM users u
  LEFT JOIN clocks c ON u.id = c.user_id
  LEFT JOIN clock_pairs cp ON u.id = cp.user_id
  WHERE u.is_active = true
  GROUP BY u.id, u.first_name, u.last_name, u.role
  ORDER BY u.last_name
`);

    // Formater les minutes en "Xh Ymin"
    const report = result.rows.map(row => ({
      ...row,
      total_heures: `${Math.floor(row.total_minutes / 60)}h${row.total_minutes % 60}min`
    }));

    res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      data: report
    });
  } catch (error) {
    console.error('Erreur getReports:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { recordClock, getUserClocks, getReports };