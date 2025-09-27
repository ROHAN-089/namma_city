/**
 * AI Enhancement Service - Optional AI processing for issues
 * This service enhances existing issues WITHOUT breaking current functionality
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIEnhancementService {
  constructor() {
    this.genAI = null;
    this.isEnabled = false;
    
    // Initialize Gemini AI if API key is available
    if (process.env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.isEnabled = true;
        console.log('✅ AI Enhancement Service initialized');
      } catch (error) {
        console.warn('⚠️ AI Enhancement Service failed to initialize:', error.message);
      }
    } else {
      console.log('ℹ️ AI Enhancement Service disabled (no GEMINI_API_KEY)');
    }
  }

  /**
   * Check if AI service is available
   * @returns {boolean}
   */
  isAvailable() {
    return this.isEnabled && this.genAI;
  }

  /**
   * MAIN FUNCTION: Complete issue processing with Gemini
   * @param {Object} issueData - User's basic input
   * @returns {Object} Fully processed issue data
   */
  async processCompleteIssue(issueData) {
    const startTime = Date.now();
    
    // Always store original user input
    const originalInput = {
      title: issueData.title,
      description: issueData.description || ''
    };

    // If AI is not available, use enhanced fallback
    if (!this.isAvailable()) {
      return this.intelligentFallbackProcessing(issueData, originalInput, startTime);
    }

    try {
      const aiResult = await this.generateCompleteProcessing(issueData);
      const processingTime = Date.now() - startTime;
      
      return {
        // Enhanced issue data
        title: aiResult.enhancedTitle || issueData.title,
        description: aiResult.description,
        category: aiResult.category,
        priority: aiResult.priority,
        
        // Original fields preserved
        location: issueData.location,
        city: issueData.city,
        images: issueData.images || [],
        
        // AI metadata
        aiProcessed: true,
        originalUserInput: originalInput,
        aiMetadata: {
          enhancementType: originalInput.description ? 'enhanced' : 'generated',
          processingTime: processingTime,
          reasoning: aiResult.reasoning,
          publicImpactScore: aiResult.publicImpact,
          department: aiResult.department,
          confidence: aiResult.confidence || 0.8
        }
      };
    } catch (error) {
      console.warn('AI processing failed, using intelligent fallback:', error.message);
      return this.intelligentFallbackProcessing(issueData, originalInput, startTime);
    }
  }

  /**
   * Enhanced fallback processing when AI fails
   * @param {Object} issueData
   * @param {Object} originalInput  
   * @param {Number} startTime
   * @returns {Object}
   */
  intelligentFallbackProcessing(issueData, originalInput, startTime) {
    const classification = this.classifyIssueByKeywords(issueData.title, issueData.description || '');
    const processingTime = Date.now() - startTime;
    
    return {
      title: issueData.title,
      description: issueData.description || this.generateFallbackDescription(issueData.title, issueData.location),
      category: classification.category,
      priority: classification.priority,
      
      location: issueData.location,
      city: issueData.city,
      images: issueData.images || [],
      
      aiProcessed: false,
      originalUserInput: originalInput,
      aiMetadata: {
        enhancementType: 'fallback',
        processingTime: processingTime,
        reasoning: 'AI unavailable, used keyword-based classification',
        publicImpactScore: 'medium',
        department: this.mapCategoryToDepartment(classification.category),
        confidence: 0.7
      }
    };
  }

  /**
   * Generate complete AI processing
   * @param {Object} issueData
   * @returns {Object}
   */
  async generateCompleteProcessing(issueData) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = this.buildPrompt(issueData);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseCompleteAIResponse(text);
  }

  /**
   * Parse comprehensive AI response
   * @param {string} text
   * @returns {Object}
   */
  parseCompleteAIResponse(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const aiResult = JSON.parse(jsonMatch[0]);
      
      return {
        enhancedTitle: aiResult.enhancedTitle,
        description: aiResult.description,
        category: aiResult.category || 'others',
        priority: aiResult.priority || 'medium',
        department: aiResult.department || 'OTHER',
        reasoning: aiResult.reasoning || 'AI processing completed',
        publicImpact: aiResult.publicImpact || 'medium',
        urgencyFactors: aiResult.urgencyFactors || [],
        confidence: aiResult.confidence || 0.8
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('AI response parsing failed');
    }
  }

  /**
   * Map category to department
   * @param {string} category
   * @returns {string}
   */
  mapCategoryToDepartment(category) {
    const mapping = {
      'roads': 'ROADS',
      'water': 'WATER', 
      'electricity': 'ELECTRICITY',
      'sanitation': 'SANITATION',
      'public_safety': 'PUBLIC_SAFETY',
      'public_transport': 'TRANSPORT',
      'pollution': 'HEALTH',
      'others': 'OTHER'
    };
    return mapping[category] || 'OTHER';
  }

  /**
   * Generate fallback description
   * @param {string} title
   * @param {Object} location
   * @returns {string}
   */
  generateFallbackDescription(title, location) {
    const locationStr = location?.address ? ` at ${location.address}` : '';
    return `${title}${locationStr}. This civic issue has been reported and requires attention from the appropriate municipal department. The issue details have been logged for further assessment and resolution.`;
  }

  /**
   * Generate AI suggestions for issue
   * @param {Object} issueData
   * @returns {Object} AI suggestions
   */
  async generateSuggestions(issueData) {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    
    const prompt = this.buildPrompt(issueData);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return this.parseAISuggestions(text);
  }

  /**
   * Build prompt for comprehensive issue processing
   * @param {Object} issueData
   * @returns {string}
   */
  buildPrompt(issueData) {
    return `You are an expert civic assistant for Indian municipal systems. 

TASK: Process this civic issue report and provide complete classification.

DEPARTMENTS: ROADS, WATER, ELECTRICITY, SANITATION, PUBLIC_SAFETY, TRANSPORT, PARKS, OTHERS

CATEGORIES: roads, water, electricity, sanitation, public_safety, public_transport, pollution, others

PRIORITIES: low, medium, high, urgent

USER INPUT:
Title: "${issueData.title}"
Description: "${issueData.description || 'Not provided'}"
Location: "${issueData.location?.address || 'Not specified'}"
City: "${issueData.city || 'Not specified'}"

REQUIREMENTS:
1. If description is missing/poor, generate a comprehensive one
2. If description exists, enhance it with relevant details and context
3. Classify to appropriate department and category
4. Assign priority based on public safety impact and urgency
5. Use professional, clear language
6. Include context like safety risks, public impact, urgency indicators

RESPOND IN JSON:
{
  "department": "DEPARTMENT_NAME",
  "category": "category_name", 
  "priority": "priority_level",
  "enhancedTitle": "Improved title if needed",
  "description": "Complete professional description",
  "reasoning": "Brief explanation of classification",
  "urgencyFactors": ["factor1", "factor2"],
  "publicImpact": "high|medium|low",
  "confidence": 0.95
}

Consider:
- Public safety implications
- Infrastructure importance  
- Seasonal relevance (monsoon, winter, summer)
- Location context (schools, hospitals, commercial areas)
- Time sensitivity

Return only valid JSON.`;
  }

  /**
   * Parse AI suggestions
   * @param {string} text
   * @returns {Object}
   */
  parseAISuggestions(text) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const suggestions = JSON.parse(jsonMatch[0]);
      
      return {
        suggestedCategory: suggestions.suggestedCategory || null,
        suggestedPriority: suggestions.suggestedPriority || null,
        suggestedDepartment: suggestions.suggestedDepartment || null,
        enhancedDescription: suggestions.enhancedDescription || null,
        reasoning: suggestions.reasoning || 'AI analysis completed',
        confidence: suggestions.confidence || 0.5
      };
    } catch (error) {
      console.warn('Failed to parse AI suggestions:', error.message);
      return {
        suggestedCategory: null,
        suggestedPriority: null,
        suggestedDepartment: null,
        enhancedDescription: null,
        reasoning: 'AI parsing failed',
        confidence: 0
      };
    }
  }

  /**
   * Get smart suggestions for partial input (for frontend autocomplete)
   * @param {string} partialTitle
   * @param {string} partialDescription
   * @returns {Object} Quick suggestions
   */
  async getQuickSuggestions(partialTitle, partialDescription = '') {
    if (!this.isAvailable() || !partialTitle || partialTitle.length < 3) {
      return this.getFallbackSuggestions(partialTitle);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `Based on this partial civic issue, suggest category and priority in JSON:

Title: ${partialTitle}
Description: ${partialDescription}

Respond with JSON only:
{"category": "suggested_category", "priority": "suggested_priority", "confidence": 0.8}

Categories: roads, water, electricity, sanitation, public_safety, public_transport, pollution, others
Priorities: low, medium, high, urgent`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const suggestion = JSON.parse(jsonMatch[0]);
        return {
          category: suggestion.category || 'others',
          priority: suggestion.priority || 'medium',
          confidence: suggestion.confidence || 0.5,
          aiGenerated: true
        };
      }
    } catch (error) {
      console.warn('Quick suggestions failed:', error.message);
    }

    // Fallback to keyword-based suggestions
    return this.getFallbackSuggestions(partialTitle);
  }

  /**
   * Fallback keyword-based suggestions
   * @param {string} text
   * @returns {Object}
   */
  getFallbackSuggestions(text) {
    const keywords = {
      roads: ['road', 'pothole', 'street', 'traffic', 'pavement'],
      water: ['water', 'pipe', 'leak', 'drainage', 'flood'],
      electricity: ['light', 'power', 'electric', 'current', 'outage'],
      sanitation: ['garbage', 'waste', 'clean', 'dump', 'litter'],
      public_safety: ['safe', 'crime', 'danger', 'accident', 'emergency']
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, categoryKeywords] of Object.entries(keywords)) {
      if (categoryKeywords.some(keyword => lowerText.includes(keyword))) {
        return {
          category,
          priority: category === 'public_safety' ? 'high' : 'medium',
          confidence: 0.7,
          aiGenerated: false
        };
      }
    }

    return {
      category: 'others',
      priority: 'medium',
      confidence: 0.5,
      aiGenerated: false
    };
  }

  /**
   * Classify issue by keywords (fallback method)
   * @param {string} title
   * @param {string} description
   * @returns {Object}
   */
  classifyIssueByKeywords(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    // Road-related keywords
    if (text.match(/road|street|pothole|traffic|signal|crossing|highway|lane/)) {
      return {
        category: 'roads',
        priority: text.match(/urgent|emergency|dangerous|accident/) ? 'urgent' : 'high',
        department: 'PUBLIC_WORKS',
        confidence: 0.8
      };
    }
    
    // Water-related keywords
    if (text.match(/water|pipe|leak|supply|drainage|sewage|overflow/)) {
      return {
        category: 'water',
        priority: text.match(/burst|overflow|contaminated/) ? 'urgent' : 'medium',
        department: 'WATER_WORKS',
        confidence: 0.8
      };
    }
    
    // Electricity-related keywords
    if (text.match(/light|electricity|power|transformer|cable|wire|outage/)) {
      return {
        category: 'electricity',
        priority: text.match(/outage|dangerous|sparking/) ? 'urgent' : 'medium',
        department: 'ELECTRICITY_BOARD',
        confidence: 0.8
      };
    }
    
    // Sanitation-related keywords
    if (text.match(/garbage|waste|sanitation|toilet|cleaning|dump/)) {
      return {
        category: 'sanitation',
        priority: 'medium',
        department: 'SANITATION',
        confidence: 0.7
      };
    }
    
    // Public safety-related keywords
    if (text.match(/safety|crime|police|security|emergency|accident/)) {
      return {
        category: 'public_safety',
        priority: 'high',
        department: 'PUBLIC_SAFETY',
        confidence: 0.8
      };
    }
    
    // Default classification
    return {
      category: 'others',
      priority: 'medium',
      department: 'OTHER',
      confidence: 0.5
    };
  }

  /**
   * Generate fallback description when AI is not available
   * @param {string} title
   * @param {Object} location
   * @returns {string}
   */
  generateFallbackDescription(title, location) {
    const locationStr = location?.address || 'Location not specified';
    return `Issue reported: ${title}. Location: ${locationStr}. This issue requires attention from the municipal authorities.`;
  }
}

module.exports = new AIEnhancementService();