const express = require('express');
const router = express.Router();
const {
  getAllUsers, getUserById, createUser, updateUser, deleteUser
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { isAdmin, isManager } = require('../middleware/role.middleware');

// protect = doit être connecté
// isAdmin = doit être admin
// isManager = doit être manager ou admin

router.get('/',      protect, isManager, getAllUsers);    // Managers et admins seulement
router.get('/:id',   protect, getUserById);              // Tout utilisateur connecté
router.post('/',     protect, isAdmin,   createUser);    // Admins seulement
router.put('/:id',   protect,            updateUser);    // Tout utilisateur connecté
router.delete('/:id',protect, isAdmin,   deleteUser);    // Admins seulement

module.exports = router;