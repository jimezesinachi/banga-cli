const mongoose = require('mongoose');
const connectToDB = require('../../src/config/mongo-db.config');
const { AuthServ, AuthService } = require('../../src/services/auth.service');
const { findOne } = require('../../src/services/user.service');

beforeAll(async () => {
    await connectToDB();
    await mongoose.connection.db.dropDatabase();
});

afterAll((done) => {
    mongoose.connection.close(() => done());
});

let otp = "";
let user, token = {};
let data = {
    name: 'Jim Ezesinachi',
    email: 'tilotar536@doerma.com',
    password: 'Jesusboi44%'
}

describe('Testing signup function', () => {
    test("User data is complete, and user email does not exist in database", async () => {
        user = await AuthServ.signup(data);

        expect(user.user_id).toBeTruthy();
        expect(user.email).toEqual('tilotar536@doerma.com');
        expect(user.role).toEqual('USER');
        expect(user.has_verified_email).toEqual(false);
        expect(user.auth_token).toBeTruthy();
    });
});

describe('Testing signin function', () => {
    test("User data is complete, and user email exists in database", async () => {
        user = await AuthServ.signin(data);

        expect(user.user_id).toBeTruthy();
        expect(user.email).toEqual('tilotar536@doerma.com');
        expect(user.role).toEqual('USER');
        expect(user.has_verified_email).toEqual(false);
        expect(user.auth_token).toBeTruthy();
    });
});

describe('Testing request verification email function', () => {
    test("User email exists in database and has not been verified", async () => {
        token = await AuthService.requestEmailVerification(data);

        expect(token.token._id).toBeTruthy();
        expect(token.token.userId).toEqual(user.user_id);
        expect(token.token.token).toBeTruthy();

        otp = token.otp;
    });
});

describe('Testing verify email function', () => {
    test("User email exists in database and has been verified", async () => {
        data.otp = otp;
        data.user_id = user.user_id;

        token = await AuthServ.verifyEmail(data);
        user = await findOne(data);

        expect(user.has_verified_email).toEqual(true);
        expect(token._id).toBeTruthy();
        expect(token.userId).toEqual(user._id);
        expect(token.token).toBeTruthy();
    });
});

describe('Testing request password reset function', () => {
    test("User email exists in database", async () => {
        token = await AuthServ.requestPasswordReset(data);

        expect(token.token._id).toBeTruthy();
        expect(token.token.userId).toEqual(user._id);
        expect(token.token.token).toBeTruthy();

        otp = token.otp;
    });
});

describe('Testing reset password function', () => {
    test("User email exists in database", async () => {
        data.otp = otp;
        token = await AuthServ.resetPassword(data);

        expect(user.has_verified_email).toEqual(true);
        expect(token._id).toBeTruthy();
        expect(token.userId).toEqual(user._id);
        expect(token.token).toBeTruthy();
    });
});

describe('Testing update password function', () => {
    test("User email exists in database", async () => {
        data.USER_ID = user._id;

        user = await AuthServ.updatePassword(data);
    });
});