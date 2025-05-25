// Google Gemini API Configuration
export const GEMINI_API_CONFIG = {
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  MODEL: 'gemini-pro',
  MAX_TOKENS: 200
};

// Department mapping for common issues
export const DEPARTMENTS = {
  WATER: {
    name: 'Water Department',
    keywords: ['water', 'leak', 'pipe', 'flood', 'drainage', 'sewage', 'plumbing'],
    description: 'Handles issues related to water supply, leaks, and sewage problems.'
  },
  ELECTRICITY: {
    name: 'Electricity Department',
    keywords: ['electricity', 'power', 'outage', 'blackout', 'streetlight', 'light', 'electric'],
    description: 'Handles issues related to electricity supply, power outages, and street lighting.'
  },
  ROADS: {
    name: 'Roads Department',
    keywords: ['road', 'pothole', 'street', 'pavement', 'traffic', 'signal', 'highway', 'bridge'],
    description: 'Handles issues related to road conditions, potholes, and traffic signals.'
  },
  SANITATION: {
    name: 'Sanitation Department',
    keywords: ['garbage', 'trash', 'waste', 'bin', 'collection', 'cleanliness', 'sanitation', 'dump'],
    description: 'Handles issues related to garbage collection, waste management, and cleanliness.'
  },
  PARKS: {
    name: 'Parks & Recreation',
    keywords: ['park', 'playground', 'garden', 'tree', 'recreation', 'bench', 'lake'],
    description: 'Handles issues related to public parks, gardens, and recreational facilities.'
  }
};
