const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// --- Imports (Vérifiez les chemins !) ---
const app = require('../app');
const User = require('../models/User');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Meal = require('../models/Meals');
const Counter = require('../models/Counter');
// -----------------------------------------

let mongoServer;
let testUser;

// --- Données de Test Réutilisables ---
const validProductData = [{
    name: "Test Product", productType: "Canned_Goods", productDescription: "Valid test product",
    weightPerUnit: 0.5, weightUnit: "kg", totalQuantity: 10, status: "available"
}];

const validMealData = [{
    mealName: "Test Meal", mealDescription: "Valid test meal", mealType: "Lunch", quantity: 5
}];
const calculatedNumberOfMeals = validMealData.reduce((sum, meal) => sum + meal.quantity, 0);

// --- Fonctions d'Aide ---
const createTestUser = async () => {
    const userData = {
        name: 'Test Donor Restaurant',
        email: `donor-test-${Date.now()}@test.com`,
        password: 'password123',
        role: 'restaurant',
        address: '123 Test St',
        phone: 1234567890,
    };
    const user = new User(userData);
    await user.save();
    return user;
};

const getValidBaseData = (category = 'packaged_products') => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return {
        title: 'Valid Test Item',
        location: 'Test Location',
        expirationDate: futureDate.toISOString(),
        description: 'A valid description for testing purposes.',
        donor: testUser._id.toString(),
        category: category,
    };
};

const expectNothingCreated = async () => {
    const donationCount = await Donation.countDocuments();
    expect(donationCount).toBe(0);
    const productCount = await Product.countDocuments();
    expect(productCount).toBe(0);
    const mealCount = await Meal.countDocuments();
    expect(mealCount).toBe(0);
};

const buildPostRequest = (data) => {
    const req = request(app).post('/donation');
    Object.keys(data).forEach(key => {
        let value = data[key];
        if (key === 'products' || key === 'meals') {
            value = JSON.stringify(value);
        }
        req.field(key, String(value));
    });
    return req;
};

const expectFailure = async (res, expectedStatus, expectedErrorSubstring) => {
    expect(res.statusCode).toBe(expectedStatus);
    expect(res.body).toHaveProperty('message', expect.stringContaining('Failed to create donation'));
    if (expectedErrorSubstring) {
        if (res.body.error && typeof res.body.error === 'string') {
            expect(res.body.error).toContain(expectedErrorSubstring);
        } else {
            let foundError = false;
            if (res.body.error && res.body.error.errors) {
                for (const key in res.body.error.errors) {
                    if (res.body.error.errors[key].message.includes(expectedErrorSubstring)) {
                        foundError = true;
                        break;
                    }
                }
            }
            expect(foundError || (res.body.error && typeof res.body.error === 'string' && res.body.error.includes(expectedErrorSubstring))).toBe(true);
        }
    }
    await expectNothingCreated();
};

// --- Configuration et Nettoyage ---
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    console.log("DB de test connectée");
    await Promise.all([
        Counter.findOneAndUpdate({ _id: 'userId' }, { $setOnInsert: { seq: 0 } }, { upsert: true }),
        Counter.findOneAndUpdate({ _id: 'DonationId' }, { $setOnInsert: { seq: 0 } }, { upsert: true }),
        Counter.findOneAndUpdate({ _id: 'ProductId' }, { $setOnInsert: { seq: 0 } }, { upsert: true }),
        Counter.findOneAndUpdate({ _id: 'mealId' }, { $setOnInsert: { seq: 0 } }, { upsert: true })
    ]);
    console.log("Compteurs initialisés");
    testUser = await createTestUser();
    if (!testUser) throw new Error("Impossible de créer l'utilisateur de test.");
    console.log("Utilisateur de test créé:", testUser.email);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log("DB de test déconnectée");
});

beforeEach(async () => {
    await Donation.deleteMany({});
    await Product.deleteMany({});
    await Meal.deleteMany({});
});

