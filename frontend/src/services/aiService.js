/**
 * AI Service - Frontend service for AI enhancement features
 */
import api from './api';

/**
 * Check if AI service is available
 * @returns {Promise<boolean>}
 */
const checkAIStatus = async () => {
    try {
        const response = await api.get('/ai/status');
        return response.data.aiAvailable;
    } catch (error) {
        console.warn('AI status check failed:', error);
        return false;
    }
};

/**
 * Get quick AI suggestions for partial input
 * @param {string} title - Issue title
 * @param {string} description - Issue description (optional)
 * @returns {Promise<Object>} AI suggestions
 */
const getQuickSuggestions = async (title, description = '') => {
    try {
        const response = await api.post('/ai/quick-suggestions', {
            title,
            description
        });
        return response.data.suggestions;
    } catch (error) {
        console.warn('Quick suggestions failed:', error);
        throw error;
    }
};

/**
 * Get comprehensive AI enhancement for complete issue
 * @param {Object} issueData - Complete issue data
 * @returns {Promise<Object>} AI enhancement results
 */
const enhanceIssue = async (issueData) => {
    try {
        const response = await api.post('/ai/enhance', issueData);
        return response.data;
    } catch (error) {
        console.warn('Issue enhancement failed:', error);
        throw error;
    }
};

/**
 * Test AI service with sample data
 * @returns {Promise<Object>} Test results
 */
const testAIService = async () => {
    try {
        const response = await api.post('/ai/test');
        return response.data;
    } catch (error) {
        console.warn('AI service test failed:', error);
        throw error;
    }
};

/**
 * Get AI-powered department suggestions
 * @param {string} category - Issue category
 * @param {string} description - Issue description
 * @returns {string} Suggested department
 */
const suggestDepartment = (category, description = '') => {
    // Fallback mapping if AI is not available
    const categoryToDepartment = {
        'roads': 'ROADS',
        'water': 'WATER',
        'electricity': 'ELECTRICITY',
        'sanitation': 'WASTE',
        'public_safety': 'PUBLIC_SAFETY',
        'public_transport': 'TRANSPORT',
        'pollution': 'HEALTH',
        'others': 'OTHER'
    };

    return categoryToDepartment[category] || 'OTHER';
};

/**
 * Get priority suggestions based on keywords
 * @param {string} title - Issue title
 * @param {string} description - Issue description
 * @returns {string} Suggested priority
 */
const suggestPriority = (title, description = '') => {
    const text = `${title} ${description}`.toLowerCase();

    // High priority keywords
    const highPriorityKeywords = [
        'emergency', 'urgent', 'danger', 'accident', 'leak', 'burst',
        'flood', 'fire', 'safety', 'hazard', 'broken', 'blocked'
    ];

    // Low priority keywords
    const lowPriorityKeywords = [
        'minor', 'small', 'aesthetic', 'cosmetic', 'paint', 'grass'
    ];

    if (highPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'high';
    }

    if (lowPriorityKeywords.some(keyword => text.includes(keyword))) {
        return 'low';
    }

    return 'medium';
};

export default {
    checkAIStatus,
    getQuickSuggestions,
    enhanceIssue,
    testAIService,
    suggestDepartment,
    suggestPriority
};