const mongoose = require('mongoose');
const connectToDB = require('../../src/config/mongo-db.config');
const { AuthServ, AuthService } = require('../../src/services/auth.service');
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
        const newUser = await AuthServ.signup(data);

        expect(newUser.user_id).toBeTruthy();
        expect(newUser.email).toEqual('ezesinachijim@gmail.com');
        expect(newUser.role).toEqual('USER');
        expect(newUser.has_verified_email).toEqual(false);
        expect(newUser.auth_token).toBeTruthy();
    });
});

describe('Testing signin function', () => {
    const data = {
        email: 'ezesinachijim@gmail.com',
        password: 'Jesusboi44%'
    }

    test("User data is complete, and user email exists in database", async () => {
        const newUser = await AuthServ.signin(data);

        expect(newUser.user_id).toBeTruthy();
        expect(newUser.email).toEqual('ezesinachijim@gmail.com');
        expect(newUser.role).toEqual('USER');
        expect(newUser.has_verified_email).toEqual(false);
        expect(newUser.auth_token).toBeTruthy();
    });
});