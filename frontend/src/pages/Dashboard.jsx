// ================================================
// DASHBOARD.JSX — Tableau de bord principal
// ================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ClockWidget from '../components/ClockWidget';
import api from '../api/axios';

const Dashboard = () => {
  const { user, isManager } = useAuth();
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isManager) {
      api.get('/clocks/reports')
        .then(res => setReport(res.data.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isManager]);

  // KPIs calculés depuis le rapport
  const totalEmployees = report.length;
  const presentToday   = report.filter(r => r.total_pointages > 0).length;
  const totalHours     = report.reduce((sum, r) => sum + (r.total_minutes || 0), 0);
  const avgHours       = totalEmployees > 0
    ? Math.round(totalHours / totalEmployees)
    : 0;

  return (
    <div>
      {/* En-tête */}
      <div className="page-header">
        <div>
          <h1>👋 Bonjour, {user?.first_name} !</h1>
          <p style={{ color: 'var(--text-light)', marginTop: '4px' }}>
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <span className={`badge badge-${user?.role}`}>
          {user?.role}
        </span>
      </div>

      {/* Layout : pointage à gauche, KPIs à droite */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Widget de pointage */}
        <ClockWidget />

        {/* KPIs (managers seulement) */}
        {isManager && (
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              📊 Vue d'ensemble de l'équipe
            </h2>

            {loading ? (
              <div className="loading">⏳ Chargement des KPIs...</div>
            ) : (
              <>
                <div className="kpi-grid">
                  <div className="kpi-card">
                    <div className="kpi-icon">👥</div>
                    <div className="kpi-value">{totalEmployees}</div>
                    <div className="kpi-label">Employés total</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">✅</div>
                    <div className="kpi-value" style={{ color: 'var(--success)' }}>
                      {presentToday}
                    </div>
                    <div className="kpi-label">Ont pointé</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">⏱️</div>
                    <div className="kpi-value">{Math.floor(totalHours / 60)}h</div>
                    <div className="kpi-label">Heures totales</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-icon">📈</div>
                    <div className="kpi-value">{Math.floor(avgHours / 60)}h{avgHours % 60}min</div>
                    <div className="kpi-label">Moyenne par employé</div>
                  </div>
                </div>

                {/* Tableau des employés */}
                <div className="card">
                  <h3 className="card-title">Détail par employé</h3>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Employé</th>
                          <th>Rôle</th>
                          <th>Pointages</th>
                          <th>Heures travaillées</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.map(row => (
                          <tr key={row.id}>
                            <td style={{ fontWeight: '500' }}>{row.nom}</td>
                            <td>
                              <span className={`badge badge-${row.role}`}>
                                {row.role}
                              </span>
                            </td>
                            <td>{row.total_pointages}</td>
                            <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                              {row.total_heures}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;