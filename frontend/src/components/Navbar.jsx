// ================================================
// NAVBAR.JSX — Barre de navigation latérale
// ================================================
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{
      width: '240px',
      background: '#1e293b',
      color: 'white',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0'
    }}>
      {/* Logo */}
      <div style={{ padding: '0 24px 32px', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>
          ⏱️ Time Manager
        </h1>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
          PrimeBank
        </p>
      </div>

      {/* Menu de navigation */}
      <nav style={{ flex: 1, padding: '16px 0' }}>
        {[
          { to: '/dashboard', icon: '📊', label: 'Dashboard',    always: true },
          { to: '/users',     icon: '👥', label: 'Utilisateurs', show: isManager },
          { to: '/teams',     icon: '🏢', label: 'Équipes',      show: isManager },
        ].filter(item => item.always || item.show).map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: isActive ? 'white' : '#94a3b8',
              background: isActive ? '#2563eb' : 'transparent',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '400',
              transition: 'all 0.2s',
              borderRadius: '0 8px 8px 0',
              marginRight: '12px',
            })}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Profil utilisateur en bas */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #334155'
      }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '700',
            marginBottom: '8px'
          }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>
            {user?.first_name} {user?.last_name}
          </p>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            {user?.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', color: '#94a3b8', borderColor: '#334155' }}
        >
          🚪 Déconnexion
        </button>
      </div>
    </aside>
  );
};

export default Navbar;