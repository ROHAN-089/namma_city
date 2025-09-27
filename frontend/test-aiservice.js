// Quick test to verify aiService exports
const aiService = require('./src/services/aiService.js');

console.log('🧪 Testing aiService exports...');

// Check if all expected functions exist
const expectedFunctions = [
  'checkAIStatus',
  'getQuickSuggestions', 
  'enhanceIssue',
  'testAIService',
  'suggestDepartment',
  'suggestPriority'
];

expectedFunctions.forEach(func => {
  if (typeof aiService[func] === 'function') {
    console.log(`✅ ${func} - OK`);
  } else {
    console.log(`❌ ${func} - MISSING or NOT A FUNCTION`);
  }
});

console.log('\n📊 Export check complete!');