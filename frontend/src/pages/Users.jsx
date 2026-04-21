// ================================================
// USERS.JSX — Gestion des utilisateurs
// ================================================
import { useState, useEffect } from 'react';
import api from '../api/axios';

const Users = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser]  = useState(null);
  const [message, setMessage]   = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', role: 'employee', password: ''
  });

  // Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Ouvrir le modal de création
  const openCreate = () => {
    setEditUser(null);
    setForm({ firstName:'', lastName:'', email:'', phone:'', role:'employee', password:'' });
    setShowModal(true);
  };

  // Ouvrir le modal d'édition
  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      firstName: user.first_name,
      lastName:  user.last_name,
      email:     user.email,
      phone:     user.phone || '',
      role:      user.role,
      password:  ''
    });
    setShowModal(true);
  };

  // Sauvegarder (créer ou modifier)
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, form);
        setMessage('✅ Utilisateur mis à jour !');
      } else {
        await api.post('/auth/register', form);
        setMessage('✅ Utilisateur créé !');
      }
      setShowModal(false);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.message || 'Erreur'}`);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer ${name} ?`)) return;
    try {
      await api.delete(`/users/${id}`);
      setMessage('✅ Utilisateur supprimé');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Erreur lors de la suppression');
    }
  };

  if (loading) return <div className="loading">⏳ Chargement...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>👥 Utilisateurs</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          ➕ Nouvel utilisateur
        </button>
      </div>

      {message && (
        <div className={`alert ${message.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td style={{ fontWeight: '500' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'var(--primary)', color: 'white',
                      display: 'inline-flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '12px',
                      fontWeight: '700', marginRight: '10px'
                    }}>
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    {user.first_name} {user.last_name}
                  </td>
                  <td style={{ color: 'var(--text-light)' }}>{user.email}</td>
                  <td style={{ color: 'var(--text-light)' }}>{user.phone || '—'}</td>
                  <td>
                    <span className={`badge badge-${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEdit(user)}
                      >
                        ✏️ Modifier
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user.id, `${user.first_name} ${user.last_name}`)}
                      >
                        🗑️ Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal création / édition */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editUser ? '✏️ Modifier' : '➕ Créer'} un utilisateur</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input value={form.firstName}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    required />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input value={form.lastName}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    required />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select value={form.role}
                  onChange={e => setForm({...form, role: e.target.value})}>
                  <option value="employee">Employé</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {!editUser && (
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input type="password" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    required={!editUser} minLength={6} />
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline"
                  onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {editUser ? '💾 Enregistrer' : '➕ Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;