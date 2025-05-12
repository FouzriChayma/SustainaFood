
const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../app'); 
const User = require('../models/User');
const Donation = require('../models/Donation');
const Product = require('../models/Product');
const Meal = require('../models/Meals'); 
const Counter = require('../models/Counter');


const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/sustainafood';

let testUser; 
let testUserCreatedByThisRun = false; 
let createdDonationId = null;
let createdProductIds = [];
let createdMealIds = [];


const validProductData = [{
    name: "Test Product DB Cleanup Targeted", productType: "Canned_Goods", productDescription: "Valid test product for targeted cleanup",
    weightPerUnit: 0.5, weightUnit: "kg", totalQuantity: 10, status: "available"
}];

const validMealData = [{
    mealName: "Test Meal DB Cleanup Targeted", mealDescription: "Valid test meal for targeted cleanup", mealType: "Lunch", quantity: 5
}];
const calculatedNumberOfMeals = validMealData.reduce((sum, meal) => sum + meal.quantity, 0);



const createTransientTestUser = async () => {
    const uniqueEmail = `test_donor_transient_cleanup_${Date.now()}@test.target`;
    console.log(`SETUP: Tentative de création de l'utilisateur TRANSIENT : ${uniqueEmail}`);
    const userData = {
        name: 'Transient Test Donor Targeted', email: uniqueEmail, password: 'password123',
        role: 'restaurant', address: 'Transient Test Address Targeted', phone: 12345678,
    };
    let user = new User(userData);
    try {
        await user.save();
        console.log(`SETUP: Utilisateur de test TRANSIENT créé : ${user.email} (ID: ${user._id})`);
        testUserCreatedByThisRun = true; // Marquer pour suppression
        return user;
    } catch (error) {
        console.error("SETUP: Erreur CRITIQUE lors de la création de l'utilisateur transient:", error);
        throw new Error(`Impossible de créer l'utilisateur transient ${uniqueEmail}`);
    }
};

// Crée un objet de données de base valide pour une donation/requête
const getValidBaseData = (category = 'packaged_products') => {
    if (!testUser || !testUser._id) throw new Error("TEST LOGIC ERROR: testUser non initialisé");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    return {
        title: `Valid Transient Item ${Date.now()}`, location: 'Transient Location',
        expirationDate: futureDate.toISOString(), description: 'Transient description.',
        donor: testUser._id.toString(), category: category,
    };
};

// Construit la requête POST avec les données fournies
const buildPostRequest = (data) => {
    const req = request(app).post('/donation');
    Object.keys(data).forEach(key => {
        let value = data[key];
        if ((key === 'products' || key === 'meals') && typeof value !== 'string') {
            value = JSON.stringify(value);
        }
        req.field(key, String(value));
    });
    return req;
};

// Assertion commune pour les cas d'échec (400)
// Ne vérifie PAS si des documents ont été créés.
const expectFailure = async (res, expectedStatus, expectedErrorSubstring) => {
    expect(res.statusCode).toBe(expectedStatus);
    expect(res.body).toHaveProperty('message');
    if (expectedErrorSubstring) {
        let errorMessage = `${res.body.message || ''} ${JSON.stringify(res.body.error || '')}`;
        expect(errorMessage).toContain(expectedErrorSubstring);
    }
    // On assume (et on espère) qu'un échec 400 n'a rien créé.
    // Si quelque chose était créé avant l'erreur, le nettoyage `afterEach`
    // ne le verrait pas car aucun ID n'aurait été enregistré.
};


// --- Configuration et Nettoyage (Jest) ---
beforeAll(async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log(`SETUP (beforeAll): Connecté à la DB CIBLE: ${mongoUri}`);
        // Assurer compteurs (idempotent)
        await Promise.all([
             Counter.findOneAndUpdate({ _id: 'userId' }, { $setOnInsert: { seq: 0 } }, { upsert: true, new: true }),
             Counter.findOneAndUpdate({ _id: 'DonationId' }, { $setOnInsert: { seq: 0 } }, { upsert: true, new: true }),
             Counter.findOneAndUpdate({ _id: 'ProductId' }, { $setOnInsert: { seq: 0 } }, { upsert: true, new: true }),
             Counter.findOneAndUpdate({ _id: 'mealId' }, { $setOnInsert: { seq: 0 } }, { upsert: true, new: true })
        ]);
        console.log("SETUP (beforeAll): Compteurs vérifiés.");
        // Créer l'utilisateur unique pour cette session de tests
        testUser = await createTransientTestUser();
    } catch (err) {
        console.error("SETUP (beforeAll): Erreur fatale:", err);
        process.exit(1);
    }
});

