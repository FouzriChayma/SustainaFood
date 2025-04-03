const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

const mongoUri = 'mongodb://localhost:27017/sustainafood'; // ✅ Remplace par ta base

beforeAll(async () => {
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('✅ TEST FONCTIONNALITÉ 2FA POUR UTILISATEUR AVEC 2FA ACTIVÉ', () => {
  let userEmail = "mariemtouzri5@gmail.com"; // ✅ Remplacer par un user réel
  let twoFACode = null;

  // ✅ Envoi du code 2FA
  it('✅ Devrait envoyer un code 2FA pour test2fa@gmail.com', async () => {
    const res = await request(app).post('/users/send-2fa-code').send({ email: userEmail });

    console.log('Réponse envoi code 2FA:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', '2FA code sent successfully');

    // Récupérer le code généré en base
    const user = await User.findOne({ email: userEmail });
    twoFACode = user.twoFACode;
    console.log('✅ Code 2FA récupéré depuis MongoDB :', twoFACode);
  });

  // ✅ Vérification code correct
  it('✅ Devrait valider le bon code 2FA et recevoir un token', async () => {
    const res = await request(app).post('/users/validate-2fa-code').send({
      email: userEmail,
      twoFACode: twoFACode
    });

    console.log('Réponse validation 2FA:', res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('role');
    expect(res.body).toHaveProperty('id');
  });

  // ❌ Test mauvais code
  it('❌ Devrait échouer avec un mauvais code 2FA', async () => {
    // ✅ Renvoi nouveau code valide pour simuler un mauvais ensuite
    await request(app).post('/users/send-2fa-code').send({ email: userEmail });

    const res = await request(app).post('/users/validate-2fa-code').send({
      email: userEmail,
      twoFACode: "000000" // Faux code volontaire
    });

    console.log('Réponse mauvais code 2FA:', res.body);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Invalid 2FA code'); // ✅ Message attendu
  });
});
