// ==================================================
// ROLE MIDDLEWARE — Contrôle d'accès par rôle (RBAC)
// ==================================================

// Usage : router.get('/admin', protect, requireRole('admin'), handler)
// Usage : router.get('/managers', protect, requireRole('manager', 'admin'), handler)

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user est défini par le middleware protect (doit venir avant)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '🔒 Non authentifié'
      });
    }

    // Vérifier si le rôle de l'utilisateur est dans la liste autorisée
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `🚫 Accès interdit. Rôles autorisés : ${allowedRoles.join(', ')}. Votre rôle : ${req.user.role}`
      });
    }

    next(); // Le rôle est autorisé → on continue
  };
};

// Raccourcis pratiques
const isAdmin   = requireRole('admin');
const isManager = requireRole('manager', 'admin');
const isEmployee = requireRole('employee', 'manager', 'admin');

module.exports = { requireRole, isAdmin, isManager, isEmployee };