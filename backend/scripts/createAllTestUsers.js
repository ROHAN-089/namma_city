/**
 * Create additional test users for different roles
 */
const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function createAllTestUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const testUsers = [
            {
                name: 'John Citizen',
                email: 'citizen@test.com',
                password: 'password123',
                role: 'citizen',
                phoneNumber: '9876543210'
            },
            {
                name: 'Water Department',
                email: 'water@dept.com',
                password: 'password123',
                role: 'department',
                department: 'WATER',
                phoneNumber: '9876543211'
            },
            {
                name: 'Roads Department',
                email: 'roads@dept.com',
                password: 'password123',
                role: 'department',
                department: 'ROADS',
                phoneNumber: '9876543212'
            }
        ];

        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const user = new User(userData);
                await user.save();
                console.log(`✅ Created ${userData.role}: ${userData.email}`);
            } else {
                console.log(`✅ Already exists: ${userData.email}`);
            }
        }

        console.log('\n🎯 TEST CREDENTIALS:');
        console.log('Citizen: citizen@test.com / password123');
        console.log('Water Dept: water@dept.com / password123');
        console.log('Roads Dept: roads@dept.com / password123');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

createAllTestUsers();