/**
 * Test the exact query that getDepartmentIssues uses
 */
const mongoose = require('mongoose');
const Issue = require('../src/models/Issue');
const User = require('../src/models/User');
const City = require('../src/models/City');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function testQuery() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Get the SANITATION user in Bangalore
        const deptUser = await User.findOne({
            role: 'department',
            department: 'SANITATION',
            email: 'rohanchargotra01@gmail.com'
        }).populate('city', 'name');

        if (!deptUser) {
            console.log('❌ Department user not found');
            return;
        }

        console.log('👤 Department User:');
        console.log(`  Name: ${deptUser.name}`);
        console.log(`  Email: ${deptUser.email}`);
        console.log(`  Department: ${deptUser.department}`);
        console.log(`  City: ${deptUser.city?.name || 'Not set'}`);
        console.log(`  City ID: ${deptUser.city?._id || 'None'}\n`);

        // Simulate the exact query from getDepartmentIssues
        const query = {
            city: deptUser.city._id,
            department: deptUser.department
        };

        console.log('🔍 Query being used:');
        console.log(JSON.stringify(query, null, 2));
        console.log('');

        // Execute the query
        const issues = await Issue.find(query)
            .populate('reportedBy', 'name role profileImage')
            .populate('city', 'name state')
            .populate('assignedTo', 'name role department')
            .sort('-createdAt');

        console.log(`📋 Found ${issues.length} issues:\n`);

        issues.forEach((issue, index) => {
            console.log(`Issue ${index + 1}:`);
            console.log(`  Title: ${issue.title}`);
            console.log(`  Category: ${issue.category}`);
            console.log(`  Department: ${issue.department}`);
            console.log(`  City: ${issue.city?.name || 'Not set'}`);
            console.log(`  City ID in DB: ${issue.city?._id || issue.city}`);
            console.log(`  Status: ${issue.status}`);
            console.log('');
        });

        if (issues.length === 0) {
            console.log('\n⚠️ No issues found! Let\'s check why...\n');

            // Check all SANITATION issues regardless of city
            const allSanitationIssues = await Issue.find({ department: 'SANITATION' });
            console.log(`Total SANITATION issues (any city): ${allSanitationIssues.length}`);

            allSanitationIssues.forEach(issue => {
                const cityMatch = issue.city && issue.city.toString() === deptUser.city._id.toString();
                console.log(`  - "${issue.title.substring(0, 30)}..." City: ${issue.city} | Matches: ${cityMatch ? '✅' : '❌'}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
    }
}

testQuery();
