const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const connectToDB = require('../../src/config/mongo-db.config');

beforeAll(async () => {
    await connectToDB();
});

afterAll((done) => {
    mongoose.connection.close(() => done());
});

let user = {};
let token = "";

describe('Testing user signin route', () => {
    test("POST /api/auth/sign-in", async () => {
        await supertest(app)
            .post('/api/auth/sign-in')
            .send({ email: "kynfksukuw@tempmail.dev", password: "Jesusboi44%" })
            .expect(200)
            .then((response) => {
                token = "Bearer " + response.body.data.auth_token;
                expect(response.body.message).toEqual('User signin successful');
                expect(response.body.data.user_id).toBeTruthy();
                expect(response.body.data.email).toEqual("kynfksukuw@tempmail.dev");
                expect(response.body.data.role).toEqual("USER");
                expect(response.body.data.has_verified_email).toEqual(true);
                expect(response.body.data.auth_token).toBeTruthy();
            });
        ;
    });
});


describe('Testing findAll route', () => {
    test("GET /api/users", async () => {
        await supertest(app)
            .get('/api/users')
            .set('Authorization', token)
            .expect(200)
            .then((response) => {
                expect(response.body.message).toEqual('All users');
                expect(Array.isArray(response.body.data)).toEqual(true);
                expect(typeof response.body.data[0]).toEqual('object');
                expect(response.body.data[0]._id).toBeTruthy();
                expect(response.body.data[0].email).toEqual('kynfksukuw@tempmail.dev');
                expect(response.body.data[0].role).toEqual('USER');
                expect(response.body.data[0].has_verified_email).toEqual(true);

                user = response.body.data[0];
            });
        ;
    });
});