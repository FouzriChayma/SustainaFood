const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // Ajustez le chemin si nécessaire

// --- Configuration de la base de données ---
const mongoUri = 'mongodb://localhost:27017/sustainafood';

beforeAll(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connecté pour les tests de userDetails.');
  } catch (err) {
    console.error('Erreur de connexion à MongoDB :', err);
    process.exit(1);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log('Connexion MongoDB fermée pour les tests de userDetails.');
});

// --- Suite de tests pour Get User By ID ---
describe('✅ TEST Get User By ID (GET /users/details/:id)', () => {
  
  // Utilisation d'un ID spécifique présent dans votre base de données
  const EXISTING_USER_ID = '67f40161eb96068aecab0ca8';

  // Un ObjectId plausible mais probablement inexistant
  const NON_EXISTENT_USER_ID = '111111111111111111111111';

  // Un ID au format invalide
  const INVALID_FORMAT_USER_ID = 'this-is-not-an-object-id';

  it('✅ Doit récupérer un utilisateur existant par son ID valide', async () => {
    const res = await request(app).get(`/users/details/${EXISTING_USER_ID}`);

    console.log(`GET /users/details/${EXISTING_USER_ID} Response Status:`, res.statusCode);
    console.log(`GET /users/details/${EXISTING_USER_ID} Response Body:`, res.body);

    // Assertions
    expect(res.statusCode).toBe(200); // Attente d'un succès
    expect(res.body).toHaveProperty('_id');
    expect(res.body._id).toBe(EXISTING_USER_ID); // Vérifie que l'ID correspond
    expect(res.body).toHaveProperty('email', 'mohamedtr@gmail.com'); // Vérifie l'email spécifique
    expect(res.body).toHaveProperty('name', 'mohamed trabelsi'); // Vérifie le nom spécifique
    expect(res.body).toHaveProperty('role', 'student'); // Vérifie le rôle spécifique
    expect(res.body).toHaveProperty('phone', 52352633); // Vérifie le téléphone spécifique
    // Ajoutez d'autres assertions pour les champs à vérifier
    expect(res.body.isBlocked).toBe(false);
    expect(res.body.isActive).toBe(true); // Selon vos données en DB
   
  });

  it('❌ Doit retourner 404 Not Found pour un ID utilisateur inexistant', async () => {
    const res = await request(app).get(`/users/details/${NON_EXISTENT_USER_ID}`);

    console.log(`GET /users/details/${NON_EXISTENT_USER_ID} Response Status:`, res.statusCode);
    console.log(`GET /users/details/${NON_EXISTENT_USER_ID} Response Body:`, res.body);

    // Assertions
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('User not found');
  });

  it('❌ Doit retourner 500 Internal Server Error pour un format d\'ID invalide', async () => {
    const res = await request(app).get(`/users/details/${INVALID_FORMAT_USER_ID}`);

    console.log(`GET /users/details/${INVALID_FORMAT_USER_ID} Response Status:`, res.statusCode);
    console.log(`GET /users/details/${INVALID_FORMAT_USER_ID} Response Body:`, res.body);

    // Assertions
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});
