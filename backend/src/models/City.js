const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a city name'],
    trim: true,
    unique: true
  },
  state: {
    type: String,
    required: [true, 'Please provide a state'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Please provide a country'],
    trim: true,
    default: 'India'
  },
  coordinates: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Please provide coordinates']
    }
  },
  cityImage: {
    type: String, // URL to Cloudinary image
    default: 'https://res.cloudinary.com/demo/image/upload/v1580125958/samples/landscapes/architecture-signs.jpg'
  },
  population: {
    type: Number
  },
  departments: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    contactEmail: String,
    contactPhone: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for issues in this city
citySchema.virtual('issues', {
  ref: 'Issue',
  localField: '_id',
  foreignField: 'city'
});

// Index for geospatial queries
citySchema.index({ coordinates: '2dsphere' });

const City = mongoose.model('City', citySchema);

module.exports = City;
