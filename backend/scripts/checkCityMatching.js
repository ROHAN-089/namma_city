/**
 * Check city matching between issues and department users
 */
const mongoose = require('mongoose');
const Issue = require('../src/models/Issue');
const User = require('../src/models/User');
const City = require('../src/models/City');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function checkCityMatching() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB\n');

        // Get all cities
        const cities = await City.find({});
        console.log('📍 Cities in database:');
        cities.forEach(city => {
            console.log(`  ${city.name} (ID: ${city._id})`);
        });
        console.log('');

        // Get SANITATION department users
        const sanitationUsers = await User.find({ 
            role: 'department',
            department: 'SANITATION'
        }).populate('city', 'name');
        
        console.log('🧹 SANITATION Department Users:');
        sanitationUsers.forEach(user => {
            console.log(`  ${user.name} - City: ${user.city?.name || 'Not set'} (ID: ${user.city?._id || 'None'})`);
        });
        console.log('');

        // Get SANITATION issues
        const sanitationIssues = await Issue.find({
            department: 'SANITATION'
        }).populate('city', 'name');
        
        console.log('🗑️ SANITATION Issues:');
        sanitationIssues.forEach(issue => {
            console.log(`  "${issue.title.substring(0, 40)}..." - City: ${issue.city?.name || 'Not set'} (ID: ${issue.city?._id || issue.city || 'None'})`);
        });
        console.log('');

        // Check for matches
        console.log('🔍 Checking matches:');
        const bangaloreCity = cities.find(c => c.name.toLowerCase().includes('bangalore') || c.name.toLowerCase().includes('bengaluru'));
        if (bangaloreCity) {
            console.log(`\nBangalore City ID: ${bangaloreCity._id}`);
            
            const usersInBangalore = sanitationUsers.filter(u => u.city && u.city._id.toString() === bangaloreCity._id.toString());
            const issuesInBangalore = sanitationIssues.filter(i => i.city && i.city._id && i.city._id.toString() === bangaloreCity._id.toString());
            
            console.log(`  SANITATION users in Bangalore: ${usersInBangalore.length}`);
            console.log(`  SANITATION issues in Bangalore: ${issuesInBangalore.length}`);
            
            if (usersInBangalore.length > 0 && issuesInBangalore.length > 0) {
                console.log('\n✅ Match found! These issues should be visible to department users.');
            } else if (usersInBangalore.length === 0) {
                console.log('\n⚠️ No SANITATION department users in Bangalore');
            } else if (issuesInBangalore.length === 0) {
                console.log('\n⚠️ No SANITATION issues in Bangalore');
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkCityMatching();
