// ================================================
// AUTH.TEST.JS — Version corrigée
// ================================================
const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../../src/app');
const { cleanDatabase, closeDatabase, pool } = require('../testHelpers');

// ── Nettoyage avant CHAQUE test ──────────────────
beforeEach(cleanDatabase);

// ── Fermeture DB après CE fichier ────────────────
afterAll(closeDatabase);

// ── Données de test ──────────────────────────────
const testUser = {
  firstName: 'Test',
  lastName:  'User',
  email:     'test@primebank.fr',
  password:  'password123'
};

// Crée un user directement en DB (sans passer par l'API)
const createUserInDB = async (overrides = {}) => {
  const user = { ...testUser, ...overrides };
  const hash = await bcrypt.hash(user.password, 1);
  const result = await pool.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user.firstName, user.lastName, user.email, hash, user.role || 'employee']
  );
  return result.rows[0];
};

// ════════════════════════════════════════════════
describe('POST /api/v1/auth/register', () => {

  it('✅ doit créer un compte et retourner un token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('❌ doit refuser si email déjà utilisé', async () => {
    await createUserInDB(); // Crée l'user
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);     // Même email → doit échouer

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('déjà utilisé');
  });

  it('❌ doit refuser si champs obligatoires manquants', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.fr' });

    expect(res.statusCode).toBe(400);
  });

  it('❌ doit refuser un mot de passe trop court', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, password: '123' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('6 caractères');
  });

});

// ════════════════════════════════════════════════
describe('POST /api/v1/auth/login', () => {

  // Crée l'user avant CHAQUE test de ce groupe
  beforeEach(async () => {
    await createUserInDB();
  });

  it('✅ doit connecter avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.message).toContain('Connexion réussie');
  });

  it('❌ doit refuser avec un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'mauvais_mdp' });

    expect(res.statusCode).toBe(401);
  });

  it('❌ doit refuser avec un email inconnu', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'inconnu@test.fr', password: 'password123' });

    expect(res.statusCode).toBe(401);
  });

  it('❌ doit refuser sans les champs requis', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
  });

});

// ════════════════════════════════════════════════
describe('GET /api/v1/auth/me', () => {

  let token;

  beforeEach(async () => {
    await createUserInDB();
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    token = res.body.token;
  });

  it('✅ doit retourner le profil avec un token valide', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('❌ doit refuser sans token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('❌ doit refuser avec un token invalide', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer TOKEN_COMPLETEMENT_FAUX');
    expect(res.statusCode).toBe(401);
  });

});