// ==================================================
// USER ROUTES — Adresses pour les utilisateurs
// ==================================================
const express = require('express');
const router = express.Router();

// On importe le controller
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');

// On branche chaque adresse sur sa fonction
router.get('/', getAllUsers);           // GET    /users
router.get('/:id', getUserById);       // GET    /users/1
router.post('/', createUser);          // POST   /users
router.put('/:id', updateUser);        // PUT    /users/1
router.delete('/:id', deleteUser);     // DELETE /users/1

module.exports = router;