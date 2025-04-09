const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const User = require('../models/User');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Meal = require('../models/Meals');

const mongoUri = 'mongodb://localhost:27017/sustainafood';

let testUser;

const validProductData = [{
  name: "Test Product",
  productType: "Canned_Goods",
  productDescription: "Valid test product",
  weightPerUnit: 0.5,
  weightUnit: "kg",
  totalQuantity: 10,
  status: "available"
}];

const validMealData = [{
  mealName: "Test Meal",
  mealDescription: "Valid test meal",
  mealType: "Lunch",
  quantity: 5
}];

const buildPostRequest = (data) => {
  const req = request(app).post('/donation');
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'products' || key === 'meals') {
      value = JSON.stringify(value);
    }
    req.field(key, String(value));
  });
  return req;
};

const getValidBaseData = (category) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  return {
    title: 'Test Donation',
    location: 'Test Location',
    expirationDate: futureDate.toISOString(),
    description: 'Test donation description',
    donor: testUser._id.toString(),
    category
  };
};

beforeAll(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connecté pour les tests de donation.');
  } catch (err) {
    console.error('❌ Erreur de connexion MongoDB :', err);
    process.exit(1);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  console.log('🛑 Connexion MongoDB fermée.');
});

beforeEach(async () => {
  await Donation.deleteMany({});
  await Product.deleteMany({});
  await Meal.deleteMany({});
  await User.deleteMany({});

  testUser = new User({
    name: 'Test Restaurant',
    email: `donor-${Date.now()}@test.com`,
    password: 'password123',
    role: 'restaurant',
    address: '123 Test Ave',
    phone: 123456789
  });

  await testUser.save();
});

describe('✅ TEST POST /donation', () => {
  describe('✅ Cas de succès', () => {
    it('Crée une donation de produits emballés', async () => {
      const testData = {
        ...getValidBaseData('packaged_products'),
        products: validProductData
      };

      const res = await buildPostRequest(testData);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'Donation created successfully');
      expect(res.body.donation.products.length).toBe(1);
      expect(res.body.donation.products[0].product.name).toBe(validProductData[0].name);
    });

    it('Crée une donation de repas préparés', async () => {
      const testData = {
        ...getValidBaseData('prepared_meals'),
        meals: validMealData,
        numberOfMeals: 5
      };

      const res = await buildPostRequest(testData);
      expect(res.statusCode).toBe(201);
      expect(res.body.donation.meals.length).toBe(1);
      expect(res.body.donation.meals[0].meal.mealName).toBe(validMealData[0].mealName);
      expect(res.body.donation.numberOfMeals).toBe(5);
    });
  });

  describe('❌ Cas d\'échec', () => {
    const baseFields = ['title', 'location', 'expirationDate', 'description', 'donor'];

    test.each(baseFields)('Retourne 400 si le champ "%s" est manquant', async (field) => {
      const testData = {
        ...getValidBaseData('packaged_products'),
        products: validProductData
      };
      delete testData[field];

      const res = await buildPostRequest(testData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Failed to create donation/);
    });

    it('Retourne 400 si produits manquants pour category=packaged_products', async () => {
      const testData = getValidBaseData('packaged_products');
      const res = await buildPostRequest(testData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Failed to create donation/);
    });

    it('Retourne 400 si repas manquants pour category=prepared_meals', async () => {
      const testData = {
        ...getValidBaseData('prepared_meals'),
        numberOfMeals: 5
      };
      const res = await buildPostRequest(testData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Failed to create donation/);
    });

    it('Retourne 400 si catégorie invalide', async () => {
      const testData = {
        ...getValidBaseData('invalid_category'),
        products: validProductData
      };
      const res = await buildPostRequest(testData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Failed to create donation/);
    });

    it('Retourne 400 si expirationDate est dans le passé', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const testData = {
        ...getValidBaseData('packaged_products'),
        expirationDate: pastDate.toISOString(),
        products: validProductData
      };

      const res = await buildPostRequest(testData);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Failed to create donation/);
    });

    it('Retourne 400 si produits est une chaîne JSON invalide', async () => {
      const testData = {
        ...getValidBaseData('packaged_products'),
        products: 'not json'
      };

      const req = request(app).post('/donation');
      Object.keys(testData).forEach(key => req.field(key, testData[key]));
      const res = await req;

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Failed to create donation/);
    });

    it('Retourne 400 si meals est une chaîne JSON invalide', async () => {
      const testData = {
        ...getValidBaseData('prepared_meals'),
        meals: '{not json',
        numberOfMeals: 5
      };

      const req = request(app).post('/donation');
      Object.keys(testData).forEach(key => req.field(key, testData[key]));
      const res = await req;

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Failed to create donation/);
    });
  });
});
