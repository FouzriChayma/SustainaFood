const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');  // Assure-toi que ton fichier app.js (ou index.js) est exporté correctement

describe('POST /login', () => {
    it('should return 200 and a success message for valid credentials', (done) => {
        const validCredentials = {
            email: 'wala.ammar@esprit.tn',
            password: '123'
        };

        request(app)
            .post('/login')  // URL de la route à tester
            .send(validCredentials)  // Données envoyées dans le body
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(200);  // Vérifier si le statut est 200
                expect(res.body).to.have.property('message');  // Vérifier si une propriété message existe dans la réponse
                done();
            });
    });

    it('should return 400 for invalid credentials', (done) => {
        const invalidCredentials = {
            email: 'wronguser@gmail.com',
            password: 'wrongpassword'
        };

        request(app)
            .post('/login')
            .send(invalidCredentials)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.status).to.equal(400);  // Vérifier si le statut est 400
                expect(res.body).to.have.property('error');  // Vérifier si une propriété error existe dans la réponse
                done();
            });
    });
});
