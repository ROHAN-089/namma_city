/**
 * Check existing issues and their department assignments
 */
const mongoose = require('mongoose');
const Issue = require('../src/models/Issue');
const User = require('../src/models/User');
const City = require('../src/models/City');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkIssues() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Check all issues
        const issues = await Issue.find({})
            .populate('city', 'name')
            .populate('reportedBy', 'name email role')
            .limit(10);

        console.log(`📋 Found ${issues.length} issues:\n`);

        issues.forEach((issue, index) => {
            console.log(`Issue ${index + 1}:`);
            console.log(`  Title: ${issue.title}`);
            console.log(`  Category: ${issue.category}`);
            console.log(`  Department: ${issue.department || 'NOT SET'}`);
            console.log(`  City: ${issue.city?.name || 'Not specified'}`);
            console.log(`  Status: ${issue.status}`);
            console.log(`  Reported By: ${issue.reportedBy?.name || 'Unknown'} (${issue.reportedBy?.role || 'Unknown'})`);
            console.log('');
        });

        // Check department users
        console.log('\n👥 Department Users:\n');
        const deptUsers = await User.find({ role: 'department' })
            .populate('city', 'name');

        deptUsers.forEach((user, index) => {
            console.log(`Dept User ${index + 1}:`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Department: ${user.department || 'NOT SET'}`);
            console.log(`  City: ${user.city?.name || 'Not specified'}`);
            console.log('');
        });

        // Check category to department mapping
        console.log('\n🗺️  Expected Category → Department Mapping:');
        const mapping = {
            'roads': 'ROADS',
            'water': 'WATER',
            'electricity': 'ELECTRICITY',
            'sanitation': 'SANITATION',
            'public_safety': 'PUBLIC_SAFETY',
            'public_transport': 'TRANSPORT',
            'pollution': 'HEALTH',
            'others': 'OTHER'
        };
        Object.entries(mapping).forEach(([category, dept]) => {
            console.log(`  ${category} → ${dept}`);
        });

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkIssues();
