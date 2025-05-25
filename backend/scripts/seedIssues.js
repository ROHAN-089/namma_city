const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../src/models/User');
const City = require('../src/models/City');
const Issue = require('../src/models/Issue');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected for seeding issues');
  seedIssues();
}).catch(err => {
  console.error('Error connecting to database:', err);
  process.exit(1);
});

// Sample issue categories and statuses
const categories = ['roads', 'water', 'electricity', 'sanitation', 'public_safety', 'public_transport', 'pollution', 'others'];
const statuses = ['reported', 'in_progress', 'resolved', 'closed'];
const priorities = ['low', 'medium', 'high', 'urgent'];

// Sample descriptions for different categories
const descriptions = {
  roads: [
    'Pothole damaging vehicles on main street',
    'Road has completely broken down after recent rains',
    'Missing street signs causing confusion',
    'Traffic light not functioning correctly',
    'Narrow road needs widening to handle traffic'
  ],
  water: [
    'Water leakage from main pipeline',
    'Contaminated water supply in residential area',
    'Low water pressure in buildings',
    'Broken water meter needs replacement',
    'Water supply irregular and unpredictable'
  ],
  electricity: [
    'Power outage affecting entire neighborhood',
    'Street lights not working on main avenue',
    'Frequent voltage fluctuations damaging appliances',
    'Electric pole leaning dangerously',
    'Exposed wires creating safety hazard'
  ],
  sanitation: [
    'Garbage not collected for over a week',
    'Public toilet in park requires cleaning',
    'Sewage overflow on street corner',
    'Drains clogged causing water accumulation',
    'Waste dumping in unauthorized area'
  ],
  public_safety: [
    'Street light outage creating unsafe conditions',
    'Abandoned building becoming haven for illegal activities',
    'Missing guardrail on bridge',
    'Traffic signal timing causing near-accidents',
    'Unmonitored construction site posing danger'
  ],
  public_transport: [
    'Bus stop shelter damaged',
    'No bus schedule information available',
    'Bus route frequency insufficient',
    'Taxi stand needed near hospital',
    'Metro station entrance needs better accessibility'
  ],
  pollution: [
    'Industrial waste being dumped in river',
    'Air pollution from nearby factory',
    'Noise pollution from construction site after hours',
    'Excessive dust from unpaved road',
    'Plastic waste accumulating in park'
  ],
  others: [
    'Public park requires maintenance',
    'Community center needs repairs',
    'School playground equipment broken',
    'Public benches vandalized',
    'Historical monument requires restoration'
  ]
};

// Generate a title based on description
function generateTitle(description) {
  return description.split(' ').slice(0, 5).join(' ') + '...';
}

// Generate random coordinates within India
function generateRandomCoordinates() {
  // Approximate bounds for India
  const minLat = 8.0;  // Southmost point
  const maxLat = 37.0; // Northmost point
  const minLng = 68.0; // Westmost point
  const maxLng = 97.0; // Eastmost point
  
  const lat = minLat + Math.random() * (maxLat - minLat);
  const lng = minLng + Math.random() * (maxLng - minLng);
  
  return [lng, lat]; // GeoJSON format is [longitude, latitude]
}

// Generate a random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Create an array of mock issues
async function createMockIssues(users, cities) {
  if (!users.length || !cities.length) {
    console.error('No users or cities found. Please seed users and cities first.');
    return [];
  }

  const issues = [];
  
  // Create 100 random issues
  for (let i = 0; i < 100; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const statusIndex = Math.floor(Math.random() * statuses.length);
    const status = statuses[statusIndex];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    
    // Get random description for the category
    const categoryDescriptions = descriptions[category];
    const description = categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
    
    // Generate coordinates
    const coordinates = generateRandomCoordinates();
    
    // Generate creation and updated dates
    const createdDate = randomDate(new Date(2023, 0, 1), new Date());
    
    const statusHistory = [
      {
        status: 'reported',
        changedBy: user._id,
        timestamp: createdDate,
        note: 'Issue reported'
      }
    ];
    
    // Add status history entries for each status change
    if (statusIndex > 0) {
      for (let j = 1; j <= statusIndex; j++) {
        statusHistory.push({
          status: statuses[j],
          changedBy: users[Math.floor(Math.random() * users.length)]._id,
          timestamp: new Date(createdDate.getTime() + (j * 24 * 60 * 60 * 1000)), // Add days
          note: `Updated to ${statuses[j]}`
        });
      }
    }
    
    // Create the issue object
    issues.push({
      title: generateTitle(description),
      description,
      category,
      priority,
      status,
      location: {
        type: 'Point',
        coordinates,
        address: `Near ${city.name}, ${city.state}`
      },
      city: city._id,
      reportedBy: user._id,
      assignedTo: status !== 'reported' ? (users.find(u => u.role === 'department')?._id || null) : null,
      images: [],
      upvotes: Array.from({ length: Math.floor(Math.random() * 20) }, () => 
        users[Math.floor(Math.random() * users.length)]._id
      ),
      statusHistory,
      createdAt: createdDate,
      updatedAt: statusHistory[statusHistory.length - 1].timestamp
    });
  }
  
  return issues;
}

async function seedIssues() {
  try {
    // Get all users and cities
    const users = await User.find();
    const cities = await City.find();
    
    if (users.length === 0) {
      console.error('No users found. Please seed users first.');
      process.exit(1);
    }
    
    if (cities.length === 0) {
      console.error('No cities found. Please seed cities first.');
      process.exit(1);
    }
    
    // Clear existing issues
    await Issue.deleteMany({});
    console.log('Cleared existing issues');
    
    // Create mock issues
    const mockIssues = await createMockIssues(users, cities);
    
    // Insert issues into database
    await Issue.insertMany(mockIssues);
    console.log(`Successfully seeded ${mockIssues.length} issues`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding issues:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}
