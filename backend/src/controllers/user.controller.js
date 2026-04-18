// ==================================================
// USER CONTROLLER — Logique pour les utilisateurs
// ==================================================
const store = require('../data/store');

// ─────────────────────────────────────────
// GET /users → Récupérer tous les utilisateurs
// ─────────────────────────────────────────
const getAllUsers = (req, res) => {
  try {
    // On récupère tous les utilisateurs du store
    const users = store.users;

    // On répond avec la liste + le nombre total
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    // Si quelque chose se passe mal, on répond avec une erreur
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────
// GET /users/:id → Récupérer UN utilisateur par son ID
// ─────────────────────────────────────────
const getUserById = (req, res) => {
  try {
    // req.params.id = l'ID dans l'URL (ex: /users/2 → id = "2")
    // On convertit en nombre avec parseInt
    const id = parseInt(req.params.id);

    // On cherche l'utilisateur dans le tableau
    const user = store.users.find(u => u.id === id);

    // Si l'utilisateur n'existe pas → erreur 404
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'ID ${id} introuvable`
      });
    }

    // Si trouvé → on le renvoie
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────
// POST /users → Créer un nouvel utilisateur
// ─────────────────────────────────────────
const createUser = (req, res) => {
  try {
    // req.body = les données envoyées dans la requête
    const { firstName, lastName, email, role } = req.body;

    // Validation : est-ce que tous les champs sont présents ?
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'Les champs firstName, lastName et email sont obligatoires'
      });
    }

    // Vérifier si l'email est déjà utilisé
    const emailExists = store.users.find(u => u.email === email);
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer le nouvel utilisateur
    const newUser = {
      id: store.getNextUserId(),
      firstName,
      lastName,
      email,
      role: role || 'employee', // Par défaut : employé
      createdAt: new Date()
    };

    // L'ajouter au tableau
    store.users.push(newUser);

    // Répondre avec le nouvel utilisateur (status 201 = Créé)
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────
// PUT /users/:id → Modifier un utilisateur
// ─────────────────────────────────────────
const updateUser = (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Trouver l'index de l'utilisateur dans le tableau
    const index = store.users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'ID ${id} introuvable`
      });
    }

    // Fusionner les anciennes données avec les nouvelles
    // (on garde ce qui n'est pas modifié)
    store.users[index] = {
      ...store.users[index],   // anciennes données
      ...req.body,             // nouvelles données
      id,                      // on garde l'ID original
      updatedAt: new Date()    // on ajoute la date de modification
    };

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: store.users[index]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ─────────────────────────────────────────
// DELETE /users/:id → Supprimer un utilisateur
// ─────────────────────────────────────────
const deleteUser = (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = store.users.findIndex(u => u.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur avec l'ID ${id} introuvable`
      });
    }

    // Supprimer l'utilisateur du tableau
    const deletedUser = store.users.splice(index, 1)[0];

    res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
      data: deletedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// On exporte toutes les fonctions
module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};