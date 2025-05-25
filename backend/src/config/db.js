const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, 
      family: 4 // Force 
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return;
  } catch (atlasError) {
    console.warn(`MongoDB Atlas Connection Error: ${atlasError.message}`);
    console.log('Attempting to connect to local MongoDB...');

    try {
      // Try connecting to local MongoDB
      const conn = await mongoose.connect('mongodb://localhost:27017/city_management', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        family: 4
      });

      console.log(`Connected to local MongoDB: ${conn.connection.host}`);
      return;
    } catch (localError) {
      console.error('Failed to connect to both MongoDB Atlas and local MongoDB.');
      console.error(`Atlas Error: ${atlasError.message}`);
      console.error(`Local Error: ${localError.message}`);
      console.error('\nPlease ensure either:');
      console.error('1. Your IP is whitelisted in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/');
      console.error('2. Or you have MongoDB installed and running locally');
      process.exit(1);
    }
  }
};

module.exports = connectDB;
