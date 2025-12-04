const axios = require('axios');

// Test the AI-enhanced issue creation endpoint
async function testAIIssueCreation() {
    try {
        console.log('🧪 Testing AI-enhanced issue creation...\n');

        // First, login to get a token
        console.log('1. Logging in...');
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful');

        // Test data for AI processing
        const issueData = {
            title: 'Pothole on main road',
            description: 'Small pothole causing trouble',
            location: {
                type: 'Point',
                coordinates: [77.5946, 12.9716], // Bangalore coordinates
                address: 'Main Road, Koramangala, Bangalore'
            },
            city: 'Bangalore',
            useAI: true
        };

        console.log('\n2. Creating issue with AI processing...');
        console.log('Original input:', {
            title: issueData.title,
            description: issueData.description,
            city: issueData.city
        });

        // Create issue with AI processing
        const issueResponse = await axios.post(
            'http://localhost:5000/api/issues',
            issueData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const createdIssue = issueResponse.data;

        console.log('\n✅ Issue created successfully!');
        console.log('\n📊 AI Processing Results:');
        console.log('- AI Processed:', createdIssue.aiProcessed);
        console.log('- Enhanced Title:', createdIssue.title);
        console.log('- Enhanced Description:', createdIssue.description);
        console.log('- Category:', createdIssue.category);
        console.log('- Priority:', createdIssue.priority);

        if (createdIssue.aiInsights) {
            console.log('\n🤖 AI Insights:');
            console.log('- Department:', createdIssue.aiInsights.department);
            console.log('- Enhancement Type:', createdIssue.aiInsights.enhancementType);
            console.log('- Public Impact Score:', createdIssue.aiInsights.publicImpactScore);
            console.log('- Confidence:', `${Math.round(createdIssue.aiInsights.confidence * 100)}%`);
            console.log('- Reasoning:', createdIssue.aiInsights.reasoning);
        }

        if (createdIssue.aiMetadata) {
            console.log('\n📈 AI Metadata:');
            console.log('- Processing Time:', `${createdIssue.aiMetadata.processingTime}ms`);
            console.log('- Original Input:', createdIssue.originalUserInput);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Test with AI disabled
async function testManualIssueCreation() {
    try {
        console.log('\n\n🧪 Testing manual issue creation (AI disabled)...\n');

        // First, login to get a token
        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@example.com',
            password: 'password123'
        });

        const token = loginResponse.data.token;

        const issueData = {
            title: 'Manual test issue',
            description: 'This is a manual test without AI',
            category: 'roads',
            priority: 'medium',
            location: {
                type: 'Point',
                coordinates: [77.5946, 12.9716],
                address: 'Test Location'
            },
            city: 'Bangalore',
            useAI: false
        };

        console.log('Creating manual issue...');
        const issueResponse = await axios.post(
            'http://localhost:5000/api/issues',
            issueData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const createdIssue = issueResponse.data;
        console.log('✅ Manual issue created successfully!');
        console.log('- AI Processed:', createdIssue.aiProcessed);
        console.log('- Title:', createdIssue.title);
        console.log('- Category:', createdIssue.category);

    } catch (error) {
        console.error('❌ Manual test failed:', error.response?.data || error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting AI Issue Creation Tests\n');
    console.log('='.repeat(50));

    await testAIIssueCreation();
    await testManualIssueCreation();

    console.log('\n' + '='.repeat(50));
    console.log('🏁 Tests completed!');
}

runTests();