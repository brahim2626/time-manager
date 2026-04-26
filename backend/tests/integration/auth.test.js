// ================================================
// AUTH.TEST.JS — Tests d'intégration : Authentification
// ================================================
// Les tests d'intégration testent l'API complète :
// requête HTTP → route → controller → base de données → réponse
// C'est plus lent mais teste le vrai comportement.
// ================================================

const request = require('supertest');
const app     = require('../../src/app');
const db      = require('../../src/config/database');
const bcrypt  = require('bcryptjs');

// ── Données de test réutilisables ───────────────
const testUser = {
  firstName: 'Test',
  lastName:  'User',
  email:     'test@primebank.fr',
  password:  'password123'
};

// Fonction utilitaire : créer un user en DB directement
const createUserInDB = async (overrides = {}) => {
  const user = { ...testUser, ...overrides };
  const hash = await bcrypt.hash(user.password, 1);

  const result = await db.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [user.firstName, user.lastName, user.email, hash, user.role || 'employee']
  );
  return result.rows[0];
};

// ── Tests du register ────────────────────────────
describe('POST /api/v1/auth/register', () => {

  it('✅ doit créer un compte et retourner un token', async () => {
    // "request(app)" = fait une vraie requête HTTP à l'app
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    // Vérifications
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();        // Le token existe
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.password_hash).toBeUndefined(); // Pas de hash exposé !
  });

  it('❌ doit refuser si email déjà utilisé', async () => {
    // Créer l'user une première fois
    await createUserInDB();

    // Essayer de créer avec le même email
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('déjà utilisé');
  });

  it('❌ doit refuser si champs obligatoires manquants', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@test.fr' }); // Pas de prénom/nom/mdp

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('❌ doit refuser un mot de passe trop court', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...testUser, password: '123' }); // Moins de 6 caractères

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('6 caractères');
  });

});

// ── Tests du login ───────────────────────────────
describe('POST /api/v1/auth/login', () => {

  // Avant ces tests : créer un user dans la DB
  beforeEach(async () => {
    await createUserInDB();
  });

  it('✅ doit connecter avec les bons identifiants', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.message).toContain('Connexion réussie');
  });

  it('❌ doit refuser avec un mauvais mot de passe', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'mauvais_mdp' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('❌ doit refuser avec un email inconnu', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'inconnu@test.fr', password: 'password123' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('❌ doit refuser sans les champs requis', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
  });

});

// ── Tests de /auth/me ────────────────────────────
describe('GET /api/v1/auth/me', () => {

  let token; // On stocke le token entre les tests

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
      .set('Authorization', `Bearer ${token}`); // Envoyer le token

    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('❌ doit refuser sans token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me');
      // Pas de header Authorization

    expect(res.statusCode).toBe(401);
  });

  it('❌ doit refuser avec un token invalide', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer TOKEN_FAUX_INVALIDE');

    expect(res.statusCode).toBe(401);
  });

});