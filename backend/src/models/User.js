const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false // Don't return password in query results
  },
  role: {
    type: String,
    enum: ['citizen', 'department', 'admin'],
    default: 'citizen'
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Basic validation for 10 digit phone number
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City'
  },
  department: {
    type: String,
    // Only required if role is department
    required: function() {
      return this.role === 'department';
    }
  },
  profileImage: {
    type: String, // URL to Cloudinary image
    default: 'https://res.cloudinary.com/dnuhcjztp/image/upload/v1748156279/profile_pic.jpg'
  },
  idProof: {
    type: String, // URL to uploaded ID proof document
    // Only required if role is department, but allowing default value
    validate: {
      validator: function(v) {
        // Required for department roles, but can be 'pending'
        return this.role !== 'department' || (v && v.length > 0);
      },
      message: 'ID proof is required for department registration'
    },
    default: function() {
      // Provide a default value for department users
      return this.role === 'department' ? 'pending_verification' : undefined;
    }
  },
  idProofVerified: {
    type: Boolean,
    default: false // Will be set to true by admin after verification
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for issues reported by the user
userSchema.virtual('issues', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'reportedBy'
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
