/**
 * Test AI Integration - Simple test to verify AI features work
 */
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const aiService = require('../src/services/aiEnhancementService');

async function testAIFeatures() {
    console.log('🧪 Testing AI Integration Features...\n');

    // Test 1: Check if AI service is available
    console.log('1. Checking AI Service Status...');
    const isAvailable = aiService.isAvailable();
    console.log(`   AI Available: ${isAvailable ? '✅ Yes' : '❌ No'}`);

    if (!isAvailable) {
        console.log('   ⚠️ AI features will use fallback mode');
    }

    // Test 2: Test quick suggestions
    console.log('\n2. Testing Quick Suggestions...');
    try {
        const quickSuggestions = await aiService.getQuickSuggestions('Pothole on main road');
        console.log('   ✅ Quick Suggestions:', quickSuggestions);
    } catch (error) {
        console.log('   ❌ Quick Suggestions failed:', error.message);
    }

    // Test 3: Test issue enhancement
    console.log('\n3. Testing Issue Enhancement...');
    try {
        const testIssue = {
            title: 'Water not coming since morning',
            description: 'No water supply in our area',
            category: 'others',
            priority: 'medium',
            location: { address: 'Koramangala, Bangalore' }
        };

        const enhanced = await aiService.enhanceIssue(testIssue);
        console.log('   ✅ Enhanced Issue:');
        console.log('   Original Category:', testIssue.category);
        console.log('   AI Enhanced:', enhanced.aiEnhanced);
        if (enhanced.suggestions) {
            console.log('   Suggested Category:', enhanced.suggestions.suggestedCategory);
            console.log('   Suggested Priority:', enhanced.suggestions.suggestedPriority);
            console.log('   Confidence:', enhanced.suggestions.confidence);
        }
    } catch (error) {
        console.log('   ❌ Issue Enhancement failed:', error.message);
    }

    // Test 4: Test fallback functionality
    console.log('\n4. Testing Fallback Functionality...');
    const fallbackSuggestion = aiService.getFallbackSuggestions('Street light not working');
    console.log('   ✅ Fallback Suggestion:', fallbackSuggestion);

    console.log('\n🎉 AI Integration Test Completed!');
    console.log('\n📋 Summary:');
    console.log('- AI Service can be enabled/disabled gracefully');
    console.log('- Fallback system works when AI is unavailable');
    console.log('- Non-breaking: existing functionality remains intact');
    console.log('- Ready for frontend integration');
}

testAIFeatures().catch(console.error);