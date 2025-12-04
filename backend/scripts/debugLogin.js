/**
 * Debug login issue
 */
const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function debugLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'admin@cityreporter.com';
        const password = 'admin123';

        console.log('Testing login for:', email);

        // Find user by email
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('✅ User found:', {
            _id: user._id,
            email: user.email,
            role: user.role,
            hasPassword: !!user.password
        });

        // Test password comparison
        console.log('Testing password comparison...');
        const isMatch = await user.comparePassword(password);
        console.log('Password match result:', isMatch);

        // Test with wrong password
        const wrongMatch = await user.comparePassword('wrongpassword');
        console.log('Wrong password match (should be false):', wrongMatch);

        if (isMatch) {
            console.log('✅ Login should work!');
        } else {
            console.log('❌ Password comparison failed');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

debugLogin();