const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const connectToDB = require('../../src/config/mongo-db.config');
const User = require('../../src/models/user.model');

beforeAll(async () => {
    await connectToDB();
    await User.deleteMany();
});

afterAll((done) => {
    mongoose.connection.close(() => done());
});


describe('Testing user signup route', () => {
    test("POST /api/auth/sign-up", async () => {
        await supertest(app)
            .post('/api/auth/sign-up')
            .send({ name: 'Jim Ezesinachi', email: "user@example.com", password: "foobar123" })
            .expect(201)
            .then((response) => {
                expect(response.body.message).toEqual('User signup successful');
                expect(response.body.data.user_id).toBeTruthy();
                expect(response.body.data.email).toEqual("user@example.com");
                expect(response.body.data.role).toEqual("USER");
                expect(response.body.data.has_verified_email).toEqual(false);
                expect(response.body.data.auth_token).toBeTruthy();
            });
        ;
    });
});


describe('Testing user signin route', () => {
    test("POST /api/auth/sign-in", async () => {
        await supertest(app)
            .post('/api/auth/sign-in')
            .send({ email: "user@example.com", password: "foobar123" })
            .expect(200)
            .then((response) => {
                expect(response.body.message).toEqual('User signin successful');
                expect(response.body.data.user_id).toBeTruthy();
                expect(response.body.data.email).toEqual("user@example.com");
                expect(response.body.data.role).toEqual("USER");
                expect(response.body.data.has_verified_email).toEqual(false);
                expect(response.body.data.auth_token).toBeTruthy();
            });
        ;
    });
});