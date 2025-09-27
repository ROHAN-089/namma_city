const aiEnhancementService = require('../src/services/aiEnhancementService');

async function testAIConnection() {
  console.log('🔍 Testing AI Service Connection...\n');

  try {
    console.log('1. Testing basic AI processing...');
    
    const testInput = {
      title: 'Broken streetlight',
      description: 'Light not working',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716],
        address: 'MG Road, Bangalore'
      },
      city: 'Bangalore'
    };

    console.log('Input:', testInput);
    
    const result = await aiEnhancementService.processCompleteIssue(testInput);
    
    console.log('\n✅ AI Processing Results:');
    console.log('- AI Processed:', result.aiProcessed);
    console.log('- Enhanced Title:', result.title);
    console.log('- Enhanced Description:', result.description);
    console.log('- Category:', result.category);
    console.log('- Priority:', result.priority);
    console.log('- Department:', result.aiMetadata?.department);
    console.log('- Confidence:', `${Math.round((result.aiMetadata?.confidence || 0) * 100)}%`);
    console.log('- Processing Time:', `${result.aiMetadata?.processingTime || 0}ms`);

  } catch (error) {
    console.error('❌ AI Service Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAIConnection();