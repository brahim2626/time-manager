// ================================================
// USERS.TEST.JS — Version corrigée
// ================================================
const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../../src/app');
const { cleanDatabase, closeDatabase, pool } = require('../testHelpers');

beforeEach(cleanDatabase);
afterAll(closeDatabase);

// ── Utilitaires ──────────────────────────────────
const createUser = async (overrides = {}) => {
  const hash = await bcrypt.hash('password123', 1);
  const data = {
    firstName: 'Test', lastName: 'User',
    email: 'user@test.fr', role: 'employee',
    ...overrides
  };
  const res = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.firstName, data.lastName, data.email, hash, data.role]
  );
  return res.rows[0];
};

const getToken = async (email, password = 'password123') => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });
  if (!res.body.token) {
    throw new Error(`Login échoué pour ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
};

// ════════════════════════════════════════════════
describe('GET /api/v1/users', () => {

  it('✅ doit retourner la liste pour un manager', async () => {
    await createUser({ email: 'mgr@test.fr', role: 'manager' });
    await createUser({ email: 'emp@test.fr', role: 'employee' });
    const token = await getToken('mgr@test.fr');

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('❌ doit refuser pour un employé (403)', async () => {
    await createUser({ email: 'emp@test.fr', role: 'employee' });
    const token = await getToken('emp@test.fr');

    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  it('❌ doit refuser sans authentification (401)', async () => {
    const res = await request(app).get('/api/v1/users');
    expect(res.statusCode).toBe(401);
  });

});

// ════════════════════════════════════════════════
describe('POST → Créer un utilisateur', () => {

  it('✅ doit créer un utilisateur valide', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Alice', lastName: 'Dupont',
        email: 'alice@primebank.fr', password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe('alice@primebank.fr');
  });

});

// ════════════════════════════════════════════════
describe('PUT /api/v1/users/:id', () => {

  it('✅ doit modifier son propre profil', async () => {
    const user  = await createUser({ email: 'mod@test.fr' });
    const token = await getToken('mod@test.fr');

    const res = await request(app)
      .put(`/api/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Nouveau' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.first_name).toBe('Nouveau');
  });

  it('❌ doit retourner 404 pour un ID inexistant', async () => {
    await createUser({ email: 'admin@test.fr', role: 'admin' });
    const token = await getToken('admin@test.fr');

    const res = await request(app)
      .put('/api/v1/users/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Test' });

    expect(res.statusCode).toBe(404);
  });

});

// ════════════════════════════════════════════════
describe('DELETE /api/v1/users/:id', () => {

  it('✅ un admin peut supprimer un utilisateur', async () => {
    await createUser({ email: 'admin@test.fr',  role: 'admin' });
    const target = await createUser({ email: 'target@test.fr' });
    const token  = await getToken('admin@test.fr');

    const res = await request(app)
      .delete(`/api/v1/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });

  it('❌ un employé ne peut pas supprimer (403)', async () => {
    await createUser({ email: 'emp@test.fr',    role: 'employee' });
    const target = await createUser({ email: 'target@test.fr' });
    const token  = await getToken('emp@test.fr');

    const res = await request(app)
      .delete(`/api/v1/users/${target.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

});