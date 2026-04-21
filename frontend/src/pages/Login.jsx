// ================================================
// LOGIN.JSX — Page de connexion
// ================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail]       = useState('alice@primebank.fr');
  const [password, setPassword] = useState('password123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();   // Empêche le rechargement de la page
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard'); // Redirige vers le dashboard après connexion
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>⏱️</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700' }}>
            Time Manager
          </h1>
          <p style={{ color: '#93c5fd', marginTop: '4px' }}>PrimeBank — Espace employé</p>
        </div>

        {/* Formulaire */}
        <div className="card">
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
            Connexion
          </h2>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom@primebank.fr"
                required
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              {loading ? '⏳ Connexion...' : '🔐 Se connecter'}
            </button>
          </form>

          {/* Comptes de test */}
          <div style={{
            marginTop: '24px',
            padding: '12px',
            background: 'var(--bg)',
            borderRadius: 'var(--radius)',
            fontSize: '13px'
          }}>
            <p style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-light)' }}>
              🧪 Comptes de test :
            </p>
            {[
              { email: 'alice@primebank.fr', role: 'Manager' },
              { email: 'bob@primebank.fr',   role: 'Employé' },
            ].map(account => (
              <button
                key={account.email}
                onClick={() => { setEmail(account.email); setPassword('password123'); }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px 0', color: 'var(--primary)', fontSize: '13px'
                }}
              >
                {account.role} : {account.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;