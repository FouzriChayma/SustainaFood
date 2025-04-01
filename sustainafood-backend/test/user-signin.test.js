const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Assurez-vous que ce chemin vers votre app Express est correct

// --- Début de la logique de connexion modifiée ---

// 1. Lire la variable d'environnement fournie par Jenkins (contient mongodb://mongo-test-instance:27017/testdb)
const mongoUriFromEnv = process.env.MONGO_URI;

// 2. Définir une URI par défaut pour le développement local
//    IMPORTANT : Utiliser un nom de base de données différent pour les tests locaux !
const defaultLocalMongoUri = 'mongodb://127.0.0.1:27017/sustainafood_test_local'; 

// 3. Choisir quelle URI utiliser : celle de l'environnement si elle existe, sinon celle par défaut
const mongoUriToUse = mongoUriFromEnv || defaultLocalMongoUri;

beforeAll(async () => {
  console.log(`Attempting to connect to MongoDB at: ${mongoUriToUse}`); // Log pour débogage

  try {
    // 4. Utiliser l'URI sélectionnée pour la connexion Mongoose
    await mongoose.connect(mongoUriToUse, {
       useNewUrlParser: true, // Options recommandées
       useUnifiedTopology: true
       // serverSelectionTimeoutMS: 30000 // Décommenter si besoin d'un timeout plus long
    });
    console.log('MongoDB connection successful.');

  } catch (err) {
    console.error('FATAL: MongoDB connection error:', err);
    console.error(`Failed to connect to: ${mongoUriToUse}`);
    // Quitter immédiatement si la connexion échoue
    process.exit(1); 
  }
});

afterAll(async () => {
  try {
    // Utiliser disconnect() est généralement préféré à connection.close()
    await mongoose.disconnect(); 
    console.log('MongoDB disconnected.');
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
});

// --- Fin de la logique de connexion modifiée ---


// --- Test Suite for Get User By ID ---
describe('✅ TEST Get User By ID (GET /users/details/:id)', () => {

  // ATTENTION : Utiliser des IDs/données pré-existantes rend les tests fragiles.
  // Idéalement, créez les données de test dans un bloc beforeEach/beforeAll
  // et nettoyez-les dans un afterEach/afterAll.
  const EXISTING_USER_ID = '67bdf9511252b84ad112abc0'; 
  const NON_EXISTENT_USER_ID = '111111111111111111111111';
  const INVALID_FORMAT_USER_ID = 'this-is-not-an-object-id';

  it('✅ Should retrieve an existing user by their valid ID', async () => {
    const res = await request(app).get(`/users/details/${EXISTING_USER_ID}`);

    // Garder les logs peut être utile pour le débogage dans Jenkins
    console.log(`GET /users/details/${EXISTING_USER_ID} Response Status:`, res.statusCode);
    // console.log(`GET /users/details/${EXISTING_USER_ID} Response Body:`, res.body); // Optionnel, peut être verbeux

    expect(res.statusCode).toBe(200); 
    expect(res.body).toHaveProperty('_id');
    expect(res.body._id).toBe(EXISTING_USER_ID); 
    // Vous pouvez garder les vérifications spécifiques si cet utilisateur DOIT exister
    // dans la base de données utilisée par les tests (locale ou celle de Jenkins)
    expect(res.body).toHaveProperty('email', 'wala.ammar@esprit.tn'); 
    expect(res.body).toHaveProperty('name', 'wala ammar'); 
    // ... autres assertions ...
  });

  it('❌ Should return 404 Not Found for a non-existent user ID', async () => {
    const res = await request(app).get(`/users/details/${NON_EXISTENT_USER_ID}`);
    console.log(`GET /users/details/${NON_EXISTENT_USER_ID} Response Status:`, res.statusCode);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error', 'User not found');
  });

  it('❌ Should return 500 Internal Server Error for an invalid ID format', async () => {
    // Note : Le code d'erreur exact (500 ou 400/422) peut dépendre de la gestion d'erreur Mongoose/Express
    const res = await request(app).get(`/users/details/${INVALID_FORMAT_USER_ID}`);
    console.log(`GET /users/details/${INVALID_FORMAT_USER_ID} Response Status:`, res.statusCode);
    expect(res.statusCode).toBe(500); // Ou potentiellement 400 si Mongoose CastError est mieux géré
    expect(res.body).toHaveProperty('error');
  });

});


// --- Test Suite for Sign In ---
describe('✅ TEST SIGN IN SUR DONNEES EXISTANTES', () => {

  // ATTENTION : Mêmes remarques sur les données pré-existantes.
  const testUserEmail = "carrefour@gmail.com"; 
  const testUserPassword = "carrefour";

  it('✅ Devrait se connecter avec un utilisateur existant', async () => {
    const res = await request(app).post('/users/login').send({
      email: testUserEmail, 
      password: testUserPassword
    });

    console.log(`POST /users/login (Success) Response Status:`, res.statusCode);
    // console.log(`POST /users/login (Success) Response Body:`, res.body); // Optionnel

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role'); 
    expect(res.body).toHaveProperty('id');
  });

  it('❌ Devrait échouer avec un mauvais mot de passe pour cet email', async () => {
    const res = await request(app).post('/users/login').send({
      email: testUserEmail, 
      password: "WrongPassword" // Mauvais mot de passe
    });

    console.log(`POST /users/login (Failure) Response Status:`, res.statusCode);
    // console.log(`POST /users/login (Failure) Response Body:`, res.body); // Optionnel

    expect(res.statusCode).toBe(400); // ou 401 Unauthorized selon votre implémentation
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });

  it('❌ Devrait échouer avec un email non existant', async () => {
    const res = await request(app).post('/users/login').send({
      email: "nonexistent@example.com", 
      password: "anypassword" 
    });

    console.log(`POST /users/login (Non-existent Email) Response Status:`, res.statusCode);
    expect(res.statusCode).toBe(400); // ou 401
    expect(res.body).toHaveProperty('error', 'Invalid credentials'); // Souvent le même message pour des raisons de sécurité
  });

});
