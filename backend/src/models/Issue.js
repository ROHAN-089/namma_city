const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the issue'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description of the issue'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'roads',
      'water',
      'electricity',
      'sanitation',
      'public_safety',
      'public_transport',
      'pollution',
      'others'
    ]
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['reported', 'in_progress', 'resolved', 'closed', 'reopened'],
    default: 'reported'
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Please provide coordinates']
    },
    address: {
      type: String,
      required: [true, 'Please provide an address']
    }
  },
  city: {
    type: mongoose.Schema.Types.Mixed,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  images: [{
    type: String // URLs to Cloudinary images
  }],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  statusHistory: [{
    status: {
      type: String,
      enum: ['reported', 'in_progress', 'resolved', 'closed', 'reopened']
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  closedAt: Date,
  resolvedAt: Date,
  estimatedCompletionTime: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments on this issue
issueSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'issue'
});

// Index for geospatial queries
issueSchema.index({ "location.coordinates": '2dsphere' });

// Method to calculate the time taken to resolve the issue
issueSchema.methods.calculateResolutionTime = function () {
  if (this.resolvedAt && this.createdAt) {
    return this.resolvedAt - this.createdAt; // Time in milliseconds
  }
  return null;
};

// Pre-save hook to update statusHistory automatically
issueSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: Date.now()
    });

    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = Date.now();
    } else if (this.status === 'closed' && !this.closedAt) {
      this.closedAt = Date.now();
    }
  }
  next();
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
