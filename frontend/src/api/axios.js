// ================================================
// AXIOS.JS — Client HTTP configuré
// ================================================
import axios from 'axios';

// Crée une instance Axios avec la config de base
const api = axios.create({
  baseURL: '/api/v1',         // Préfixe automatique pour toutes les requêtes
  headers: {
    'Content-Type': 'application/json'
  }
});

// ── Intercepteur de REQUÊTE ──────────────────────
// Avant chaque requête, on ajoute automatiquement le token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Ajoute "Bearer TON_TOKEN" dans le header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur de RÉPONSE ──────────────────────
// Si le serveur répond 401 (non autorisé), on déconnecte l'utilisateur
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide → déconnexion automatique
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;