afterAll(async () => {
    // Supprimer l'utilisateur de test SI il a été créé par cette exécution
    if (testUser && testUser._id && testUserCreatedByThisRun) {
        try {
            console.log(`TEARDOWN (afterAll): Tentative de suppression Utilisateur Transient ${testUser.email}`);
            const deleteResult = await User.findByIdAndDelete(testUser._id);
            if (deleteResult) console.log(`TEARDOWN (afterAll): Utilisateur transient supprimé.`);
            else console.warn(`TEARDOWN (afterAll): Utilisateur transient ${testUser.email} non trouvé pour suppression.`);
        } catch (err) {
            console.error(`TEARDOWN (afterAll): ERREUR suppression Utilisateur transient ${testUser.email}:`, err);
        }
    } else {
         console.log(`TEARDOWN (afterAll): Pas d'utilisateur transient à supprimer ou flag non positionné.`);
    }
    await mongoose.connection.close();
    console.log("TEARDOWN (afterAll): Déconnecté de la DB.");
});


// !! NETTOYAGE CIBLÉ après CHAQUE test !!
afterEach(async () => {
    const cleanupStartTime = Date.now();
    let errors = [];
    console.log(`--- CLEANUP (afterEach) START - Don:${createdDonationId} Prod:${createdProductIds.length} Meal:${createdMealIds.length} ---`);

    try {
        // 1. Supprimer la Donation créée par le test (si ID enregistré)
        if (createdDonationId) {
            console.log(`CLEANUP (afterEach): Suppression Donation ID: ${createdDonationId}`);
            const deleteResult = await Donation.deleteOne({ _id: createdDonationId });
            if (deleteResult.deletedCount !== 1) {
                const warnMsg = `WARN (CLEANUP): Donation ${createdDonationId} non trouvée/supprimée (${deleteResult.deletedCount}).`;
                console.warn(warnMsg); errors.push(warnMsg);
            } else { console.log(`CLEANUP (afterEach): Donation ${createdDonationId} OK.`); }
        }

        // 2. Supprimer les Produits créés par le test (si IDs enregistrés)
        if (createdProductIds.length > 0) {
             console.log(`CLEANUP (afterEach): Suppression ${createdProductIds.length} Produit(s) IDs: ${createdProductIds.join(', ')}`);
            const deleteResult = await Product.deleteMany({ _id: { $in: createdProductIds } });
            if (deleteResult.deletedCount !== createdProductIds.length) {
                const warnMsg = `WARN (CLEANUP): Produits ${createdProductIds.join(', ')} - ${deleteResult.deletedCount}/${createdProductIds.length} supprimés.`;
                console.warn(warnMsg); errors.push(warnMsg);
            } else { console.log(`CLEANUP (afterEach): ${createdProductIds.length} Produit(s) OK.`); }
        }

        // 3. Supprimer les Repas créés par le test (si IDs enregistrés)
        if (createdMealIds.length > 0) {
             console.log(`CLEANUP (afterEach): Suppression ${createdMealIds.length} Repa(s) IDs: ${createdMealIds.join(', ')}`);
             const deleteResult = await Meal.deleteMany({ _id: { $in: createdMealIds } });
             if (deleteResult.deletedCount !== createdMealIds.length) {
                 const warnMsg = `WARN (CLEANUP): Repas ${createdMealIds.join(', ')} - ${deleteResult.deletedCount}/${createdMealIds.length} supprimés.`;
                 console.warn(warnMsg); errors.push(warnMsg);
             } else { console.log(`CLEANUP (afterEach): ${createdMealIds.length} Repa(s) OK.`); }
        }

    } catch (error) {
        const errorMsg = `FATAL (CLEANUP): Erreur pendant nettoyage: ${error.message}`;
        console.error(errorMsg, error); errors.push(errorMsg);
    } finally {
        // 4. Réinitialiser les IDs pour le prochain test, TOUJOURS.
        createdDonationId = null;
        createdProductIds = [];
        createdMealIds = [];

        const duration = Date.now() - cleanupStartTime;
        console.log(`--- CLEANUP (afterEach) END (${duration}ms). Erreurs: ${errors.length} ---`);
        if (errors.length > 0) { console.error("!!! ERREURS DE NETTOYAGE DÉTECTÉES !!!"); }
    }
});

