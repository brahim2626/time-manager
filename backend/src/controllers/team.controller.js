// ==================================================
// TEAM CONTROLLER — Logique pour les équipes
// ==================================================
const store = require('../data/store');

// GET /teams → Toutes les équipes
const getAllTeams = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      count: store.teams.length,
      data: store.teams
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET /teams/:id → Une équipe par ID
const getTeamById = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const team = store.teams.find(t => t.id === id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: `Équipe avec l'ID ${id} introuvable`
      });
    }

    // On enrichit la réponse avec les infos des membres
    const members = store.users.filter(u => team.members.includes(u.id));
    const manager = store.users.find(u => u.id === team.managerId);

    res.status(200).json({
      success: true,
      data: {
        ...team,
        managerDetails: manager || null,
        memberDetails: members
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST /teams → Créer une équipe
const createTeam = (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le champ name est obligatoire'
      });
    }

    const newTeam = {
      id: store.getNextTeamId(),
      name,
      description: description || '',
      managerId: managerId || null,
      members: managerId ? [managerId] : [],
      createdAt: new Date()
    };

    store.teams.push(newTeam);

    res.status(201).json({
      success: true,
      message: 'Équipe créée avec succès',
      data: newTeam
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// PUT /teams/:id → Modifier une équipe
const updateTeam = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = store.teams.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Équipe avec l'ID ${id} introuvable`
      });
    }

    store.teams[index] = {
      ...store.teams[index],
      ...req.body,
      id,
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Équipe mise à jour avec succès',
      data: store.teams[index]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// DELETE /teams/:id → Supprimer une équipe
const deleteTeam = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = store.teams.findIndex(t => t.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Équipe avec l'ID ${id} introuvable`
      });
    }

    const deleted = store.teams.splice(index, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Équipe supprimée avec succès',
      data: deleted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

module.exports = { getAllTeams, getTeamById, createTeam, updateTeam, deleteTeam };