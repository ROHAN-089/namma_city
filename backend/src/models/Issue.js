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
    required: false,
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
  department: {
    type: String,
    enum: ['ROADS', 'WATER', 'ELECTRICITY', 'SANITATION', 'PUBLIC_SAFETY', 'TRANSPORT', 'HEALTH', 'OTHER'],
    required: true
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
  // AI Enhancement Fields (Non-Breaking)
  aiProcessed: {
    type: Boolean,
    default: false
  },
  originalUserInput: {
    title: String,
    description: String
  },
  aiMetadata: {
    type: {
      enhancementType: {
        type: String,
        enum: ['generated', 'enhanced', 'none'],
        default: 'none'
      },
      processingTime: Number,
      reasoning: String,
      publicImpactScore: String,
      department: String,
      confidence: Number
    },
    default: null,
    required: false
  },
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
    images: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  statusUpdateImages: [{
    type: String,
    description: 'Images uploaded during status updates by departments'
  }],
  closedAt: Date,
  resolvedAt: Date,
  estimatedCompletionTime: Date,

  // SLA Management Fields
  slaDeadline: {
    type: Date,
    default: function () {
      // Calculate SLA deadline based on priority
      const slaHours = {
        'urgent': 24,
        'high': 72,    // 3 days
        'medium': 168, // 7 days
        'low': 336     // 14 days
      };
      const hours = slaHours[this.priority] || slaHours['medium'];
      return new Date(Date.now() + (hours * 60 * 60 * 1000));
    }
  },
  slaBreached: {
    type: Boolean,
    default: false
  },
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  escalationHistory: [{
    level: {
      type: Number,
      required: true
    },
    escalatedAt: {
      type: Date,
      default: Date.now
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    action: String
  }],
  lastEscalationCheck: {
    type: Date,
    default: Date.now
  }
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

// Virtual count of comments (lightweight for list views)
issueSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'issue',
  count: true
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

// Method to calculate SLA progress percentage
issueSchema.methods.calculateSLAProgress = function () {
  const now = new Date();
  const created = this.createdAt;
  const deadline = this.slaDeadline;

  if (!created || !deadline) return 0;

  const totalTime = deadline - created;
  const elapsedTime = now - created;

  return Math.min(Math.max((elapsedTime / totalTime) * 100, 0), 100);
};

// Method to check if SLA is breached
issueSchema.methods.isSLABreached = function () {
  return new Date() > this.slaDeadline;
};

// Method to get time remaining until SLA deadline
issueSchema.methods.getTimeRemaining = function () {
  const now = new Date();
  const deadline = this.slaDeadline;

  if (!deadline) return null;

  const remaining = deadline - now;
  return remaining > 0 ? remaining : 0;
};

// Method to get escalation level based on SLA progress
issueSchema.methods.getEscalationLevel = function () {
  const progress = this.calculateSLAProgress();

  if (progress >= 100) return 3; // SLA breached
  if (progress >= 80) return 2;  // Urgent
  if (progress >= 50) return 1;  // Warning
  return 0; // Normal
};

// Method to escalate issue
issueSchema.methods.escalate = function (escalatedBy, reason, action) {
  const newLevel = this.getEscalationLevel();

  if (newLevel > this.escalationLevel) {
    this.escalationLevel = newLevel;
    this.escalationHistory.push({
      level: newLevel,
      escalatedBy: escalatedBy,
      reason: reason || `Auto-escalated to level ${newLevel}`,
      action: action || 'Automatic escalation'
    });

    if (newLevel === 3) {
      this.slaBreached = true;
    }
  }

  this.lastEscalationCheck = new Date();
  return this;
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
