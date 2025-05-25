const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Function to create an admin user if one doesn't exist
const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Check if an admin user already exists
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      // Create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@cityreporter.com',
        password: 'admin123', // This will be hashed by the User model's pre-save hook
        role: 'admin',
        phoneNumber: '1234567890'
      });

      console.log(`Admin user created: ${adminUser.name} (${adminUser.email})`);
    } else {
      console.log(`Admin user already exists: ${adminExists.name} (${adminExists.email})`);
    }

    // Disconnect from database
    await mongoose.disconnect();
    console.log('MongoDB Disconnected');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the function
createAdminUser();