// --- Suite de Tests ---
describe('POST /donation', () => {

    describe('Success Cases', () => {
        it('✅ should create a new packaged_products donation', async () => {
            const testData = { ...getValidBaseData('packaged_products'), products: validProductData };
            const res = await buildPostRequest(testData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Donation created successfully');
            expect(res.body.donation.title).toBe(testData.title);
            expect(res.body.donation.category).toBe('packaged_products');
            expect(res.body.donation.donor._id.toString()).toBe(testUser._id.toString());
            expect(res.body.donation.products.length).toBe(1);
            expect(res.body.donation.products[0].product.name).toBe(validProductData[0].name);
            const dbDonation = await Donation.findById(res.body.donation._id);
            expect(dbDonation).not.toBeNull();
            expect(dbDonation.donor.toString()).toBe(testUser._id.toString());
        });

        it('✅ should create a new prepared_meals donation', async () => {
            const testData = {
                ...getValidBaseData('prepared_meals'),
                meals: validMealData,
                numberOfMeals: calculatedNumberOfMeals
            };
            const res = await buildPostRequest(testData);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('message', 'Donation created successfully');
            expect(res.body.donation.title).toBe(testData.title);
            expect(res.body.donation.category).toBe('prepared_meals');
            expect(res.body.donation.donor._id.toString()).toBe(testUser._id.toString());
            expect(res.body.donation.numberOfMeals).toBe(calculatedNumberOfMeals);
            expect(res.body.donation.meals.length).toBe(1);
            expect(res.body.donation.meals[0].meal.mealName).toBe(validMealData[0].mealName);
            const dbDonation = await Donation.findById(res.body.donation._id);
            expect(dbDonation).not.toBeNull();
            expect(dbDonation.numberOfMeals).toBe(calculatedNumberOfMeals);
        });
    });

    describe('Failure Cases', () => {
        test.each([
            ['title'],
            ['location'],
            ['expirationDate'],
            ['description'],
            ['donor']
        ])('❌ should return 400 if base field "%s" is missing', async (field) => {
            const testData = { ...getValidBaseData('packaged_products'), products: validProductData };
            delete testData[field];
            const res = await buildPostRequest(testData);
            await expectFailure(res, 400, field);
        });

        it('❌ should return 400 if products are missing for packaged_products', async () => {
            const testData = { ...getValidBaseData('packaged_products') };
            const res = await buildPostRequest(testData);
            await expectFailure(res, 400, 'product');
        });

        it('❌ should return 400 if meals are missing for prepared_meals', async () => {
            const testData = { ...getValidBaseData('prepared_meals'), numberOfMeals: 5 };
            const res = await buildPostRequest(testData);
            await expectFailure(res, 400, 'meal');
        });

        it('❌ should return 400 if category is invalid', async () => {
            const testData = { ...getValidBaseData(), category: 'invalid_category', products: validProductData };
            const res = await buildPostRequest(testData);
            await expectFailure(res, 400, 'category');
        });

        it('❌ should return 400 if expirationDate is in the past', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            const testData = { ...getValidBaseData(), expirationDate: pastDate.toISOString(), products: validProductData };
            const res = await buildPostRequest(testData);
            await expectFailure(res, 400, 'expirationDate');
        });

        it('❌ should return 400 if products is not valid JSON string', async () => {
            const testData = { ...getValidBaseData('packaged_products'), products: 'not json' };
            const req = request(app).post('/donation');
            Object.keys(testData).forEach(key => req.field(key, String(testData[key])));
            const res = await req;
            await expectFailure(res, 400, 'products format');
        });

        it('❌ should return 400 if meals is not valid JSON string', async () => {
            const testData = { ...getValidBaseData('prepared_meals'), meals: '{not json', numberOfMeals: 5 };
            const req = request(app).post('/donation');
            Object.keys(testData).forEach(key => req.field(key, String(testData[key])));
            const res = await req;
            await expectFailure(res, 400, 'meals format');
        });
    });
});
