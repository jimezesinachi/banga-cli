const mongoose = require('mongoose');
const connectToDB = require('../../src/config/mongo-db.config');
const { findAll, findOne, updateOne, deleteOne } = require('../../src/services/user.service');

beforeAll(async () => {
    await connectToDB();
});

afterAll((done) => {
    mongoose.connection.close(() => done());
});

let user = {};

describe('Testing findAll function', () => {
    test("Getting all existing users from databse", async () => {
        const users = await findAll();

        expect(Array.isArray(users)).toEqual(true);
        expect(typeof users[0]).toEqual('object');
        expect(typeof users[0]._id).toEqual('object');
        expect(users[0].email).toEqual('ezesinachijim@gmail.com');
        expect(users[0].role).toEqual('USER');
        expect(users[0].has_verified_email).toEqual(false);

        const oneUser = users[0]
        user.user_id = oneUser._id;
    });
});

describe('Testing findOne function', () => {
    test("Getting all existing users from databse", async () => {
        const findUser = await findOne(user);

        expect(typeof findUser).toEqual('object');
        expect(typeof findUser._id).toEqual('object');
        expect(findUser.email).toEqual('ezesinachijim@gmail.com');
        expect(findUser.role).toEqual('USER');
        expect(findUser.has_verified_email).toEqual(false);
    });
});