const mongoose = require('mongoose');

const connectDB = async (uri) => {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/tellerecipes';
  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });
  return mongoose.connection;
};

module.exports = { connectDB };
