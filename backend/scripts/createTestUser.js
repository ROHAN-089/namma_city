/**
 * Create a test citizen user for login testing
 */
const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createTestUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: password123');
      return;
    }

    // Create test citizen user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'citizen',
      phoneNumber: '9876543210'
    });

    await testUser.save();
    console.log('✅ Test citizen user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('Role: citizen');

  } catch (error) {
    if (error.code === 11000) {
      console.log('✅ Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  } finally {
    await mongoose.disconnect();
  }
}

createTestUser();