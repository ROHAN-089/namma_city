import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_CONFIG, DEPARTMENTS } from "../config/apiConfig";

/**
 * Initialize the Google Generative AI client
 */
const initializeGeminiClient = () => {
  const apiKey = GEMINI_API_CONFIG.API_KEY;
  if (!apiKey) {
    console.error("Gemini API key is missing. Please add it to your .env file.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Detect the intent of the user's message
 * @param {string} message - The user's message
 * @returns {string} - The detected intent: 'greeting', 'report', or 'classify'
 */
const detectIntent = (message) => {
  const lower = message.toLowerCase().trim();
  
  // Check if it's a greeting
  if (/^(hi|hello|hey|greetings|howdy)\b/.test(lower)) {
    return 'greeting';
  }
  
  // Check if it's an intent to report an issue
  if (/report.+issue|i have.+issue|submit.+issue|i want to report|i would like to report/.test(lower)) {
    return 'report';
  }
  
  // Otherwise, classify the issue
  return 'classify';
};

/**
 * Get department suggestion based on user's issue description
 * @param {string} issueText - The user's issue description
 * @returns {Object|null} - The matching department or null if no match
 */
export const getDepartmentSuggestion = (issueText) => {
  if (!issueText) return null;
  
  const lowerIssue = issueText.toLowerCase();
  
  for (const [deptKey, department] of Object.entries(DEPARTMENTS)) {
    for (const keyword of department.keywords) {
      if (lowerIssue.includes(keyword)) {
        return {
          key: deptKey,
          ...department
        };
      }
    }
  }
  
  return null;
};

/**
 * Get a response from the Gemini API based on the user's intent and message
 * @param {string} issueText - The user's message
 * @returns {Promise<string>} - The generated response
 */
export const getGeminiResponse = async (issueText) => {
  try {
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_CONFIG.API_KEY);
    
    if (!genAI) {
      throw new Error("Failed to initialize Gemini API");
    }
    
    const model = genAI.getGenerativeModel({ model: GEMINI_API_CONFIG.MODEL });
    
    // Detect the user's intent
    const intent = detectIntent(issueText);
    
    let prompt;
    
    // Use different prompts based on intent
    switch (intent) {
      case 'greeting':
        return "Hi! How may I help you today?";
        
      case 'report':
        return "What is the issue you are facing?";
        
      case 'classify':
        // For actual issues, use the classification prompt
        prompt = `
          You are a Civic Issue Router bot for a local municipality. Your primary task is to help citizens identify which department to contact for their civic issues.

          Conversation Rules:
          
          1. Initial Greeting:
          If the user says "hi", "hello", or similar greetings, respond with: "Hi! How may I help you today?"
          
          2. Reporting an Issue:
          If the user says "I would like to report an issue", "report an issue", "I have an issue", or similar phrases indicating they want to report something, respond with: "What is the issue you are facing?"
          
          3. Issue Classification:
          For the user's issue: "${issueText}"
          Classify it into one and only one of the "Available Departments".
          Your response for classification should be in this format: "It seems like this issue should be directed to the [Department Name] department."
          
          
          Examples for your understanding (Do NOT repeat these examples to the user):
          - "broken street light near Siddaganga Institute of Technology Tumakuru" → Electricity
          - "pile of garbage" → Sanitation
          - "potholes in my area causing serious accidents" → Roads
          - "no water for 3 days" → Water Supply
          - "damaged bus stop bench" → Public Transport
          - "fallen tree in the park" → Parks & Recreation
          - "stray dog nuisance" → Other
          - "illegal construction noise" → Other
          - "food poisoning after eating street food" → Health Services
          - "someone is burning trash openly" → Health Services

          Available Departments:
          - Roads: Handles road conditions, potholes, and traffic signals
          - Water Supply: Handles water supply, leaks, and sewage problems
          - Electricity: Handles electricity supply, power outages, and street lighting
          - Sanitation: Handles garbage collection, waste management, and cleanliness
          - Parks & Recreation: Handles public parks, gardens, and recreational facilities
          - Public Transport: Handles bus services, bus stops, and public transportation
          - Health Services: Handles public health concerns, hygiene issues, and medical emergencies
          - Other: For issues that don't fit the above categories
          
          Keep your response concise, helpful, and format it exactly as specified above.
        `;
        break;
    }
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting Gemini response:", error);
    return "I'm sorry, I couldn't analyze your issue at the moment. Please try describing your problem differently or contact city services directly.";
  }
};