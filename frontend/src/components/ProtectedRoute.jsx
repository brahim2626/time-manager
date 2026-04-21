// ================================================
// PROTECTEDROUTE.JSX — Garde les pages privées
// ================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Si l'utilisateur n'est pas connecté → redirige vers /login
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Attendre que le contexte soit chargé
  if (loading) {
    return <div className="loading">⏳ Chargement...</div>;
  }

  // Pas connecté → page de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rôle insuffisant → dashboard
  if (requiredRole && user?.role !== requiredRole &&
      !(requiredRole === 'manager' && user?.role === 'admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;