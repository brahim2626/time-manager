// ================================================
// APP.JSX — Composant racine avec les routes
// ================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Teams from './pages/Teams';

// Layout avec la barre de navigation
const AppLayout = ({ children }) => (
  <div className="app-layout">
    <Navbar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Page publique */}
          <Route path="/login" element={<Login />} />

          {/* Pages protégées (connexion requise) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><Dashboard /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute requiredRole="manager">
              <AppLayout><Users /></AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/teams" element={
            <ProtectedRoute requiredRole="manager">
              <AppLayout><Teams /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;