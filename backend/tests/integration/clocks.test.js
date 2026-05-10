// ================================================
// CLOCKS.TEST.JS — Version corrigée
// ================================================
const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../../src/app');
const { cleanDatabase, closeDatabase, pool } = require('../testHelpers');

beforeEach(cleanDatabase);
afterAll(closeDatabase);

// ── Utilitaires ──────────────────────────────────
const createUser = async (email = 'emp@test.fr', role = 'employee') => {
  const hash = await bcrypt.hash('password123', 1);
  const res  = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    ['Test', 'User', email, hash, role]
  );
  return res.rows[0];
};

const getToken = async (email) => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'password123' });
  if (!res.body.token) {
    throw new Error(`Login échoué pour ${email}: ${JSON.stringify(res.body)}`);
  }
  return res.body.token;
};

// ════════════════════════════════════════════════
describe('POST /api/v1/clocks', () => {

  it('✅ doit enregistrer un clock_in (premier pointage)', async () => {
    const user  = await createUser('emp1@test.fr');
    const token = await getToken('emp1@test.fr');

    const res = await request(app)
      .post('/api/v1/clocks')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.type).toBe('clock_in');
    expect(res.body.message).toContain('Arrivée');
  });

  it('✅ doit basculer en clock_out après un clock_in', async () => {
    const user  = await createUser('emp2@test.fr');
    const token = await getToken('emp2@test.fr');

    // Premier pointage → clock_in
    await request(app)
      .post('/api/v1/clocks')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id });

    // Deuxième pointage → clock_out
    const res = await request(app)
      .post('/api/v1/clocks')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.type).toBe('clock_out');
    expect(res.body.message).toContain('Départ');
  });

  it('❌ doit refuser sans userId', async () => {
    const user  = await createUser('emp3@test.fr');
    const token = await getToken('emp3@test.fr');

    const res = await request(app)
      .post('/api/v1/clocks')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
  });

  it('❌ doit refuser sans authentification', async () => {
    const res = await request(app)
      .post('/api/v1/clocks')
      .send({ userId: 1 });

    expect(res.statusCode).toBe(401);
  });

});

// ════════════════════════════════════════════════
describe('GET /api/v1/users/:id/clocks', () => {

  it('✅ doit retourner l\'historique des pointages', async () => {
    const user  = await createUser('hist@test.fr');
    const token = await getToken('hist@test.fr');

    // Insérer des pointages directement en DB
    await pool.query(
      `INSERT INTO clocks (user_id, type) VALUES ($1, 'clock_in'), ($1, 'clock_out')`,
      [user.id]
    );

    const res = await request(app)
      .get(`/api/v1/users/${user.id}/clocks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
  });

  it('✅ doit retourner un tableau vide si pas de pointages', async () => {
    const user  = await createUser('empty@test.fr');
    const token = await getToken('empty@test.fr');

    const res = await request(app)
      .get(`/api/v1/users/${user.id}/clocks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

});

// ════════════════════════════════════════════════
describe('GET /api/v1/clocks/reports', () => {

  it('✅ accessible par un manager', async () => {
    await createUser('mgr@test.fr', 'manager');
    const token = await getToken('mgr@test.fr');

    const res = await request(app)
      .get('/api/v1/clocks/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('❌ refusé pour un employé', async () => {
    await createUser('emp@test.fr', 'employee');
    const token = await getToken('emp@test.fr');

    const res = await request(app)
      .get('/api/v1/clocks/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

});