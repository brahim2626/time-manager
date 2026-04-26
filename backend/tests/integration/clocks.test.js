// ================================================
// CLOCKS.TEST.JS — Tests d'intégration : Pointages
// ================================================

const request = require('supertest');
const app     = require('../../src/app');
const db      = require('../../src/config/database');
const bcrypt  = require('bcryptjs');

// Utilitaires
const createUser = async (email = 'emp@test.fr', role = 'employee') => {
  const hash = await bcrypt.hash('password123', 1);
  const res  = await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    ['Test', 'User', email, hash, role]
  );
  return res.rows[0];
};

const getToken = async (email) => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'password123' });
  return res.body.token;
};

// ── Tests POST /clocks ───────────────────────────
describe('POST /api/v1/clocks', () => {

  it('✅ doit enregistrer un clock_in (premier pointage)', async () => {
    const user  = await createUser();
    const token = await getToken(user.email);

    const res = await request(app)
      .post('/api/v1/clocks')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.type).toBe('clock_in');
    expect(res.body.message).toContain('Arrivée');
  });

  it('✅ doit basculer en clock_out après un clock_in', async () => {
    const user  = await createUser();
    const token = await getToken(user.email);

    // Premier pointage → clock_in
    await request(app)
      .post('/api/v1/clocks')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id });

    // Deuxième pointage → doit être clock_out
    const res = await request(app)
      .post('/api/v1/clocks')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.type).toBe('clock_out');
    expect(res.body.message).toContain('Départ');
  });

  it('❌ doit refuser sans userId', async () => {
    const user  = await createUser();
    const token = await getToken(user.email);

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

// ── Tests GET /users/:id/clocks ──────────────────
describe('GET /api/v1/users/:id/clocks', () => {

  it('✅ doit retourner l\'historique des pointages', async () => {
    const user  = await createUser();
    const token = await getToken(user.email);

    // Créer quelques pointages
    await db.query(
      `INSERT INTO clocks (user_id, type) VALUES ($1, 'clock_in'), ($1, 'clock_out')`,
      [user.id]
    );

    const res = await request(app)
      .get(`/api/v1/users/${user.id}/clocks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.count).toBe(2);
  });

  it('✅ doit retourner un tableau vide si pas de pointages', async () => {
    const user  = await createUser();
    const token = await getToken(user.email);

    const res = await request(app)
      .get(`/api/v1/users/${user.id}/clocks`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

});

// ── Tests GET /clocks/reports ────────────────────
describe('GET /api/v1/clocks/reports', () => {

  it('✅ accessible par un manager', async () => {
    const manager = await createUser('mgr@test.fr', 'manager');
    const token   = await getToken('mgr@test.fr');

    const res = await request(app)
      .get('/api/v1/clocks/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.generatedAt).toBeDefined();
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