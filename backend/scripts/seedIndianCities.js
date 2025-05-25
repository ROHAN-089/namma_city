const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { fileURLToPath } = require('url');
const { dirname } = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import City model
const City = require('../src/models/City');

// Read and parse the cities data file
const citiesDataPath = path.join(__dirname, '../../frontend/src/data/indianCities.js');
let citiesData = fs.readFileSync(citiesDataPath, 'utf8');

// Extract the array from the ES module export
const indianCitiesMatch = citiesData.match(/export const indianCities = (\[.*?\]);/s);
if (!indianCitiesMatch) {
  throw new Error('Could not find indianCities array in the data file');
}

// Evaluate the array string to get the actual array
const indianCities = eval('(' + indianCitiesMatch[1] + ')');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Seed cities to database
const seedCities = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing cities (optional, comment out if you want to keep existing data)
    await City.deleteMany({});
    console.log('Cleared existing cities');

    // Format cities for database
    const citiesToAdd = indianCities.map(city => ({
      name: city.name,
      state: city.state,
      country: 'India',
      coordinates: {
        type: 'Point',
        coordinates: [city.lng, city.lat] // MongoDB uses [longitude, latitude] order
      },
      cityImage: 'https://res.cloudinary.com/demo/image/upload/v1580125958/samples/landscapes/architecture-signs.jpg',
      departments: []
    }));

    // Insert cities
    const result = await City.insertMany(citiesToAdd);
    console.log(`Successfully seeded ${result.length} cities`);
    
    // Create 2dsphere index for geospatial queries
    await City.collection.createIndex({ coordinates: '2dsphere' });
    console.log('Created 2dsphere index for coordinates field');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding cities:', error);
    process.exit(1);
  }
};

// Run the seeder
seedCities();