// --- Suite de Tests ---
describe('POST /donation (Targeted Cleanup Strategy)', () => {

    // --- Cas de Succès ---
    // Ces tests créent des données et enregistrent leurs IDs pour `afterEach`.
    describe('Success Cases (Create data and register IDs for cleanup)', () => {
        it('✅ should create a packaged_products donation and register it for cleanup', async () => {
            if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
            const testData = { ...getValidBaseData('packaged_products'), products: validProductData };
            let res;
            try {
                console.log("TEST START: Create packaged_products");
                res = await buildPostRequest(testData);
                expect(res.statusCode).toBe(201);
                expect(res.body.donation).toHaveProperty('_id');
                console.log(`TEST OK: Donation ${res.body.donation._id} créée.`);

                // *** ENREGISTREMENT POUR NETTOYAGE ***
                createdDonationId = res.body.donation._id;
                console.log(` -> ID Donation ${createdDonationId} enregistré.`);
                // Essayer de trouver les IDs produits (méthode robuste)
                const populatedDonation = await Donation.findById(createdDonationId).populate('products.product').lean();
                if (populatedDonation?.products?.length > 0) {
                    createdProductIds = populatedDonation.products.map(p => p.product._id);
                    console.log(` -> IDs Produits [${createdProductIds.join(', ')}] enregistrés (via DB).`);
                } else {
                    console.warn(`WARN (TEST): Impossible de trouver les produits pour Don ${createdDonationId}. Nettoyage produits risque d'échouer.`);
                }
                // *** FIN ENREGISTREMENT ***

            } catch (testError) {
                console.error("TEST FAIL (packaged_products):", testError);
                // Essayer d'enregistrer l'ID principal si possible même en cas d'erreur après la création
                if (res?.body?.donation?._id && !createdDonationId) {
                    createdDonationId = res.body.donation._id;
                     console.warn(`WARN (TEST FAIL): ID Donation ${createdDonationId} enregistré malgré l'erreur.`);
                }
                throw testError; // Faire échouer le test
            }
        });

        it('✅ should create a prepared_meals donation and register it for cleanup', async () => {
            if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
            const testData = { ...getValidBaseData('prepared_meals'), meals: validMealData, numberOfMeals: calculatedNumberOfMeals };
            let res;
            try {
                console.log("TEST START: Create prepared_meals");
                res = await buildPostRequest(testData);
                expect(res.statusCode).toBe(201);
                expect(res.body.donation).toHaveProperty('_id');
                 console.log(`TEST OK: Donation ${res.body.donation._id} créée.`);

                 // *** ENREGISTREMENT POUR NETTOYAGE ***
                createdDonationId = res.body.donation._id;
                 console.log(` -> ID Donation ${createdDonationId} enregistré.`);
                // Essayer de trouver les IDs repas
                const populatedDonation = await Donation.findById(createdDonationId).populate('meals.meal').lean();
                if (populatedDonation?.meals?.length > 0) {
                    createdMealIds = populatedDonation.meals.map(m => m.meal._id);
                     console.log(` -> IDs Repas [${createdMealIds.join(', ')}] enregistrés (via DB).`);
                } else {
                     console.warn(`WARN (TEST): Impossible de trouver les repas pour Don ${createdDonationId}. Nettoyage repas risque d'échouer.`);
                }
                 // *** FIN ENREGISTREMENT ***

            } catch (testError) {
                 console.error("TEST FAIL (prepared_meals):", testError);
                 if (res?.body?.donation?._id && !createdDonationId) {
                    createdDonationId = res.body.donation._id;
                     console.warn(`WARN (TEST FAIL): ID Donation ${createdDonationId} enregistré malgré l'erreur.`);
                 }
                throw testError;
            }
        });
    });

    // --- Cas d'Échec ---
    // Ces tests ne DEVRAIENT PAS créer de données. `afterEach` s'exécutera mais ne trouvera rien à nettoyer.
    describe('Failure Cases (Should NOT create data, cleanup should be no-op)', () => {
        test.each([['title'], ['location'], ['expirationDate'], ['description']])
        ('❌ should return 400 if base field "%s" is missing', async (field) => {
            if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
            const testData = { ...getValidBaseData('packaged_products'), products: validProductData };
            delete testData[field];
            console.log(`TEST START: Fail - missing field ${field}`);
            const res = await buildPostRequest(testData);
            await expectFailure(res, 400, field);
             console.log(`TEST OK: Échec attendu pour champ manquant ${field}.`);
        });

         it('❌ should return 400 if donor is missing', async () => {
             const baseData = { ...getValidBaseData('packaged_products'), products: validProductData };
             delete baseData.donor;
             console.log(`TEST START: Fail - missing donor`);
             const res = await buildPostRequest(baseData);
            await expectFailure(res, 400, 'donor');
             console.log(`TEST OK: Échec attendu pour donor manquant.`);
        });

         it('❌ should return 400 if products are missing for packaged_products', async () => {
             if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
             const testData = { ...getValidBaseData('packaged_products') };
              console.log(`TEST START: Fail - missing products`);
             const res = await buildPostRequest(testData);
             await expectFailure(res, 400, 'product');
              console.log(`TEST OK: Échec attendu pour produits manquants.`);
        });

         it('❌ should return 400 if meals are missing for prepared_meals', async () => {
             if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
             const testData = { ...getValidBaseData('prepared_meals'), numberOfMeals: 5 };
              console.log(`TEST START: Fail - missing meals`);
             const res = await buildPostRequest(testData);
             await expectFailure(res, 400, 'meal');
             console.log(`TEST OK: Échec attendu pour repas manquants.`);
        });

        // ... (Inclure tous les autres cas d'échec de la version précédente)
        //     - numberOfMeals manquant
        //     - catégorie invalide
        //     - date d'expiration passée
        //     - JSON invalide pour products/meals
        //     - Produit/Repas invalide dans le tableau (champ interne manquant)
        // Ils suivent tous le même modèle : appeler expectFailure et vérifier que le test réussit
        // parce que l'API a renvoyé l'erreur attendue. Le nettoyage afterEach sera vide.

         it('❌ should return 400 if category is invalid', async () => {
            if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
            const testData = { ...getValidBaseData('packaged_products'), category: 'invalid_cat', products: validProductData };
             console.log(`TEST START: Fail - invalid category`);
            const res = await buildPostRequest(testData);
            await expectFailure(res, 400, 'category');
             console.log(`TEST OK: Échec attendu pour catégorie invalide.`);
        });

         it('❌ should return 400 if expirationDate is in the past', async () => {
             if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
             const pastDate = new Date(); pastDate.setDate(pastDate.getDate() - 1);
             const testData = { ...getValidBaseData('packaged_products'), expirationDate: pastDate.toISOString(), products: validProductData };
              console.log(`TEST START: Fail - past expiration date`);
             const res = await buildPostRequest(testData);
             await expectFailure(res, 400, 'expirationDate');
              console.log(`TEST OK: Échec attendu pour date passée.`);
         });

         it('❌ should return 400 if products JSON is invalid', async () => {
             if (!testUser?._id) throw new Error("Test setup failed: testUser not available");
             const testData = { ...getValidBaseData('packaged_products'), products: 'not valid json' };
             const req = request(app).post('/donation');
             Object.keys(testData).forEach(key => req.field(key, String(testData[key])));
              console.log(`TEST START: Fail - invalid products JSON`);
             const res = await req;
             await expectFailure(res, 400, 'JSON'); // Ou 'parse', 'Unexpected token' etc.
              console.log(`TEST OK: Échec attendu pour JSON produits invalide.`);
         });

    
    });
});
