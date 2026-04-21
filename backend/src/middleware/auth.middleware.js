// ==================================================
// AUTH MIDDLEWARE — Vérification du token JWT
// ==================================================
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // ── Récupérer le token ──────────────────────
    // Le token est envoyé dans le header Authorization
    // Format : "Bearer eyJhbGciOiJI..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '🔒 Accès refusé : token manquant. Connectez-vous d\'abord.'
      });
    }

    // Extraire le token (enlever "Bearer ")
    const token = authHeader.split(' ')[1];

    // ── Vérifier et décoder le token ────────────
    // jwt.verify lance une erreur si le token est invalide ou expiré
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Attacher les infos de l'utilisateur ─────
    // Disponible dans tous les controllers via req.user
    req.user = {
      id:    decoded.id,
      email: decoded.email,
      role:  decoded.role
    };

    // ── Passer à la suite ────────────────────────
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '🔒 Session expirée. Reconnectez-vous.'
      });
    }
    return res.status(401).json({
      success: false,
      message: '🔒 Token invalide.'
    });
  }
};

module.exports = { protect };