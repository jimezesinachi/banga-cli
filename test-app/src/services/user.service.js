const User = require("./../models/user.model");
const { CustomError } = require("./../utils");


class UserService {
  async findAll(data) {
    const users = await User.find({}, { password: 0, __v: 0 });

    return users
  }

  async findOne(data) {
    const { user_id } = data

    const user = await User.findOne(
      { _id: user_id },
      { password: 0, __v: 0 }
    );
    if (!user) throw new CustomError("User does not exist", 404);

    return user
  }

  async updateOne(data) {
    const { user_id } = data

    const user = await User.findByIdAndUpdate(
      { _id: user_id },
      { $set: data },
      { new: true }
    );
    if (!user) throw new CustomError("User doesn't exist", 404);

    return user;
  }

  async deleteOne(data) {
    const { user_id } = data

    const user = await User.findOneAndDelete({ _id: user_id });
    if (!user) throw new CustomError("User doesn't exist", 404);

    return user
  }
}


module.exports = new UserService();