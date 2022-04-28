const mongoose = require('mongoose');
const connectToDB = require('../../src/config/mongo-db.config');
const { auth, AuthService } = require('../../src/services/auth.service');
const User = require('../../src/models/user.model');

beforeAll(async () => {
    await connectToDB();
    await User.deleteMany();
});

afterAll((done) => {
    mongoose.connection.close(() => done());
});

describe('Testing signup function', () => {
    const data = {
        name: 'Jim Ezesinachi',
        email: 'ezesinachijim@gmail.com',
        password: 'Jesusboi44%'
    }

    test("User data is complete, and user email does not exist in database", async () => {
        const newUser = await auth.signup(data);

        expect(typeof newUser.user_id).toEqual('object');
        expect(newUser.email).toEqual('ezesinachijim@gmail.com');
        expect(newUser.role).toEqual('USER');
        expect(newUser.has_verified_email).toEqual(false);
        expect(typeof newUser.auth_token).toEqual('string');
    });
});

describe('Testing signin function', () => {
    const data = {
        email: 'ezesinachijim@gmail.com',
        password: 'Jesusboi44%'
    }

    test("User data is complete, and user email exists in database", async () => {
        const newUser = await auth.signin(data);

        expect(typeof newUser.user_id).toEqual('object');
        expect(newUser.email).toEqual('ezesinachijim@gmail.com');
        expect(newUser.role).toEqual('USER');
        expect(newUser.has_verified_email).toEqual(false);
        expect(typeof newUser.auth_token).toEqual('string');
    });
});