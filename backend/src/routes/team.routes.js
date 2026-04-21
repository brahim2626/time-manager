const express = require('express');
const router = express.Router();
const {
  getAllTeams, getTeamById, createTeam,
  updateTeam, deleteTeam, addMember, removeMember
} = require('../controllers/team.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin, isManager } = require('../middleware/role.middleware');

router.get('/',                       protect,           getAllTeams);
router.get('/:id',                    protect,           getTeamById);
router.post('/',                      protect, isManager, createTeam);
router.put('/:id',                    protect, isManager, updateTeam);
router.delete('/:id',                 protect, isAdmin,   deleteTeam);
router.post('/:id/members',           protect, isManager, addMember);
router.delete('/:id/members/:userId', protect, isManager, removeMember);

module.exports = router;