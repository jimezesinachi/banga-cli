const mongoose = require("mongoose");
const config = require("./../config");

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: true
};

module.exports = async () => {
  try {
    await mongoose.connect(config.mongodb.URI, options)
    console.log("✅ :: Connected to MongoDB")
  } catch (error) {
    console.error("🚫 :: Could not connect to MongoDB ", error)
  }
};