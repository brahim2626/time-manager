// ================================================
// TEAMS.JSX — Gestion des équipes
// ================================================
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Teams = () => {
  const [teams, setTeams]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', managerId: '' });

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTeams(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/teams', form);
      setMessage('✅ Équipe créée !');
      setShowModal(false);
      setForm({ name: '', description: '', managerId: '' });
      fetchTeams();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer l'équipe "${name}" ?`)) return;
    try {
      await api.delete(`/teams/${id}`);
      setMessage('✅ Équipe supprimée');
      fetchTeams();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>🏢 Équipes</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          ➕ Nouvelle équipe
        </button>
      </div>

      {message && (
        <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {/* Grille d'équipes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {teams.map(team => (
          <div key={team.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>🏢 {team.name}</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>
                  {team.description || 'Aucune description'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-light)' }}>
                  👥 {team.member_count} membre(s)
                </span>
                {team.manager_name && (
                  <span style={{ color: 'var(--primary)', fontWeight: '500' }}>
                    👤 {team.manager_name}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-danger btn-sm"
                onClick={() => handleDelete(team.id, team.name)}>
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal création */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Nouvelle équipe</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Nom de l'équipe *</label>
                <input value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="ex: Équipe Finance" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Description optionnelle" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline"
                  onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  ➕ Créer l'équipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;