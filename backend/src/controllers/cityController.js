const asyncHandler = require('express-async-handler');
const City = require('../models/City');

// @desc    Create a new city
// @route   POST /api/cities
// @access  Private/Admin
const createCity = asyncHandler(async (req, res) => {
  const { name, state, country, population, departments, description } = req.body;
  let coordinates;

  // Handle coordinates from frontend
  if (req.body.coordinates) {
    // If coordinates come as an object with lat/lng properties
    if (req.body.coordinates.lat && req.body.coordinates.lng) {
      coordinates = {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.coordinates.lng),
          parseFloat(req.body.coordinates.lat)
        ]
      };
    } 
    // If coordinates come as an array [lng, lat]
    else if (Array.isArray(req.body.coordinates.coordinates)) {
      coordinates = {
        type: 'Point',
        coordinates: req.body.coordinates.coordinates.map(coord => parseFloat(coord))
      };
    }
    // If coordinates already come in GeoJSON format
    else if (req.body.coordinates.type && req.body.coordinates.coordinates) {
      coordinates = req.body.coordinates;
    }
  }

  // Check if city already exists
  const cityExists = await City.findOne({ name });

  if (cityExists) {
    res.status(400);
    throw new Error('City already exists');
  }

  if (!coordinates) {
    res.status(400);
    throw new Error('City coordinates are required');
  }

  // Create new city
  const city = await City.create({
    name,
    state,
    country,
    coordinates,
    population,
    departments,
    description,
    cityImage: req.file ? req.file.path : undefined
  });

  if (city) {
    res.status(201).json(city);
  } else {
    res.status(400);
    throw new Error('Invalid city data');
  }
});

// @desc    Get all cities
// @route   GET /api/cities
// @access  Public
const getCities = asyncHandler(async (req, res) => {
  const cities = await City.find({});
  res.json(cities);
});

// @desc    Get city by ID
// @route   GET /api/cities/:id
// @access  Public
const getCityById = asyncHandler(async (req, res) => {
  const city = await City.findById(req.params.id);

  if (city) {
    res.json(city);
  } else {
    res.status(404);
    throw new Error('City not found');
  }
});

// @desc    Update city
// @route   PUT /api/cities/:id
// @access  Private/Admin
const updateCity = asyncHandler(async (req, res) => {
  const city = await City.findById(req.params.id);

  if (city) {
    city.name = req.body.name || city.name;
    city.state = req.body.state || city.state;
    city.country = req.body.country || city.country;
    city.coordinates = req.body.coordinates || city.coordinates;
    city.population = req.body.population || city.population;
    
    if (req.body.departments) {
      city.departments = req.body.departments;
    }

    if (req.file) {
      city.cityImage = req.file.path;
    }

    const updatedCity = await city.save();
    res.json(updatedCity);
  } else {
    res.status(404);
    throw new Error('City not found');
  }
});

// @desc    Delete city
// @route   DELETE /api/cities/:id
// @access  Private/Admin
const deleteCity = asyncHandler(async (req, res) => {
  const city = await City.findById(req.params.id);

  if (city) {
    await city.remove();
    res.json({ message: 'City removed' });
  } else {
    res.status(404);
    throw new Error('City not found');
  }
});

// @desc    Add a department to a city
// @route   POST /api/cities/:id/departments
// @access  Private/Admin
const addDepartment = asyncHandler(async (req, res) => {
  const { name, description, contactEmail, contactPhone } = req.body;
  const city = await City.findById(req.params.id);

  if (city) {
    city.departments.push({
      name,
      description,
      contactEmail,
      contactPhone
    });

    const updatedCity = await city.save();
    res.status(201).json(updatedCity);
  } else {
    res.status(404);
    throw new Error('City not found');
  }
});

// @desc    Remove a department from a city
// @route   DELETE /api/cities/:id/departments/:departmentId
// @access  Private/Admin
const removeDepartment = asyncHandler(async (req, res) => {
  const city = await City.findById(req.params.id);

  if (city) {
    city.departments = city.departments.filter(
      (dept) => dept._id.toString() !== req.params.departmentId
    );

    const updatedCity = await city.save();
    res.json(updatedCity);
  } else {
    res.status(404);
    throw new Error('City not found');
  }
});

// @desc    Get nearest cities to coordinates
// @route   GET /api/cities/near
// @access  Public
const getNearCities = asyncHandler(async (req, res) => {
  const { lng, lat, maxDistance } = req.query;
  
  if (!lng || !lat) {
    res.status(400);
    throw new Error('Please provide longitude and latitude coordinates');
  }

  const cities = await City.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        },
        $maxDistance: parseInt(maxDistance) || 10000 // Default 10km
      }
    }
  });

  res.json(cities);
});

module.exports = {
  createCity,
  getCities,
  getCityById,
  updateCity,
  deleteCity,
  addDepartment,
  removeDepartment,
  getNearCities,
};
