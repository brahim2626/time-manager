// ================================================
// CLOCKWIDGET.JSX — Bouton de pointage
// ================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ClockWidget = () => {
  const { user } = useAuth();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [lastClock, setLastClock]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [message, setMessage]         = useState('');
  const [time, setTime]               = useState(new Date());

  // Horloge en temps réel
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Charger le dernier pointage au démarrage
  useEffect(() => {
    const fetchLastClock = async () => {
      try {
        const res = await api.get(`/users/${user.id}/clocks`);
        const clocks = res.data.data;
        if (clocks.length > 0) {
          const last = clocks[0];
          setLastClock(last);
          setIsClockedIn(last.type === 'clock_in');
        }
      } catch (err) {
        console.error('Erreur chargement pointages:', err);
      }
    };
    if (user?.id) fetchLastClock();
  }, [user]);

  // Enregistrer un pointage
  const handleClock = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/clocks', { userId: user.id });
      setMessage(res.data.message);
      setIsClockedIn(!isClockedIn);
      setLastClock(res.data.data);
    } catch (err) {
      setMessage('❌ Erreur lors du pointage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ textAlign: 'center', maxWidth: '320px' }}>
      {/* Horloge */}
      <div style={{
        fontSize: '40px', fontWeight: '700',
        color: 'var(--primary)', fontVariantNumeric: 'tabular-nums'
      }}>
        {time.toLocaleTimeString('fr-FR')}
      </div>
      <div style={{ color: 'var(--text-light)', marginBottom: '24px', fontSize: '14px' }}>
        {time.toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      </div>

      {/* Statut actuel */}
      <div style={{
        padding: '8px 16px',
        borderRadius: '20px',
        background: isClockedIn ? '#dcfce7' : '#fee2e2',
        color: isClockedIn ? '#166534' : '#991b1b',
        display: 'inline-block',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '20px'
      }}>
        {isClockedIn ? '🟢 En service' : '🔴 Hors service'}
      </div>

      {/* Dernier pointage */}
      {lastClock && (
        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
          Dernier pointage : {new Date(lastClock.clocked_at).toLocaleTimeString('fr-FR')}
        </p>
      )}

      {/* Bouton de pointage */}
      <button
        onClick={handleClock}
        disabled={loading}
        className="btn"
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '16px',
          background: isClockedIn
            ? 'var(--danger)'
            : 'var(--success)',
          color: 'white',
          border: 'none',
          justifyContent: 'center'
        }}
      >
        {loading ? '⏳ En cours...' :
          isClockedIn ? '🚪 Pointer le départ' : '✅ Pointer l\'arrivée'}
      </button>

      {/* Message de confirmation */}
      {message && (
        <div className="alert alert-success" style={{ marginTop: '12px', marginBottom: 0 }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ClockWidget;