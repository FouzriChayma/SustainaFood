
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); 
const User = require('../models/User'); 

const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/sustainafood'; // Utiliser une DB dédiée si possible

const testUserEmail = `auth-test-${Date.now()}@test.com`;
const testUserPassword = "Password123!";

const validSignupData = {
    name: 'Auth Test User',
    email: testUserEmail,
    password: testUserPassword,
    confirmPassword: testUserPassword,
    phone: 12345678,
    address: '123 Test Street',
    role: 'student'
};

let createdUserId = null;


beforeAll(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log(`[AUTH TEST SETUP] MongoDB connecté pour auth tests sur: ${mongoUri}`);
    await User.deleteOne({ email: testUserEmail });
    console.log(`[AUTH TEST SETUP] Nettoyage préalable pour ${testUserEmail} effectué.`);
  } catch (err) {
    console.error('[AUTH TEST SETUP] Erreur connexion/nettoyage DB:', err);
    process.exit(1);
  }
});

afterAll(async () => {
  try {
    console.log(`[AUTH TEST TEARDOWN] Tentative suppression utilisateur: ${testUserEmail}`);
    if (testUserEmail) {
        const deleteResult = await User.deleteOne({ email: testUserEmail });
         if (deleteResult.deletedCount > 0) {
            console.log(`[AUTH TEST TEARDOWN] Utilisateur ${testUserEmail} supprimé.`);
        } else {
             console.warn(`[AUTH TEST TEARDOWN] Utilisateur ${testUserEmail} non trouvé lors du nettoyage.`);
        }
    }
  } catch (err) {
    console.error("[AUTH TEST TEARDOWN] Erreur nettoyage:", err);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('[AUTH TEST TEARDOWN] Connexion MongoDB fermée.');
    }
  }
});

// --- Suites de Tests ---

describe('Authentication Flow (Signup & Signin)', () => {

  // --- Tests Signup (Inscription) ---
  // Utilisation du chemin '/users/create' trouvé dans routes/users.js
  describe("POST /users/create (Signup)", () => { 

    it('✅ devrait inscrire un nouvel utilisateur avec des données valides', async () => {
      console.log(`\n--- TEST: Signup Réussi ---`);
      console.log(`[TEST] Envoi POST /users/create pour ${validSignupData.email}`); 
      const res = await request(app)
        .post('/users/create') 
        .send(validSignupData);
      console.log('[TEST] Réponse reçue (Signup Réussi):', { status: res.statusCode, body: res.body });

      // Attentes
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('email', validSignupData.email);
      expect(res.body).toHaveProperty('name', validSignupData.name);
      expect(res.body).toHaveProperty('role', validSignupData.role);
      

      createdUserId = res.body._id;
    });

    it('❌ devrait échouer à inscrire avec un email déjà existant', async () => {
      console.log(`\n--- TEST: Signup Échoué (Email Dupliqué) ---`);
      console.log(`[TEST] Envoi POST /users/create pour ${validSignupData.email} (encore)`); 
       const res = await request(app)
        .post('/users/create') 
        .send(validSignupData);
       console.log('[TEST] Réponse reçue (Email Dupliqué):', { status: res.statusCode, body: res.body });

       // Attentes
       expect(res.statusCode).toBe(400);
       expect(res.body).toHaveProperty('error');
       expect(res.body.error).toMatch(/Email already exists/i);
    });

    it('❌ devrait échouer si les mots de passe ne correspondent pas', async () => {
        console.log(`\n--- TEST: Signup Échoué (MDP Discordants) ---`);
        const invalidData = { ...validSignupData, email: `mismatch-${Date.now()}@test.com`, confirmPassword: 'differentPassword123!' };
        console.log(`[TEST] Envoi POST /users/create pour ${invalidData.email} avec MDP discordants`); 
        const res = await request(app)
            .post('/users/create') 
            .send(invalidData);
        console.log('[TEST] Réponse reçue (MDP Discordants):', { status: res.statusCode, body: res.body });

        // Attentes
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/Passwords do not match/i);
    });

     it('❌ devrait échouer si un champ requis est manquant (ex: name)', async () => {
        console.log(`\n--- TEST: Signup Échoué (Champ Manquant) ---`);
        const invalidData = { ...validSignupData, email: `missing-${Date.now()}@test.com` };
        delete invalidData.name;
        console.log(`[TEST] Envoi POST /users/create pour ${invalidData.email} sans nom`); 
        const res = await request(app)
            .post('/users/create') 
            .send(invalidData);
         console.log('[TEST] Réponse reçue (Champ Manquant):', { status: res.statusCode, body: res.body });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
        expect(res.body.error).toMatch(/Veuillez remplir tous les champs|Path `name` is required/i);
    });
  });

  // --- Tests Signin (Connexion) ---
  describe('POST /users/login (Signin)', () => {

    it('✅ devrait connecter l\'utilisateur précédemment inscrit avec succès', async () => {
       expect(createdUserId).not.toBeNull(); 
       console.log(`\n--- TEST: Signin Réussi ---`);
       console.log(`[TEST] Envoi POST /users/login pour ${testUserEmail}`);
      const res = await request(app)
        .post('/users/login') 
        .send({
          email: testUserEmail,
          password: testUserPassword
        });
       console.log('[TEST] Réponse reçue (Signin Réussi):', { status: res.statusCode, body: res.body });

       expect(res.statusCode).toBe(200);
       expect(res.body).toHaveProperty('token');
       expect(res.body).toHaveProperty('role', validSignupData.role);
       expect(res.body).toHaveProperty('id', createdUserId);
       expect(res.body.is2FAEnabled).toBe(false);
    });

    it('❌ devrait échouer à connecter avec un mot de passe incorrect', async () => {
      const wrongPassword = "IncorrectPassword123!";
      console.log(`\n--- TEST: Signin Échoué (Mauvais MDP) ---`);
      console.log(`[TEST] Envoi POST /users/login pour ${testUserEmail} avec MAUVAIS MDP`);
      const res = await request(app)
        .post('/users/login') 
        .send({
          email: testUserEmail,
          password: wrongPassword
        });
      console.log('[TEST] Réponse reçue (Mauvais MDP):', { status: res.statusCode, body: res.body });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
      expect(res.body).not.toHaveProperty('token');
    });

    it('❌ devrait échouer à connecter avec un email inexistant', async () => {
      const nonExistentEmail = `nosuchuser-${Date.now()}@test.com`;
       console.log(`\n--- TEST: Signin Échoué (Email Inexistant) ---`);
       console.log(`[TEST] Envoi POST /users/login pour ${nonExistentEmail}`);
      const res = await request(app)
        .post('/users/login') 
        .send({
          email: nonExistentEmail,
          password: "anypassword"
        });
      console.log('[TEST] Réponse reçue (Email Inexistant):', { status: res.statusCode, body: res.body });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
      expect(res.body).not.toHaveProperty('token');
    });
  });
});
