/**
 * Update existing department users to use uppercase department values
 */
const mongoose = require('mongoose');
const User = require('../src/models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function updateDepartments() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Mapping for converting lowercase to uppercase
        const mapping = {
            'roads': 'ROADS',
            'water': 'WATER',
            'electricity': 'ELECTRICITY',
            'sanitation': 'SANITATION',
            'public_safety': 'PUBLIC_SAFETY',
            'public safety': 'PUBLIC_SAFETY',
            'transport': 'TRANSPORT',
            'public_transport': 'TRANSPORT',
            'public transport': 'TRANSPORT',
            'health': 'HEALTH',
            'pollution': 'HEALTH',
            'parks': 'OTHER',
            'other': 'OTHER',
            'others': 'OTHER'
        };

        // Find all department users
        const deptUsers = await User.find({ role: 'department' });

        console.log(`Found ${deptUsers.length} department users\n`);

        let updatedCount = 0;

        for (const user of deptUsers) {
            const oldDept = user.department;
            const lowerDept = oldDept ? oldDept.toLowerCase() : '';
            const newDept = mapping[lowerDept] || oldDept?.toUpperCase() || 'OTHER';

            if (oldDept !== newDept) {
                user.department = newDept;
                await user.save();
                console.log(`✅ Updated: ${user.name} (${user.email})`);
                console.log(`   ${oldDept} → ${newDept}\n`);
                updatedCount++;
            } else {
                console.log(`✓ No change needed: ${user.name} (${user.email}) - already ${newDept}\n`);
            }
        }

        console.log(`\n🎯 Summary: Updated ${updatedCount} out of ${deptUsers.length} department users`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

updateDepartments();
