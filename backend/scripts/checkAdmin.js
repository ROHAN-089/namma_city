require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/city-management';

const checkAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@cityreporter.com' }).select('+password');
    
    if (admin) {
      console.log('Admin user found:');
      console.log({
        _id: admin._id,
        email: admin.email,
        role: admin.role,
        password: admin.password, // This will show the hashed password
        createdAt: admin.createdAt
      });
      
      // Check if password matches
      const isMatch = await admin.comparePassword('admin123');
      console.log('Password matches:', isMatch);
    } else {
      console.log('No admin user found');
    }
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    process.exit(0);
  }
};

checkAdminUser();
