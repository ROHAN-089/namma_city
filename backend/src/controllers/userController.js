const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const City = require('../models/City');
const generateToken = require('../utils/generateToken');


const registerUser = asyncHandler(async (req, res) => {
  console.log('Request body:', req.body);
  console.log('Request file:', req.file);
  
  const { name, email, password, role, phoneNumber, city, department } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }
  
  // Handle ID proof file for department registration
  let idProofPath = null;
  if (req.file) {
    idProofPath = req.file.path;
    console.log('ID proof file received and processed:', req.file.path);
  } else if (role === 'department') {
    console.log('Warning: No ID proof file received for department registration');
    // If no file but role is department, provide a default value to pass validation
    idProofPath = 'pending_verification';
  }

  // Handle city data - can be either a city name or an ObjectId
  let cityId = null;
  
  if (city) {
    if (typeof city === 'string') {
      // Find or create the city based on name
      let cityData = await City.findOne({ name: { $regex: new RegExp('^' + city.split(',')[0].trim() + '$', 'i') } });
      
      if (!cityData) {
        // Extract state from city string if it contains comma (e.g., "Mumbai, Maharashtra")
        let state = 'Unknown';
        let cityName = city;
        
        if (city.includes(',')) {
          const parts = city.split(',');
          cityName = parts[0].trim();
          state = parts.length > 1 ? parts[1].trim() : 'Unknown';
        }
        
        // Create a new city if it doesn't exist
        cityData = await City.create({
          name: cityName,
          state: state,
          country: 'India',
          coordinates: {
            type: 'Point',
            coordinates: [77.0, 20.0] // Default coordinates for India
          }
        });
      }
      
      cityId = cityData._id;
    } else {
      // If it's already an ObjectId, use it directly
      cityId = city;
    }
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
    role,
    phoneNumber,
    city: cityId,
    department,
    idProof: idProofPath, // Add ID proof path if provided
  });

  if (user) {
    // Populate city data before returning
    const populatedUser = await User.findById(user._id).populate('city', 'name state');
    
    res.status(201).json({
      _id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      phoneNumber: populatedUser.phoneNumber,
      city: populatedUser.city,
      department: populatedUser.department,
      profileImage: populatedUser.profileImage,
      token: generateToken(populatedUser._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    // Populate city information
    const populatedUser = await User.findById(user._id)
      .populate('city', 'name state country coordinates')
      .select('-password');

    res.json({
      _id: populatedUser._id,
      name: populatedUser.name,
      email: populatedUser.email,
      role: populatedUser.role,
      phoneNumber: populatedUser.phoneNumber,
      city: populatedUser.city,
      department: populatedUser.department,
      profileImage: populatedUser.profileImage,
      token: generateToken(populatedUser._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      city: user.city,
      department: user.department,
      profileImage: user.profileImage,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.city = req.body.city || user.city;
    
    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.file) {
      user.profileImage = req.file.path;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      city: updatedUser.city,
      department: updatedUser.department,
      profileImage: updatedUser.profileImage,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});


const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.city = req.body.city || user.city;
    user.department = req.body.department || user.department;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phoneNumber: updatedUser.phoneNumber,
      city: updatedUser.city,
      department: updatedUser.department,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});


const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
