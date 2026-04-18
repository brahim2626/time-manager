// ==================================================
// TEAM ROUTES — Adresses pour les équipes
// ==================================================
const express = require('express');
const router = express.Router();

const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/team.controller');

router.get('/', getAllTeams);
router.get('/:id', getTeamById);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

module.exports = router;