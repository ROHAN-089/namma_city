const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Issue = require('../models/Issue');
const City = require('../models/City');

// Load environment variables
dotenv.config();

// Sample data with image URLs from the web
const sampleCities = [
  {
    name: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    coordinates: {
      type: 'Point',
      coordinates: [72.8777, 19.0760] // [longitude, latitude]
    },
    cityImage: 'https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    population: 12442373,
    departments: [
      {
        name: 'Municipal Corporation of Greater Mumbai',
        description: 'Responsible for civic infrastructure and administration of Mumbai',
        contactEmail: 'mcgm@mcgm.gov.in',
        contactPhone: '022-22620333'
      }
    ]
  },
  {
    name: 'Delhi',
    state: 'Delhi',
    country: 'India',
    coordinates: {
      type: 'Point',
      coordinates: [77.1025, 28.7041]
    },
    cityImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    population: 16787941,
    departments: [
      {
        name: 'Municipal Corporation of Delhi',
        description: 'Civic body governing the National Capital Territory of Delhi',
        contactEmail: 'mcd@mcdonline.gov.in',
        contactPhone: '011-23230123'
      }
    ]
  },
  {
    name: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    coordinates: {
      type: 'Point',
      coordinates: [77.5946, 12.9716]
    },
    cityImage: 'https://images.unsplash.com/photo-1529514469667-9f1ca9a9c1dd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    population: 8443675,
    departments: [
      {
        name: 'Bruhat Bengaluru Mahanagara Palike',
        description: 'Civic administrative body for the city of Bangalore',
        contactEmail: 'bbmp@bbmp.gov.in',
        contactPhone: '080-22975500'
      }
    ]
  }
];

const sampleIssues = [
  {
    title: 'Large pothole on MG Road',
    description: 'There is a large pothole in the middle of MG Road near Brigade Road junction. It has been causing traffic jams and is a hazard for two-wheelers.',
    category: 'roads',
    priority: 'high',
    status: 'reported',
    location: {
      type: 'Point',
      coordinates: [77.6101, 12.9758],
      address: 'MG Road, Bangalore, Karnataka 560001'
    },
    images: [
      'https://images.unsplash.com/photo-1563453392212-326d5e904890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1563453392212-326d5e904890?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    title: 'Water leakage near Metro Station',
    description: 'Water has been leaking from a broken pipeline near the Rajiv Chowk Metro Station for the past 3 days. This is causing water wastage and inconvenience to pedestrians.',
    category: 'water',
    priority: 'medium',
    status: 'reported',
    location: {
      type: 'Point',
      coordinates: [77.2206, 28.6261],
      address: 'Rajiv Chowk Metro Station, Connaught Place, New Delhi'
    },
    images: [
      'https://images.unsplash.com/photo-1594745064449-8b6d0a2e1a5e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1594745064449-8b6d0a2e1a5e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    title: 'Street light not working',
    description: 'The street light near the park in Bandra West has not been working for over a week. This makes the area unsafe for evening walkers and residents.',
    category: 'electricity',
    priority: 'medium',
    status: 'in_progress',
    location: {
      type: 'Point',
      coordinates: [72.8308, 19.0662],
      address: 'Carter Road, Bandra West, Mumbai, Maharashtra 400050'
    },
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    title: 'Garbage piling up in residential area',
    description: 'Garbage has not been collected for over a week in HSR Layout. The situation is becoming unhygienic and is attracting stray animals.',
    category: 'sanitation',
    priority: 'high',
    status: 'reported',
    location: {
      type: 'Point',
      coordinates: [77.6446, 12.9119],
      address: '27th Main Road, HSR Layout, Bengaluru, Karnataka 560102'
    },
    images: [
      'https://images.unsplash.com/photo-1600585154340-2d1e9c1b8c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1600585154340-2d1e9c1b8c0e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

// Function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({ email: { $ne: 'admin@cityreporter.com' } });
    await City.deleteMany({});
    await Issue.deleteMany({});
    console.log('Cleared existing data');

    // Create a test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'test1234',
      role: 'citizen',
      phoneNumber: '9876543210'
    });

    console.log('Created test user:', testUser.email);

    // Create cities
    const createdCities = await City.insertMany(sampleCities);
    console.log(`Created ${createdCities.length} cities`);

    // Create a map of city names to their IDs
    const cityMap = createdCities.reduce((map, city) => {
      map[city.name] = city._id;
      return map;
    }, {});

    // Create issues with proper city references and test user as reporter
    const issuesWithCityAndUser = sampleIssues.map(issue => ({
      ...issue,
      city: cityMap[getCityFromAddress(issue.location.address)],
      reportedBy: testUser._id,
      statusHistory: [
        {
          status: issue.status,
          changedBy: testUser._id,
          note: 'Issue reported',
          timestamp: new Date()
        }
      ]
    }));

    const createdIssues = await Issue.insertMany(issuesWithCityAndUser);
    console.log(`Created ${createdIssues.length} issues`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Helper function to extract city from address
const getCityFromAddress = (address) => {
  const cityMatch = address.match(/\b(Bangalore|Mumbai|Delhi|Kolkata|Chennai|Hyderabad|Pune|Ahmedabad)\b/i);
  return cityMatch ? cityMatch[0] : 'Bangalore';
};

// Run the seed function
seedDatabase();
