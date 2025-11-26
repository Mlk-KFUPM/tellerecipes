const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async (uri = process.env.MONGODB_URI) => {
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    cachedConnection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return cachedConnection;
  } catch (error) {
    cachedConnection = null;
    throw error;
  }
};

const disconnectDB = async () => {
  if (!cachedConnection) {
    return;
  }

  await mongoose.connection.close();
  cachedConnection = null;
};

module.exports = {
  connectDB,
  disconnectDB,
};
