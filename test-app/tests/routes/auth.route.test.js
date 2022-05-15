const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const connectToDB = require('../../src/config/mongo-db.config');
const { findOne } = require('../../src/services/user.service');

beforeAll(async () => {
    await connectToDB();
    await mongoose.connection.db.dropDatabase();
});

afterAll((done) => {
    mongoose.connection.close(() => done());
});

let user, token = {};
let data = {
    name: 'Jim Ezesinachi',
    email: 'kynfksukuw@tempmail.dev',
    password: 'Jesusboi44%'
}

describe('Testing user signup route', () => {
    test("POST /api/auth/sign-up", async () => {
        await supertest(app)
            .post('/api/auth/sign-up')
            .send(data)
            .expect(201)
            .then((response) => {
                user = response.body.data;

                expect(response.body.message).toEqual('User signup successful');
                expect(user.user_id).toBeTruthy();
                expect(user.email).toEqual("kynfksukuw@tempmail.dev");
                expect(user.role).toEqual("USER");
                expect(user.has_verified_email).toEqual(false);
                expect(user.auth_token).toBeTruthy();
            });
        ;
    });
});

describe('Testing user signin route', () => {
    test("POST /api/auth/sign-in", async () => {
        await supertest(app)
            .post('/api/auth/sign-in')
            .send(data)
            .expect(200)
            .then((response) => {
                user = response.body.data;
                data.user_id = response.body.data.user_id;
                data.USER_ID = response.body.data.user_id;

                expect(response.body.message).toEqual('User signin successful');
                expect(user.user_id).toBeTruthy();
                expect(user.email).toEqual("kynfksukuw@tempmail.dev");
                expect(user.role).toEqual("USER");
                expect(user.has_verified_email).toEqual(false);
                expect(user.auth_token).toBeTruthy();
            });
        ;
    });
});

describe('Testing request verification email route', () => {
    test("POST /api/auth/request-email-verification", async () => {
        await supertest(app)
            .post('/api/auth/request-email-verification')
            .send(data)
            .expect(200)
            .then((response) => {
                token = response.body.data;
                data.otp = response.body.data.otp;

                expect(response.body.message).toEqual('Email verfication OTP sent');
                expect(token.token._id).toBeTruthy();
                expect(token.token.userId).toEqual(user.user_id);
                expect(token.token.token).toBeTruthy();

            });
        ;
    });
});

describe('Testing verify email route', () => {
    test("POST /api/auth/verify-email", async () => {
        await supertest(app)
            .post('/api/auth/verify-email')
            .send(data)
            .expect(200)
            .then(async (response) => {
                token = response.body.data;
                user = await findOne(data);

                expect(user.has_verified_email).toEqual(true);
                expect(token._id).toBeTruthy();
                expect(token.userId).toBeTruthy();
                expect(token.token).toBeTruthy();
            });
        ;
    });
});

describe('Testing request password reset route', () => {
    test("POST /api/auth/request-password-reset", async () => {
        await supertest(app)
            .post('/api/auth/request-password-reset')
            .send(data)
            .expect(200)
            .then((response) => {
                token = response.body.data;
                data.otp = response.body.data.otp;

                expect(token.token._id).toBeTruthy();
                expect(token.token.userId).toBeTruthy();
                expect(token.token.token).toBeTruthy();
            });
        ;
    });
});

describe('Testing reset password route', () => {
    test("POST /api/auth/reset-password", async () => {
        await supertest(app)
            .post('/api/auth/reset-password')
            .send(data)
            .expect(200)
            .then((response) => {
                token = response.body.data;

                expect(user.has_verified_email).toEqual(true);
                expect(token._id).toBeTruthy();
                expect(token.userId).toBeTruthy();
                expect(token.token).toBeTruthy();
            });
        ;
    });
});

describe('Testing update password route', () => {
    test("POST /api/auth/update-password", async () => {
        await supertest(app)
            .post('/api/auth/update-password')
            .send(data)
            .expect(200)
            .then((response) => {
                user = response.body.data;
            });
        ;
    });
});