// ==================================================
// CLOCK CONTROLLER — Logique pour les pointages
// ==================================================
const store = require('../data/store');

// POST /clocks → Enregistrer une arrivée ou un départ
const recordClock = (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Le champ userId est obligatoire'
      });
    }

    // Vérifier que l'utilisateur existe
    const user = store.users.find(u => u.id === parseInt(userId));
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur ${userId} introuvable`
      });
    }

    // Trouver le dernier pointage de cet utilisateur
    const userClocks = store.clocks
      .filter(c => c.userId === parseInt(userId))
      .sort((a, b) => new Date(b.clockedAt) - new Date(a.clockedAt));

    const lastClock = userClocks[0];

    // Logique toggle :
    // Si le dernier pointage = clock_in → on fait un clock_out
    // Si le dernier pointage = clock_out (ou aucun) → on fait un clock_in
    const clockType = (!lastClock || lastClock.type === 'clock_out')
      ? 'clock_in'
      : 'clock_out';

    const newClock = {
      id: store.getNextClockId(),
      userId: parseInt(userId),
      type: clockType,
      clockedAt: new Date()
    };

    store.clocks.push(newClock);

    const message = clockType === 'clock_in'
      ? `✅ Arrivée enregistrée pour ${user.firstName}`
      : `👋 Départ enregistré pour ${user.firstName}`;

    res.status(201).json({
      success: true,
      message,
      data: newClock
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /users/:id/clocks → Historique des pointages d'un utilisateur
const getUserClocks = (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = store.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur ${userId} introuvable`
      });
    }

    // Filtrer les pointages de cet utilisateur, triés par date
    const userClocks = store.clocks
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.clockedAt) - new Date(a.clockedAt));

    res.status(200).json({
      success: true,
      user: `${user.firstName} ${user.lastName}`,
      count: userClocks.length,
      data: userClocks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /reports → Rapport global
const getReports = (req, res) => {
  try {
    // Pour chaque utilisateur, calculer ses heures travaillées
    const report = store.users.map(user => {
      const userClocks = store.clocks
        .filter(c => c.userId === user.id)
        .sort((a, b) => new Date(a.clockedAt) - new Date(b.clockedAt));

      // Calculer les sessions de travail (paires clock_in / clock_out)
      let totalMinutes = 0;
      let sessions = [];

      for (let i = 0; i < userClocks.length - 1; i++) {
        if (userClocks[i].type === 'clock_in' &&
            userClocks[i + 1].type === 'clock_out') {
          const debut = new Date(userClocks[i].clockedAt);
          const fin = new Date(userClocks[i + 1].clockedAt);
          const dureeMinutes = Math.round((fin - debut) / 1000 / 60);

          totalMinutes += dureeMinutes;
          sessions.push({
            debut: debut.toISOString(),
            fin: fin.toISOString(),
            duree: `${Math.floor(dureeMinutes / 60)}h${dureeMinutes % 60}min`
          });
        }
      }

      return {
        userId: user.id,
        nom: `${user.firstName} ${user.lastName}`,
        role: user.role,
        totalHeures: `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}min`,
        nombreSessions: sessions.length,
        sessions
      };
    });

    res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { recordClock, getUserClocks, getReports };