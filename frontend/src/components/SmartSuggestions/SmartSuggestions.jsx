import React, { useState, useEffect } from 'react';
import { FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';
import aiService from '../../services/aiService';

/**
 * SmartSuggestions - AI-powered suggestions for issue form
 * Non-breaking component that provides optional AI assistance
 */
const SmartSuggestions = ({
    title,
    description,
    currentCategory,
    currentPriority,
    onSuggestionAccept,
    className = ''
}) => {
    const [suggestions, setSuggestions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [aiAvailable, setAiAvailable] = useState(false);

    // Check AI availability on mount
    useEffect(() => {
        checkAIStatus();
    }, []);

    // Get suggestions when title changes
    useEffect(() => {
        if (title && title.length > 3 && aiAvailable) {
            const timeoutId = setTimeout(() => {
                getQuickSuggestions(title, description);
            }, 1000); // Debounce for 1 second

            return () => clearTimeout(timeoutId);
        }
    }, [title, description, aiAvailable]);

    const checkAIStatus = async () => {
        try {
            const available = await aiService.checkAIStatus();
            setAiAvailable(available);
        } catch (error) {
            console.warn('AI status check failed:', error);
            setAiAvailable(false);
        }
    };

    const getQuickSuggestions = async (title, description = '') => {
        if (!aiAvailable || loading) return;

        setLoading(true);
        setError(null);

        try {
            const suggestions = await aiService.getQuickSuggestions(title, description);
            setSuggestions(suggestions);
        } catch (error) {
            console.warn('AI suggestions failed:', error);
            setError('AI suggestions temporarily unavailable');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptSuggestion = (field, value) => {
        if (onSuggestionAccept) {
            onSuggestionAccept(field, value);
        }
    };

    // Don't render if AI is not available
    if (!aiAvailable) {
        return null;
    }

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 ${className}`}>
            <div className="flex items-center mb-3">
                <FaRobot className="text-blue-600 mr-2" />
                <h3 className="text-sm font-semibold text-blue-800">
                    AI Smart Suggestions
                </h3>
                {loading && <FaSpinner className="animate-spin ml-2 text-blue-600" />}
            </div>

            {error && (
                <div className="text-sm text-amber-600 mb-2 flex items-center">
                    <FaLightbulb className="mr-1" />
                    {error}
                </div>
            )}

            {suggestions && !loading && (
                <div className="space-y-2">
                    {/* Category Suggestion */}
                    {suggestions.category && suggestions.category !== currentCategory && (
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-blue-100">
                            <div className="flex-1">
                                <span className="text-xs text-gray-600">Suggested Category:</span>
                                <div className="font-medium text-blue-700 capitalize">
                                    {suggestions.category.replace('_', ' ')}
                                </div>
                            </div>
                            <button
                                onClick={() => handleAcceptSuggestion('category', suggestions.category)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    )}

                    {/* Priority Suggestion */}
                    {suggestions.priority && suggestions.priority !== currentPriority && (
                        <div className="flex items-center justify-between bg-white rounded p-2 border border-blue-100">
                            <div className="flex-1">
                                <span className="text-xs text-gray-600">Suggested Priority:</span>
                                <div className="font-medium text-blue-700 capitalize">
                                    {suggestions.priority}
                                </div>
                            </div>
                            <button
                                onClick={() => handleAcceptSuggestion('priority', suggestions.priority)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    )}

                    {/* Confidence Indicator */}
                    {suggestions.confidence && (
                        <div className="text-xs text-gray-500 flex items-center">
                            <FaLightbulb className="mr-1" />
                            Confidence: {Math.round(suggestions.confidence * 100)}%
                            {suggestions.aiGenerated ? ' (AI)' : ' (Keywords)'}
                        </div>
                    )}
                </div>
            )}

            {!suggestions && !loading && title && title.length > 3 && (
                <div className="text-sm text-gray-500 flex items-center">
                    <FaLightbulb className="mr-1" />
                    Type more details to get AI suggestions...
                </div>
            )}
        </div>
    );
};

export default SmartSuggestions;