// ================================================
// AUTHCONTEXT.JSX — État global de l'authentification
// ================================================
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

// 1. Créer le contexte
const AuthContext = createContext(null);

// 2. Créer le "fournisseur" qui enveloppe toute l'app
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);    // L'utilisateur connecté
  const [token, setToken]     = useState(null);    // Son token JWT
  const [loading, setLoading] = useState(true);    // Chargement initial

  // Au démarrage : récupérer les infos stockées dans localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // ── Fonction de connexion ──────────────────────
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;

    // Sauvegarder dans localStorage (persiste si on ferme le navigateur)
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  };

  // ── Fonction de déconnexion ────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // ── Vérifications de rôle ──────────────────────
  const isAdmin   = user?.role === 'admin';
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  // 3. Fournir les données à tous les enfants
  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      isAdmin, isManager,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Hook pour utiliser le contexte facilement
// Usage dans un composant : const { user, login } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return context;
};