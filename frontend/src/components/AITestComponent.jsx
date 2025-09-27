/**
 * AI Test Component - Simple component to test AI integration
 */
import React, { useState, useEffect } from 'react';
import aiService from '../services/aiService';
import { FaRobot, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const AITestComponent = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAIStatus();
  }, []);

  const checkAIStatus = async () => {
    try {
      const available = await aiService.checkAIStatus();
      setAiStatus(available);
    } catch (error) {
      console.error('AI status check failed:', error);
      setAiStatus(false);
    }
  };

  const testAIFeatures = async () => {
    setLoading(true);
    try {
      // Test quick suggestions
      const suggestions = await aiService.getQuickSuggestions('Pothole on main road', 'Large pothole causing issues');
      setTestResult({
        success: true,
        suggestions,
        message: 'AI suggestions working correctly!'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message,
        message: 'AI test failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <div className="text-center mb-4">
        <FaRobot className="text-4xl text-blue-600 mx-auto mb-2" />
        <h2 className="text-xl font-bold text-gray-800">AI Integration Test</h2>
      </div>

      <div className="space-y-4">
        {/* AI Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="font-medium">AI Service Status:</span>
          <div className="flex items-center">
            {aiStatus === true ? (
              <>
                <FaCheckCircle className="text-green-500 mr-1" />
                <span className="text-green-600 font-medium">Available</span>
              </>
            ) : aiStatus === false ? (
              <>
                <FaTimesCircle className="text-red-500 mr-1" />
                <span className="text-red-600 font-medium">Unavailable</span>
              </>
            ) : (
              <span className="text-gray-500">Checking...</span>
            )}
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={testAIFeatures}
          disabled={!aiStatus || loading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Testing...' : 'Test AI Features'}
        </button>

        {/* Test Results */}
        {testResult && (
          <div className={`p-3 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center mb-2">
              {testResult.success ? (
                <FaCheckCircle className="text-green-500 mr-2" />
              ) : (
                <FaTimesCircle className="text-red-500 mr-2" />
              )}
              <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                {testResult.message}
              </span>
            </div>
            
            {testResult.success && testResult.suggestions && (
              <div className="text-sm text-gray-600">
                <div>Category: <span className="font-medium">{testResult.suggestions.category}</span></div>
                <div>Priority: <span className="font-medium">{testResult.suggestions.priority}</span></div>
                <div>Confidence: <span className="font-medium">{(testResult.suggestions.confidence * 100).toFixed(0)}%</span></div>
              </div>
            )}
            
            {!testResult.success && (
              <div className="text-sm text-red-600">
                Error: {testResult.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AITestComponent;