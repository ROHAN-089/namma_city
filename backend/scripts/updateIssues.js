/**
 * Update existing issues to add department field based on category
 */
const mongoose = require('mongoose');
const Issue = require('../src/models/Issue');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function updateIssues() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Category to Department mapping
        const categoryToDepartment = {
            'roads': 'ROADS',
            'water': 'WATER',
            'electricity': 'ELECTRICITY',
            'sanitation': 'SANITATION',
            'public_safety': 'PUBLIC_SAFETY',
            'public_transport': 'TRANSPORT',
            'pollution': 'HEALTH',
            'others': 'OTHER'
        };

        // Find all issues
        const issues = await Issue.find({});

        console.log(`Found ${issues.length} issues\n`);

        let updatedCount = 0;
        let alreadySetCount = 0;

        for (const issue of issues) {
            if (!issue.department || issue.department === '') {
                const department = categoryToDepartment[issue.category] || 'OTHER';
                issue.department = department;
                await issue.save();
                console.log(`✅ Updated: ${issue.title.substring(0, 40)}...`);
                console.log(`   Category: ${issue.category} → Department: ${department}\n`);
                updatedCount++;
            } else {
                console.log(`✓ Already set: ${issue.title.substring(0, 40)}... - ${issue.department}\n`);
                alreadySetCount++;
            }
        }

        console.log(`\n🎯 Summary:`);
        console.log(`   Total issues: ${issues.length}`);
        console.log(`   Updated: ${updatedCount}`);
        console.log(`   Already set: ${alreadySetCount}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

updateIssues();
