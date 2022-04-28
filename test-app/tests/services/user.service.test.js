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
    test("Getting all existing users from database", async () => {
        const users = await findAll();

        expect(Array.isArray(users)).toEqual(true);
        expect(typeof users[0]).toEqual('object');
        expect(typeof users[0]._id).toEqual('object');
        expect(users[0].email).toEqual('ezesinachijim@gmail.com');
        expect(users[0].role).toEqual('USER');
        expect(users[0].has_verified_email).toEqual(false);

        user = users[0];
    });
});

describe('Testing findOne function', () => {
    test("Getting all existing users from database", async () => {
        let data = {user_id: user._id}
        const findUser = await findOne(data);

        expect(typeof findUser).toEqual('object');
        expect(typeof findUser._id).toEqual('object');
        expect(findUser.email).toEqual('ezesinachijim@gmail.com');
        expect(findUser.role).toEqual('USER');
        expect(findUser.has_verified_email).toEqual(false);
    });
});

describe('Testing updateOne function', () => {
    test("Updating one user in the database", async () => {
        let data = {
            user_id: user._id,
            name: "Jim E"
        };
        const updateUser = await updateOne(data);

        expect(typeof updateUser).toEqual('object');
        expect(updateUser.email).toEqual('ezesinachijim@gmail.com');
        expect(updateUser.name).not.toEqual('Jim Ezesinachi');
        expect(updateUser.name).toEqual('Jim E');
        
        user = updateUser
    });
});

describe('Testing deleteOne function', () => {
    test("Deleting one user in the database", async () => {
        let data = {
            user_id: user._id
        };
        const deleteUser = await deleteOne(data);

        expect(typeof deleteUser).toEqual('object');
        await expect(findOne(data)).rejects.toThrow("User does not exist")

        user = {}
    })
})